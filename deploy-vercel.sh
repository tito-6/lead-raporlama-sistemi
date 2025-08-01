#!/bin/bash

# Vercel Deployment Script for Lead Tracker Pro
echo "🚀 Preparing Lead Tracker Pro for Vercel deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this from the project root."
    exit 1
fi

# Ensure public data directory exists
echo "📁 Ensuring public data directory exists..."
mkdir -p client/public/data

# Copy latest data to public directory (for initial data in production)
echo "📋 Copying latest data files to public directory..."
if [ -d "data" ]; then
    cp data/*.json client/public/data/ 2>/dev/null || echo "⚠️  No data files found in data/ directory"
else
    echo "⚠️  data/ directory not found - using existing public data"
fi

# Build the client
echo "🔨 Building client..."
npm run build:client

# Check if build was successful
if [ ! -d "client/dist" ]; then
    echo "❌ Client build failed. Check for errors and try again."
    exit 1
fi

echo "✅ Build completed successfully!"
echo ""
echo "📦 Ready for Vercel deployment!"
echo ""
echo "Next steps:"
echo "1. Install Vercel CLI: npm i -g vercel"
echo "2. Deploy: vercel --prod"
echo "3. Set environment variables in Vercel dashboard:"
echo "   - SESSION_SECRET: (your secure secret key)"
echo "   - NODE_ENV: production"
echo "   - VERCEL: 1"
echo ""
echo "📖 See VERCEL_DEPLOYMENT.md for detailed instructions."
