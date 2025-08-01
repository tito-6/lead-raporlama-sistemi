@echo off
REM Vercel Deployment Script for Lead Tracker Pro (Windows)
echo 🚀 Preparing Lead Tracker Pro for Vercel deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this from the project root.
    exit /b 1
)

REM Ensure public data directory exists
echo 📁 Ensuring public data directory exists...
if not exist "client\public\data" mkdir "client\public\data"

REM Copy latest data to public directory (for initial data in production)
echo 📋 Copying latest data files to public directory...
if exist "data" (
    copy "data\*.json" "client\public\data\" >nul 2>&1 || echo ⚠️  No data files found in data\ directory
) else (
    echo ⚠️  data\ directory not found - using existing public data
)

REM Build the client
echo 🔨 Building client...
call npm run build:client

REM Check if build was successful
if not exist "client\dist" (
    echo ❌ Client build failed. Check for errors and try again.
    exit /b 1
)

echo ✅ Build completed successfully!
echo.
echo 📦 Ready for Vercel deployment!
echo.
echo Next steps:
echo 1. Install Vercel CLI: npm i -g vercel
echo 2. Deploy: vercel --prod
echo 3. Set environment variables in Vercel dashboard:
echo    - SESSION_SECRET: (your secure secret key)
echo    - NODE_ENV: production
echo    - VERCEL: 1
echo.
echo 📖 See VERCEL_DEPLOYMENT.md for detailed instructions.
