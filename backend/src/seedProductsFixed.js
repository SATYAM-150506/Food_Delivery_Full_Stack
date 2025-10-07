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
    imageUrl: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=500&h=400&fit=crop',
    rating: {
      average: 4.5,
      count: 128
    },
    inStock: true
  },
  {
    name: 'Viren',
    description: 'Juicy Viren',
    price: 19999,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop',
    rating: {
      average: 4.3,
      count: 95
    },
    inStock: true
  },
  {
    name: 'Pepperoni Pizza',
    description: 'Delicious pizza topped with spicy pepperoni and mozzarella cheese',
    price: 349,
    category: 'Pizza',
    imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500&h=400&fit=crop',
    rating: {
      average: 4.6,
      count: 156
    },
    inStock: true
  },
  {
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheese, lettuce, tomato, and special sauce',
    price: 199,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=500&h=400&fit=crop',
    rating: {
      average: 4.3,
      count: 95
    },
    inStock: true
  },
  {
    name: 'Veggie Burger',
    description: 'Plant-based patty with fresh vegetables and vegan mayo',
    price: 179,
    category: 'Burger',
    imageUrl: 'https://images.unsplash.com/photo-1525059696034-4967a729002e?w=500&h=400&fit=crop',
    rating: {
      average: 4.2,
      count: 78
    },
    inStock: true
  },
  {
    name: 'Chicken Biryani',
    description: 'Aromatic basmati rice cooked with tender chicken and traditional spices',
    price: 249,
    category: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1642821373181-696a54913e93?w=500&h=400&fit=crop',
    rating: {
      average: 4.7,
      count: 203
    },
    inStock: true
  },
  {
    name: 'Paneer Butter Masala',
    description: 'Creamy curry with soft paneer cubes in rich tomato-based gravy',
    price: 219,
    category: 'Indian',
    imageUrl: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=500&h=400&fit=crop',
    rating: {
      average: 4.4,
      count: 167
    },
    inStock: true
  },
  {
    name: 'Chicken Hakka Noodles',
    description: 'Stir-fried noodles with chicken and vegetables in Chinese sauce',
    price: 189,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500&h=400&fit=crop',
    rating: {
      average: 4.1,
      count: 89
    },
    inStock: true
  },
  {
    name: 'Veg Fried Rice',
    description: 'Wok-tossed rice with fresh vegetables and aromatic spices',
    price: 159,
    category: 'Chinese',
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=500&h=400&fit=crop',
    rating: {
      average: 4.0,
      count: 67
    },
    inStock: true
  },
  {
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan, croutons and caesar dressing',
    price: 159,
    category: 'Snacks',
    imageUrl: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=500&h=400&fit=crop',
    rating: {
      average: 3.9,
      count: 52
    },
    inStock: true
  },
  {
    name: 'Chocolate Brownie',
    description: 'Rich, fudgy brownie served warm with vanilla ice cream',
    price: 129,
    category: 'Desserts',
    imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&h=400&fit=crop',
    rating: {
      average: 4.8,
      count: 134
    },
    inStock: true
  },
  {
    name: 'Fresh Orange Juice',
    description: 'Freshly squeezed orange juice packed with vitamin C',
    price: 79,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500&h=400&fit=crop',
    rating: {
      average: 4.0,
      count: 45
    },
    inStock: true
  },
  
  {
    name: 'Masala Chai',
    description: 'Traditional Indian spiced tea brewed to perfection',
    price: 49,
    category: 'Drinks',
    imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&h=400&fit=crop',
    rating: {
      average: 4.3,
      count: 156
    },
    inStock: true
  }
];

async function seedProducts() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to database');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Existing products cleared');

    // Insert sample products
    const products = await Product.insertMany(sampleProducts);
    console.log(`${products.length} sample products inserted successfully!`);

    // Disconnect
    mongoose.disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error seeding products:', error);
    mongoose.disconnect();
  }
}

seedProducts();
