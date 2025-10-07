const mongoose = require('mongoose');
const Order = require('./models/Order');

// Connect to database
mongoose.connect('mongodb://localhost:27017/food_delivery', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function testOrder() {
  try {
    console.log('Testing Order model...');
    
    // Example: Find all orders
    const orders = await Order.find().limit(5);
    console.log(`Found ${orders.length} orders in database`);
    
    if (orders.length > 0) {
      console.log('Sample order:', orders[0]);
    }
    
    // Close connection
    await mongoose.connection.close();
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Error testing Order model:', error);
  }
}

testOrder();