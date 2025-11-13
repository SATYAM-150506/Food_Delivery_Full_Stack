#!/bin/bash
# Vercel Build Script

set -e

echo "=== Starting Vercel Build Process ==="

# Step 1: Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm ci --legacy-peer-deps || npm install --legacy-peer-deps
npm run build
cd ..

echo "✅ Build completed successfully!"
echo "Build output location: frontend/build/"
