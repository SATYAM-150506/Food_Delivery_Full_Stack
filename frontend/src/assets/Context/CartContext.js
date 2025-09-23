import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';
import cartService from '../services/cartService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    fetchCart();
  }, [user, isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchCart = async () => {
    setLoading(true);
    try {
      if (isAuthenticated && user) {
        console.log('🔄 Loading cart from backend for user:', user._id);
        // For authenticated users, fetch from backend
        const cartData = await cartService.getCart();
        
        // Check for guest cart to merge
        const guestCartKey = 'guestCart';
        const localGuestCart = JSON.parse(localStorage.getItem(guestCartKey) || '[]');
        
        if (localGuestCart.length > 0) {
          console.log('🔄 Merging guest cart with user cart...');
          // Merge guest cart with backend cart
          const mergedCart = mergeGuestCartWithBackend(localGuestCart, cartData.items || []);
          
          // Save merged cart to backend
          await cartService.updateCart(mergedCart);
          setCart(mergedCart);
          
          // Clear guest cart after merging
          localStorage.removeItem(guestCartKey);
          console.log('✅ Guest cart merged and saved to backend');
        } else {
          setCart(cartData.items || []);
          console.log('✅ User cart loaded from backend:', cartData.items?.length || 0, 'items');
        }
      } else {
        console.log('🔄 Loading guest cart from localStorage');
        // For guests, load from localStorage with user-specific key
        const guestCartKey = 'guestCart';
        const localCart = JSON.parse(localStorage.getItem(guestCartKey) || '[]');
        setCart(localCart);
        console.log('✅ Guest cart loaded:', localCart.length, 'items');
      }
    } catch (error) {
      console.error('❌ Failed to fetch cart:', error);
      // Fallback to localStorage
      const fallbackKey = isAuthenticated && user ? `userCart_${user._id}` : 'guestCart';
      const localCart = JSON.parse(localStorage.getItem(fallbackKey) || '[]');
      setCart(localCart);
      console.log('⚠️ Using fallback cart from localStorage');
    } finally {
      setLoading(false);
    }
  };

  const mergeGuestCartWithBackend = (guestCart, backendCart) => {
    const mergedCart = [...backendCart];
    
    guestCart.forEach(guestItem => {
      const existingIndex = mergedCart.findIndex(
        backendItem => backendItem.product?._id === guestItem._id || backendItem._id === guestItem._id
      );
      
      if (existingIndex > -1) {
        // Item exists, add quantities
        mergedCart[existingIndex].quantity += guestItem.quantity;
      } else {
        // New item, add to cart
        mergedCart.push({
          product: guestItem,
          quantity: guestItem.quantity,
          _id: guestItem._id
        });
      }
    });
    
    return mergedCart;
  };

  const saveToLocalStorage = (cartData) => {
    const cartKey = isAuthenticated && user ? `userCart_${user._id}` : 'guestCart';
    localStorage.setItem(cartKey, JSON.stringify(cartData));
    console.log('💾 Cart saved to localStorage with key:', cartKey);
  };

  const addToCart = async (product, quantity = 1) => {
    try {
      console.log('🛒 Adding to cart:', product.name, 'x', quantity);
      
      if (isAuthenticated && user) {
        // For authenticated users, use backend
        const updatedCart = await cartService.addToCart(product._id, quantity);
        setCart(updatedCart.items || updatedCart);
        console.log('✅ Added to backend cart');
      } else {
        // For guests, use localStorage
        const currentCart = [...cart];
        const existingItemIndex = currentCart.findIndex(item => {
          const itemId = item.product?._id || item._id;
          return itemId === product._id;
        });
        
        if (existingItemIndex > -1) {
          currentCart[existingItemIndex].quantity += quantity;
        } else {
          currentCart.push({ 
            product: product, 
            quantity,
            _id: product._id 
          });
        }
        
        setCart(currentCart);
        saveToLocalStorage(currentCart);
        console.log('✅ Added to guest cart');
      }
    } catch (error) {
      console.error('❌ Failed to add to cart:', error);
      // Fallback to localStorage even for authenticated users if backend fails
      const currentCart = [...cart];
      const existingItemIndex = currentCart.findIndex(item => {
        const itemId = item.product?._id || item._id;
        return itemId === product._id;
      });
      
      if (existingItemIndex > -1) {
        currentCart[existingItemIndex].quantity += quantity;
      } else {
        currentCart.push({ 
          product: product, 
          quantity,
          _id: product._id 
        });
      }
      
      setCart(currentCart);
      saveToLocalStorage(currentCart);
      console.log('⚠️ Added to fallback cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      console.log('🔄 Updating quantity:', productId, 'to', quantity);
      
      if (isAuthenticated && user) {
        // For authenticated users, use backend
        const updatedCart = await cartService.updateCartItem(productId, quantity);
        setCart(updatedCart.items || updatedCart);
        console.log('✅ Quantity updated in backend');
      } else {
        // For guests, use localStorage
        const currentCart = cart.map(item => {
          const itemId = item.product?._id || item._id;
          return itemId === productId ? { ...item, quantity } : item;
        }).filter(item => item.quantity > 0);
        
        setCart(currentCart);
        saveToLocalStorage(currentCart);
        console.log('✅ Quantity updated in guest cart');
      }
    } catch (error) {
      console.error('❌ Failed to update quantity:', error);
      // Fallback to localStorage
      const currentCart = cart.map(item => {
        const itemId = item.product?._id || item._id;
        return itemId === productId ? { ...item, quantity } : item;
      }).filter(item => item.quantity > 0);
      
      setCart(currentCart);
      saveToLocalStorage(currentCart);
      console.log('⚠️ Quantity updated in fallback cart');
    }
  };

  const removeFromCart = async (productId) => {
    try {
      console.log('🗑️ Removing from cart:', productId);
      
      if (isAuthenticated && user) {
        // For authenticated users, use backend
        const updatedCart = await cartService.removeFromCart(productId);
        setCart(updatedCart.items || updatedCart);
        console.log('✅ Removed from backend cart');
      } else {
        // For guests, use localStorage
        const currentCart = cart.filter(item => {
          const itemId = item.product?._id || item._id;
          return itemId !== productId;
        });
        setCart(currentCart);
        saveToLocalStorage(currentCart);
        console.log('✅ Removed from guest cart');
      }
    } catch (error) {
      console.error('❌ Failed to remove from cart:', error);
      // Fallback to localStorage
      const currentCart = cart.filter(item => {
        const itemId = item.product?._id || item._id;
        return itemId !== productId;
      });
      setCart(currentCart);
      saveToLocalStorage(currentCart);
      console.log('⚠️ Removed from fallback cart');
    }
  };

  const clearCart = async () => {
    try {
      console.log('🧹 Clearing cart...');
      
      if (isAuthenticated && user) {
        await cartService.clearCart();
        console.log('✅ Backend cart cleared');
      }
      
      setCart([]);
      
      // Clear all possible cart keys
      localStorage.removeItem('guestCart');
      if (user) {
        localStorage.removeItem(`userCart_${user._id}`);
      }
      
      console.log('✅ All carts cleared');
    } catch (error) {
      console.error('❌ Failed to clear cart:', error);
      setCart([]);
      localStorage.removeItem('guestCart');
      if (user) {
        localStorage.removeItem(`userCart_${user._id}`);
      }
      console.log('⚠️ Fallback cart clear completed');
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.product?.price || item.price;
      return total + (price * item.quantity);
    }, 0);
  };

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Additional methods for better cart management
  const updateCartItemQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
    } else {
      await updateQuantity(productId, quantity);
    }
  };

  const getCartItem = (productId) => {
    return cart.find(item => {
      const itemId = item.product?._id || item._id;
      return itemId === productId;
    });
  };

  const isInCart = (productId) => {
    return cart.some(item => {
      const itemId = item.product?._id || item._id;
      return itemId === productId;
    });
  };

  return (
    <CartContext.Provider value={{
      cart,
      cartItems: cart, // For backward compatibility
      loading,
      addToCart,
      updateQuantity,
      updateCartItemQuantity,
      removeFromCart,
      clearCart,
      fetchCart,
      getCartTotal,
      getCartItemsCount,
      getCartItem,
      isInCart,
      cartTotal: getCartTotal(),
      cartCount: getCartItemsCount()
    }}>
      {children}
    </CartContext.Provider>
  );
};
