import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import session from 'express-session';
import MemoryStore from 'memorystore';
import { Express, Request, Response, NextFunction } from 'express';

// Extend the Request interface to include session properties
declare global {
  namespace Express {
    interface User {
      id: string;
      username: string;
    }
  }
}

// Create memory store for sessions
const MemoryStoreSession = MemoryStore(session);

// Define user interface
interface User {
  id: string;
  username: string;
  password: string;
}

// Hardcoded credentials (in production, these should be in environment variables)
const ADMIN_CREDENTIALS = {
  username: process.env.ADMIN_USERNAME || 'admin',
  password: process.env.ADMIN_PASSWORD || 'secure123!LeadTracker'
};

// In-memory user storage (for this simple implementation)
const users: User[] = [
  {
    id: '1',
    username: ADMIN_CREDENTIALS.username,
    password: ADMIN_CREDENTIALS.password
  }
];

// Passport Local Strategy Configuration
passport.use(new LocalStrategy(
  async (username: string, password: string, done) => {
    try {
      const user = users.find(u => u.username === username && u.password === password);
      
      if (user) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid credentials' });
      }
    } catch (error) {
      return done(error);
    }
  }
));

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser((id: string, done) => {
  const user = users.find(u => u.id === id);
  done(null, user || null);
});

// Configure session middleware
export function configureAuth(app: Express) {
  // Configure session middleware with memory store
  app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize Passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Login route
  app.post('/api/auth/login', (req, res, next) => {
    passport.authenticate('local', (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: 'Authentication error' });
      }
      
      if (!user) {
        return res.status(401).json({ 
          error: 'Invalid credentials',
          message: info?.message || 'Login failed'
        });
      }

      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: 'Login error' });
        }
        
        return res.json({ 
          success: true, 
          message: 'Login successful',
          user: { id: user.id, username: user.username }
        });
      });
    })(req, res, next);
  });

  // Logout route
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: 'Logout error' });
      }
      res.json({ success: true, message: 'Logout successful' });
    });
  });

  // Check authentication status
  app.get('/api/auth/status', (req, res) => {
    if (req.isAuthenticated()) {
      res.json({ 
        authenticated: true, 
        user: { 
          id: (req.user as User).id, 
          username: (req.user as User).username 
        }
      });
    } else {
      res.json({ authenticated: false });
    }
  });
}

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  
  // For API routes, return JSON error
  if (req.path.startsWith('/api')) {
    return res.status(401).json({ 
      error: 'Authentication required',
      message: 'Please log in to access this resource'
    });
  }
  
  // For non-API routes, redirect to login
  return res.redirect('/login');
}

// Public routes that don't require authentication
const publicRoutes = [
  '/login',
  '/api/auth/login',
  '/api/auth/status',
  '/favicon.ico',
  '/manifest.json'
];

// Check if a path is for static assets
const isStaticAsset = (path: string): boolean => {
  return (
    path.startsWith('/assets/') ||
    path.startsWith('/src/') ||
    path.startsWith('/node_modules/') ||
    path.startsWith('/@') || // Vite dev server assets
    path.endsWith('.js') ||
    path.endsWith('.css') ||
    path.endsWith('.ts') ||
    path.endsWith('.tsx') ||
    path.endsWith('.jsx') ||
    path.endsWith('.png') ||
    path.endsWith('.jpg') ||
    path.endsWith('.jpeg') ||
    path.endsWith('.gif') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico') ||
    path.endsWith('.webp') ||
    path.endsWith('.woff') ||
    path.endsWith('.woff2') ||
    path.endsWith('.ttf') ||
    path.endsWith('.eot') ||
    path.endsWith('.map') ||
    path.includes('vite') ||
    path.includes('hmr') ||
    path.includes('client')
  );
};

// Middleware to protect all routes except public ones
export function protectRoutes(req: Request, res: Response, next: NextFunction) {
  // Always allow static assets
  if (isStaticAsset(req.path)) {
    return next();
  }
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    req.path === route || req.path.startsWith(route)
  );
  
  if (isPublicRoute) {
    return next();
  }
  
  // Apply authentication check
  return requireAuth(req, res, next);
}
