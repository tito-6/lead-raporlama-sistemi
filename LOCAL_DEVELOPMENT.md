# Local Development Setup Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Git (optional, for version control)

## Quick Start

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Access Application**
   - Open your browser to `http://localhost:5000`
   - The app runs on a single port (5000) serving both API and client

## Available Scripts

- `npm run dev` - Start development server (recommended)
- `npm run dev:win` - Start development server (Windows specific)
- `npm run dev:debug` - Start with Node.js debugger
- `npm run dev:client` - Start only Vite client (port 5173)
- `npm run dev:server` - Start only server (port 5000)
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run check` - Type check with TypeScript
- `npm run test:ai` - Test AI functionality

## Environment Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

### Key Environment Variables

- `NODE_ENV` - Set to "development" for local development
- `STORAGE_TYPE` - Use "memory" for local development (no database required)
- `PORT` - Server port (default: 5000)
- `DATABASE_URL` - PostgreSQL connection (optional for local dev)
- `ANTHROPIC_API_KEY` - For AI features (optional)

## Development Features

### Hot Module Replacement (HMR)

- Client-side changes reload instantly
- Server-side changes require restart

### In-Memory Storage

- No database setup required for local development
- Data persists during session but resets on restart
- Perfect for development and testing

### API Development

- RESTful API endpoints available at `/api/*`
- Automatic request/response logging in development
- Error handling with proper HTTP status codes

## Production Build

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Run production server**
   ```bash
   npm run start
   ```

## Troubleshooting

### Common Issues

1. **Port already in use**

   - Change PORT in .env file
   - Or kill the process using port 5000

2. **Dependencies issues**

   - Delete node_modules and package-lock.json
   - Run `npm install` again

3. **TypeScript errors**
   - Run `npm run check` to see all type errors
   - Ensure all dependencies are installed

### Clean Installation

If you encounter issues, try a clean installation:

```bash
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Use Development Mode**: Always use `npm run dev` for local development
2. **Environment Variables**: Use `.env` file for local configuration
3. **Hot Reload**: Client changes are instant, server changes need restart
4. **Database**: Not required for basic functionality - uses in-memory storage
5. **API Testing**: Use browser dev tools or Postman for API testing

## Architecture

- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL (optional) or in-memory storage
- **Build Tool**: Vite for frontend, esbuild for backend
- **Styling**: Tailwind CSS + shadcn/ui components

## Support

For issues or questions about local development, check:

1. This development guide
2. Package.json scripts
3. Environment variables in .env.example
4. TypeScript configuration in tsconfig.json
