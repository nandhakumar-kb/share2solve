# NPM Scripts Reference

## Root Package (Frontend)

### Development
- **`npm run dev`** - Start Vite dev server (frontend only)
  - Opens on: http://localhost:5173
  - Hot reload enabled
  - Use for frontend-only development

- **`npm run dev:full`** ⭐ **RECOMMENDED**
  - Starts both backend and frontend concurrently
  - Backend: http://localhost:4000
  - Frontend: http://localhost:5173
  - Color-coded terminal output
  - Best for full-stack development

### Backend Control
- **`npm run server`** - Start backend in dev mode with nodemon
  - Auto-restarts on file changes
  - Runs from: `server/index.js`

- **`npm run server:start`** - Start backend in production mode
  - No auto-restart
  - Use for production testing

### Build & Preview
- **`npm run build`** - Build frontend for production
  - Output: `dist/` directory
  - Optimized and minified
  - Ready for deployment

- **`npm run preview`** - Preview production build locally
  - Serves the `dist/` directory
  - Test production build before deploying

### Setup
- **`npm run install:all`** - Install all dependencies
  - Installs frontend dependencies
  - Changes to `server/` and installs backend dependencies
  - Use for first-time setup or after pulling changes

## Server Package (Backend)

Navigate to server directory first: `cd server`

- **`npm start`** - Start server in production mode
  - No auto-restart
  - Uses: `node index.js`

- **`npm run dev`** - Start server with nodemon
  - Auto-restarts on file changes
  - Development mode
  - Uses: `nodemon index.js`

## Quick Reference Table

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `npm run dev:full` | Start everything | Main development workflow |
| `npm run dev` | Frontend only | UI/styling work without backend |
| `npm run server` | Backend only | API development/testing |
| `npm run build` | Build for production | Before deploying |
| `npm run install:all` | Install dependencies | First setup or after git pull |

## Common Workflows

### 1. Daily Development
```bash
# Start both servers
npm run dev:full

# Stop: Press Ctrl+C
```

### 2. Frontend-Only Development
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend
npm run dev
```

### 3. Backend-Only Development
```bash
cd server
npm run dev

# Test with curl or Postman
curl http://localhost:4000/api/health
```

### 4. Fresh Setup
```bash
# Install everything
npm run install:all

# Configure .env files
# Setup database

# Start development
npm run dev:full
```

### 5. Build for Deployment
```bash
# Build frontend
npm run build

# Test production build
npm run preview

# Deploy dist/ folder to hosting service
```

## Tips

- Use `npm run dev:full` for most development work
- The backend and frontend run on different ports
- Environment variables are loaded from `.env` files
- Backend automatically handles CORS for allowed origins
- Frontend proxies API requests through Vite config

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:4000/api
```

### Backend (server/.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/share2solve
PORT=4000
NODE_ENV=development
ADMIN_PASSWORD=your-password
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## Troubleshooting Scripts

If a script fails:

1. **Check Node version**: `node --version` (need v18+)
2. **Reinstall dependencies**: `npm run install:all`
3. **Check running processes**: `netstat -ano | findstr :4000`
4. **Clear cache**: `npm cache clean --force`
5. **Check PostgreSQL**: `psql --version`

## CI/CD Integration

These scripts work with most CI/CD platforms:

```yaml
# Example GitHub Actions
- run: npm run install:all
- run: npm run build
- run: npm test  # if you add tests
```

---

For more details, see:
- `README.md` - Project overview
- `DEVELOPMENT.md` - Detailed development guide
- `QUICKSTART.md` - Quick start instructions
