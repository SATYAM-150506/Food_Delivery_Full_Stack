#!/bin/bash
set -e

echo "🔨 Starting custom build process..."

# Clear any existing builds
echo "🧹 Cleaning old builds..."
cd frontend
rm -rf node_modules .next out build dist
cd ..

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --prefer-offline --no-audit

cd frontend
echo "📦 Installing frontend dependencies..."
npm ci --prefer-offline --no-audit --legacy-peer-deps

# Explicitly fix permissions
echo "🔐 Fixing permissions..."
chmod -R +x node_modules/.bin/ || true

# Build
echo "🏗️  Building frontend..."
CI=false npm run build

echo "✅ Build completed successfully!"
