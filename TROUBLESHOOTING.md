# Troubleshooting Guide

## Common Development Issues

### 1. Connection Refused Errors (ERR_CONNECTION_REFUSED)

**Symptoms:**

- Browser shows "Failed to load resource: net::ERR_CONNECTION_REFUSED"
- "server connection lost. Polling for restart..." messages
- Application not loading at localhost:5000

**Solutions:**

1. **Check if server is running:**

   ```bash
   npm run dev
   ```

2. **Verify port availability:**

   ```bash
   # Windows
   netstat -ano | findstr :5000

   # If port is in use, kill the process or change port in .env
   ```

3. **Check for firewall/antivirus blocking:**

   - Temporarily disable firewall/antivirus
   - Add Node.js/npm to firewall exceptions

4. **Clear browser cache and restart:**
   - Hard refresh (Ctrl+F5)
   - Clear browser cache
   - Try incognito/private mode

### 2. Port Already in Use

**Error:** `EADDRINUSE: address already in use`

**Solutions:**

1. Kill existing Node processes:

   ```bash
   # Windows
   taskkill /f /im node.exe

   # Or find specific process on port 5000
   netstat -ano | findstr :5000
   taskkill /PID <process_id> /F
   ```

2. Change port in `.env` file:
   ```bash
   PORT=5001
   ```

### 3. TypeScript/Build Errors

**Solutions:**

1. Check TypeScript errors:

   ```bash
   npm run check
   ```

2. Clean install dependencies:

   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. Restart TypeScript server in VS Code:
   - Ctrl+Shift+P
   - "TypeScript: Restart TS Server"

### 4. Module Not Found Errors

**Solutions:**

1. Verify all dependencies are installed:

   ```bash
   npm install
   ```

2. Check import paths in TypeScript files
3. Restart development server:
   ```bash
   # Stop with Ctrl+C, then restart
   npm run dev
   ```

### 5. Hot Module Replacement (HMR) Not Working

**Solutions:**

1. Check if server is running in development mode
2. Verify Vite configuration in `vite.config.ts`
3. Try hard refresh (Ctrl+F5)
4. Restart development server

### 6. Environment Variables Not Loading

**Solutions:**

1. Ensure `.env` file exists in project root
2. Check variable names (no spaces around =)
3. Restart server after .env changes
4. Verify .env is not in .gitignore

### 7. Database Connection Issues

**For development with memory storage:**

- No database setup required
- Data resets on server restart (normal behavior)

**For production with PostgreSQL:**

1. Check DATABASE_URL in .env
2. Verify database is running
3. Run database migrations if needed

## Getting Help

### Before Reporting Issues:

1. **Check the console:** Open browser dev tools (F12) and check for errors
2. **Check terminal output:** Look for server errors in the terminal
3. **Try basic troubleshooting:**
   - Restart development server
   - Clear browser cache
   - Check if port is available

### Reporting Issues:

Include this information:

- Operating System
- Node.js version (`node --version`)
- npm version (`npm --version`)
- Error messages (full text)
- Steps to reproduce
- Browser and version

### Quick Reset:

If nothing works, try a complete reset:

```bash
# Stop all Node processes
taskkill /f /im node.exe

# Clean install
rm -rf node_modules package-lock.json
npm install

# Start fresh
npm run dev
```

## Development Tips

1. **Use the correct port:** Always use `http://localhost:5000` for the full application
2. **Check terminal output:** Server logs show helpful debugging information
3. **Enable browser dev tools:** Keep console open to catch errors early
4. **Use environment variables:** Configure settings in `.env` file
5. **Regular restarts:** Restart server when making configuration changes

## Still Having Issues?

1. Check [LOCAL_DEVELOPMENT.md](LOCAL_DEVELOPMENT.md) for detailed setup
2. Review [README.md](README.md) for basic setup instructions
3. Open an issue on GitHub with detailed error information
