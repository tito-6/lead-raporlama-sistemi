# Vercel Deployment Guide

This guide explains how the project has been configured for Vercel deployment.

## File Structure Changes

### Data Files Location
- **Development**: `data/` directory in project root
- **Production**: `client/public/data/` directory (for initial data) + `/tmp/data/` (for runtime persistence)

### Key Files Moved/Created:
1. `client/public/data/lead-expenses.json` - Initial expense data
2. `client/public/data/leads.json` - Initial lead data  
3. `client/public/data/sales-targets.json` - Initial sales targets
4. `vercel.json` - Vercel deployment configuration
5. `.env.production` - Production environment variables

## Technical Implementation

### File Persistence System
The file persistence system now supports both development and production environments:

- **Development Mode**: Uses local `data/` directory
- **Vercel Production**: 
  - Reads initial data from `client/public/data/`
  - Copies to `/tmp/data/` for runtime persistence
  - Writes new data to `/tmp/data/` (temporary, lost on restart)

### Environment Detection
The system detects Vercel deployment using:
```typescript
const isVercel = process.env.VERCEL === '1';
```

### Data Persistence Limitations in Vercel
⚠️ **Important**: In Vercel production, file system writes go to `/tmp` which is ephemeral. Data will be lost on:
- Function restarts
- Cold starts
- Deployments

For permanent persistence in production, consider:
- Database integration (PostgreSQL, MongoDB)
- External storage (AWS S3, Google Cloud Storage)
- Vercel KV storage

## Deployment Process

### 1. Build Configuration
```json
{
  "scripts": {
    "build": "npm run build:client && npm run build:server",
    "build:client": "vite build",
    "vercel-build": "npm run build:client"
  }
}
```

### 2. Vercel Configuration (`vercel.json`)
- Routes API calls to `/server/index.ts`
- Serves static files from `/client/dist/`
- Sets production environment variables

### 3. Environment Variables
Set in Vercel dashboard or `.env.production`:
```
NODE_ENV=production
VERCEL=1
SESSION_SECRET=your-secure-secret-key
```

## Features Maintained in Production

✅ **Working Features**:
- Authentication system
- PDF export with Turkish character support
- Lead management and filtering
- Expense tracking
- Dashboard analytics
- Initial data loading from public files

⚠️ **Limited Features**:
- File persistence (temporary only)
- Data imports (will be lost on restart)

## Authentication in Production

The authentication system works in production with:
- Session-based authentication
- Memory store for sessions (lost on restart)
- Protected routes and API endpoints
- Static asset handling

## Deployment Steps

1. **Prepare Data**:
   ```bash
   # Ensure latest data is in public directory
   Copy-Item data\*.json client\public\data\
   ```

2. **Deploy to Vercel**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```

3. **Set Environment Variables** in Vercel dashboard:
   - `SESSION_SECRET`: Strong secret key for sessions
   - `NODE_ENV`: `production`
   - `VERCEL`: `1`

## Monitoring and Troubleshooting

### Check Logs
- View function logs in Vercel dashboard
- Look for file persistence warnings
- Monitor authentication flow

### Common Issues
1. **Data Loss**: Expected in current setup, use database for persistence
2. **Authentication Issues**: Check session secret is set
3. **File Access**: Verify files are in public directory

## Future Enhancements

For production-ready deployment, consider:
1. **Database Integration**: Replace file persistence with PostgreSQL
2. **External Storage**: Use cloud storage for file uploads
3. **Session Store**: Use Redis or database for session persistence
4. **Environment Configs**: Separate dev/prod configurations
