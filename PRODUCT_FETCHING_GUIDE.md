# Product Fetching Guide

## Problem: Products Not Loading

This document explains why products weren't fetching and how to fix it.

## Root Cause

The database was **empty** - no products were seeded. The frontend was correctly calling the `/api/products` endpoint, but the backend had no products to return.

## Solution: Seed the Database

### Step 1: Install Dependencies (if not already done)
```bash
cd backend
npm install
```

### Step 2: Ensure .env is Configured
Make sure `backend/.env` has:
```
MONGODB_URI=your_mongodb_connection_string
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
PORT=5000
```

### Step 3: Seed Products (Local Development)
```bash
cd backend
npm run seed
```

This will:
- Connect to MongoDB
- Clear existing products (if any)
- Insert 13 sample products across 6 categories

### Step 4: Verify Products Were Seeded
```bash
npm run verify
```

This should show all 13 products with their details.

## How It Works

### Backend API Flow
1. **Frontend** calls: `GET /api/products`
2. **Backend** (productController.js) queries MongoDB
3. **Response**: Returns all products as JSON
4. **Frontend** displays products in grid

### Products Available
- **Pizza**: Margherita Pizza, Pepperoni Pizza
- **Burger**: Classic Cheeseburger, Veggie Burger, Viren
- **Indian**: Chicken Biryani, Paneer Butter Masala
- **Chinese**: Chicken Hakka Noodles, Veg Fried Rice
- **Snacks**: Caesar Salad
- **Desserts**: Chocolate Brownie
- **Drinks**: Fresh Orange Juice, Masala Chai

## Troubleshooting

### If products still don't show:

1. **Check backend is running**
   ```bash
   npm start
   ```
   Should show: "Server running on port 5000"

2. **Check MongoDB connection**
   - Verify MONGODB_URI in .env
   - Ensure connection string is correct
   - Check firewall/network access

3. **Test API directly**
   ```bash
   # Linux/Mac
   curl http://localhost:5000/api/products
   
   # Windows PowerShell
   Invoke-WebRequest -Uri http://localhost:5000/api/products
   ```
   Should return JSON array of products

4. **Check frontend API URL**
   - Ensure `REACT_APP_API_URL` is set correctly
   - Default: `http://localhost:5000`

## For Production (Vercel Deployment)

After deploying, seed products on production database:

1. Connect to your production MongoDB
2. Update backend/.env with production connection string
3. Run: `npm run seed` on your local machine
4. Or set up a one-time seed endpoint in your backend

## Files Involved

- `backend/src/seedProductsFixed.js` - Product data & seed logic
- `backend/src/verifyProducts.js` - Verification script
- `backend/src/controllers/productController.js` - API endpoints
- `backend/src/routes/productRoutes.js` - Route definitions
- `frontend/src/assets/services/productService.js` - Frontend API calls
