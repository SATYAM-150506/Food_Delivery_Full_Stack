// Food category default images
const categoryImages = {
  'Pizza': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500&h=400&fit=crop',
  'Burger': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&h=400&fit=crop',
  'Indian': 'https://images.unsplash.com/photo-1563379091339-03246963d51d?w=500&h=400&fit=crop',
  'Chinese': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop',
  'Snacks': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop',
  'Desserts': 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop',
  'Drinks': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop' // Generic food image
};

// Get appropriate default image based on category or food name
export const getDefaultFoodImage = (category = '', name = '') => {
  // First try to match by category
  if (category && categoryImages[category]) {
    return categoryImages[category];
  }
  
  // Try to match by food name keywords
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('pizza')) {
    return categoryImages['Pizza'];
  } else if (lowerName.includes('burger')) {
    return categoryImages['Burger'];
  } else if (lowerName.includes('biryani') || lowerName.includes('masala') || lowerName.includes('curry')) {
    return categoryImages['Indian'];
  } else if (lowerName.includes('noodles') || lowerName.includes('rice') || lowerName.includes('fried')) {
    return categoryImages['Chinese'];
  } else if (lowerName.includes('salad') || lowerName.includes('sandwich')) {
    return categoryImages['Snacks'];
  } else if (lowerName.includes('brownie') || lowerName.includes('cake') || lowerName.includes('dessert')) {
    return categoryImages['Desserts'];
  } else if (lowerName.includes('juice') || lowerName.includes('tea') || lowerName.includes('coffee') || lowerName.includes('drink')) {
    return categoryImages['Drinks'];
  }
  
  // Default fallback
  return categoryImages['default'];
};

// Get image source with fallback
export const getFoodImageSrc = (product) => {
  if (!product) return categoryImages['default'];
  
  // Priority: imageUrl -> image -> category-based default
  return product.imageUrl || 
         product.image || 
         getDefaultFoodImage(product.category, product.name);
};

// Handle image error with category-specific fallback
export const handleImageError = (e, product) => {
  if (product) {
    e.target.src = getDefaultFoodImage(product.category, product.name);
  } else {
    e.target.src = categoryImages['default'];
  }
};

export default {
  getDefaultFoodImage,
  getFoodImageSrc,
  handleImageError,
  categoryImages
};