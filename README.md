# 🍔 Food Delivery App

A comprehensive food delivery application built with React.js, Node.js, Express, and MongoDB.

## 🌟 Features

### User Features
- **User Authentication**: Register, login, and 7-day session persistence
- **Menu Browsing**: View products with categories, search, and filtering
- **Cart Management**: User-specific cart with persistence
- **Order Placement**: Multi-step checkout with address and payment options
- **Order Tracking**: Real-time order status updates
- **Order History**: View past orders with detailed information
- **User Profile**: Manage personal information and preferences

### Advanced Features
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Live order status notifications
- **Payment Integration**: Cash on delivery and online payment options
- **Delivery Partner Assignment**: Automatic partner assignment with 15-minute gaps
- **Rating System**: Rate orders and delivery experience
- **Toast Notifications**: Visual feedback for user actions
- **Admin Dashboard**: Manage orders, products, and users

## 🚀 Technology Stack

### Frontend
- **React 19.1.1**: Modern React with hooks and context
- **React Router Dom**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **React Icons**: Icon library
- **Axios**: HTTP client
- **JWT Decode**: Token management

### Backend
- **Node.js & Express**: Server-side runtime and framework
- **MongoDB & Mongoose**: Database and ODM
- **JWT**: Authentication
- **bcryptjs**: Password hashing
- **CORS**: Cross-origin resource sharing
- **Cookie Parser**: Cookie handling
- **Razorpay**: Payment processing
- **Nodemailer**: Email notifications
- **Winston**: Logging

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.0 or higher)
- npm or yarn

## 🛠️ Installation

### Quick Setup (Windows)
```bash
# Run the setup script
setup.bat
```

### Manual Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd food_delievery2
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Variables**
   
   Backend (.env in backend folder):
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/quickbite
   JWT_SECRET=supersecretkey
   NODE_ENV=development
   PORT=5000
   FRONTEND_URL=http://localhost:3000
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```
   
   Frontend (.env in frontend folder):
   ```env
   REACT_APP_API_URL=http://localhost:5000
   REACT_APP_APP_NAME=Food Delivery App
   ```

5. **Database Setup**
   - Start MongoDB server
   - Seed sample data:
     ```bash
     cd backend
     node src/seedProductsFixed.js
     ```

## 🎯 Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm run dev
   ```
   Backend will run on: http://localhost:5000

2. **Start Frontend Development Server**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on: http://localhost:3000

### Production Mode

1. **Build Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm start
   ```

## 📁 Project Structure

```
food_delievery2/
├── backend/
│   ├── src/
│   │   ├── config/         # Database and app configuration
│   │   ├── controllers/    # Route controllers
│   │   ├── middleware/     # Custom middleware
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic services
│   │   └── utils/          # Utility functions
│   ├── .env               # Environment variables
│   ├── package.json
│   └── server.js          # Entry point
├── frontend/
│   ├── src/
│   │   ├── assets/
│   │   │   ├── components/ # Reusable components
│   │   │   ├── Context/    # React contexts
│   │   │   ├── pages/      # Page components
│   │   │   ├── services/   # API services
│   │   │   └── utils/      # Utility functions
│   │   ├── routes/         # Route configuration
│   │   ├── App.js          # Main app component
│   │   └── index.js        # Entry point
│   ├── .env               # Environment variables
│   ├── package.json
│   └── tailwind.config.js
├── setup.bat              # Windows setup script
├── setup.sh               # Linux/Mac setup script
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get current user
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove/:productId` - Remove from cart
- `DELETE /api/cart/clear` - Clear cart

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get single order
- `PUT /api/orders/:id/status` - Update order status
- `PUT /api/orders/:id/cancel` - Cancel order
- `POST /api/orders/:id/rate` - Rate order

## 🎨 Key Features Implementation

### User Authentication with 7-Day Persistence
- JWT tokens with 7-day expiration
- localStorage persistence
- Automatic session refresh
- Secure cookie handling

### User-Specific Cart Management
- Individual cart per user
- Cart persistence across sessions
- Real-time cart updates
- Integration with order placement

### Comprehensive Order Management
- Multi-step checkout process
- Payment method selection
- Delivery address management
- Order tracking and status updates
- Order history with pagination

### Delivery Partner Assignment
- Automatic partner assignment
- 15-minute gap management
- Location-based assignment
- Partner availability tracking

## 🎯 Usage Guide

1. **Registration/Login**
   - Create account or login
   - Automatic 7-day session

2. **Browse Menu**
   - Search and filter products
   - View product details
   - Add items to cart

3. **Cart Management**
   - View cart items
   - Update quantities
   - Apply promo codes

4. **Checkout**
   - Enter delivery address
   - Select payment method
   - Place order

5. **Track Order**
   - Real-time status updates
   - Delivery partner information
   - Order history access

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify database permissions

2. **Frontend API Errors**
   - Check REACT_APP_API_URL in frontend .env
   - Ensure backend server is running
   - Verify CORS configuration

3. **Authentication Issues**
   - Clear browser cookies/localStorage
   - Check JWT_SECRET in backend .env
   - Verify token expiration

4. **Cart Not Persisting**
   - Check user authentication
   - Verify localStorage permissions
   - Check cart service configuration

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🔗 Support

For support and questions:
- Create an issue in the repository
- Contact: support@fooddelivery.com

---

## 🚀 Quick Start Commands

```bash
# Setup (Windows)
setup.bat

# Start development
# Terminal 1 (Backend)
cd backend && npm run dev

# Terminal 2 (Frontend)  
cd frontend && npm start

# Access Application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

Enjoy your food delivery app! 🎉
