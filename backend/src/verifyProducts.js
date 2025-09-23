const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

async function verifyProducts() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to database');
    
    const products = await Product.find({});
    console.log(`\nFound ${products.length} products in database:`);
    
    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Category: ${product.category}`);
      console.log(`   Price: ₹${product.price}`);
      console.log(`   Rating: ${product.rating.average} (${product.rating.count} reviews)`);
      console.log(`   In Stock: ${product.inStock ? 'Yes' : 'No'}`);
      console.log('');
    });
    
    const categories = [...new Set(products.map(p => p.category))];
    console.log(`Categories available: ${categories.join(', ')}\n`);
    
    mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyProducts();
