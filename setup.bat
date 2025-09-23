@echo off
echo 🚀 Setting up Food Delivery App...

echo 📦 Installing Backend Dependencies...
cd backend
call npm install

echo 🌱 Seeding Database with Sample Products...
call node src/seedProductsFixed.js

echo 📦 Installing Frontend Dependencies...
cd ../frontend
call npm install

echo ✅ Setup Complete!
echo.
echo 🎯 To run the application:
echo Backend: cd backend && npm run dev
echo Frontend: cd frontend && npm start
echo.
echo 🌐 URLs:
echo Frontend: http://localhost:3000
echo Backend API: http://localhost:5000

pause
