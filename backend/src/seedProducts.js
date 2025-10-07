const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Product = require('./models/Product');
const connectDB = require('./config/db');

dotenv.config();

const sampleProducts = [
  {
    name: 'Margherita Pizza',
    description: 'Classic pizza with fresh mozzarella, tomato sauce, and basil leaves',
    price: 299,
    category: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500',
    rating: 4.5,
    reviews: 128,
    deliveryTime: '25-30 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Viren',
    description: 'Juicy Viren',
    price: 19999,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop',
    rating: 4.3,
    reviews: 95,
    deliveryTime: '20-25 min',
    isVegetarian: false,
    isAvailable: true
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with spicy pepperoni and mozzarella cheese',
    price: 349,
    category: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500',
    rating: 4.6,
    reviews: 156,
    deliveryTime: '25-30 min',
    isVegetarian: false,
    isAvailable: true
  },
  {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    price: 199,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500',
    rating: 4.3,
    reviews: 95,
    deliveryTime: '20-25 min',
    isVegetarian: false,
    isAvailable: true
  },
  {
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables and vegan sauce',
    price: 179,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=500',
    rating: 4.2,
    reviews: 67,
    deliveryTime: '20-25 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice with tender chicken pieces and exotic spices',
    price: 249,
    category: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03246963d51a?w=500',
    rating: 4.7,
    reviews: 156,
    deliveryTime: '30-35 min',
    isVegetarian: false,
    isAvailable: true
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy paneer curry with aromatic spices',
    price: 219,
    category: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500',
    rating: 4.6,
    reviews: 142,
    deliveryTime: '25-30 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Chicken Hakka Noodles',
    description: 'Stir-fried noodles with chicken and fresh vegetables',
    price: 189,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=500',
    rating: 4.2,
    reviews: 87,
    deliveryTime: '25-30 min',
    isVegetarian: false,
    isAvailable: true
  },
  {
    name: 'Veg Fried Rice',
    description: 'Wok-fried rice with mixed vegetables and soy sauce',
    price: 159,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500',
    rating: 4.1,
    reviews: 73,
    deliveryTime: '20-25 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with caesar dressing, croutons, and parmesan',
    price: 159,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500',
    rating: 4.1,
    reviews: 64,
    deliveryTime: '15-20 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich and fudgy chocolate brownie served warm with vanilla ice cream',
    price: 129,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1541783245831-57d6fb0d54c2?w=500',
    rating: 4.4,
    reviews: 89,
    deliveryTime: '15-20 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice packed with vitamin C',
    price: 79,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500',
    rating: 4.0,
    reviews: 45,
    deliveryTime: '10-15 min',
    isVegetarian: true,
    isAvailable: true
  },
  {
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea brewed to perfection',
    price: 49,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1571934811086-9c1b8b0e4d18?w=500',
    rating: 4.3,
    reviews: 156,
    deliveryTime: '10-15 min',
    isVegetarian: true,
    isAvailable: true
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to database');
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');
    
    // Insert sample products
    await Product.insertMany(sampleProducts);
    console.log(`${sampleProducts.length} sample products inserted successfully!`);
    
    mongoose.connection.close();
  } catch (err) {
    console.error('❌ Seeding error:', err);
    mongoose.connection.close();
    process.exit(1);
  }
}

seed();
