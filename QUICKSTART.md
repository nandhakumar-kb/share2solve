# Quick Start Guide

## ⚡ Start Development (One Command)

```bash
npm run dev:full
```

This starts:
- Backend: http://localhost:4000
- Frontend: http://localhost:5173

## 📋 Prerequisites Checklist

- [ ] Node.js installed
- [ ] MongoDB installed and running (Local OR Atlas account)
- [ ] Database connection configured in `server/.env`
- [ ] `.env` configured (root directory)
- [ ] `server/.env` configured (MongoDB connection)

## 🔧 Environment Setup

### Root `.env`
```
VITE_API_URL=http://localhost:4000/api
```

### `server/.env`
```
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/share2solve

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/share2solve

PORT=4000
NODE_ENV=development
ADMIN_PASSWORD=your-admin-password
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

## 🎯 Common Commands

```bash
# First time setup
npm run install:all

# Development (both servers)
npm run dev:full

# Development (separate)
npm run server     # Backend only
npm run dev        # Frontend only

# Production build
npm run build

# Start backend in production
npm run server:start
```

## 🌐 URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:4000/api
- **Health Check:** http://localhost:4000/api/health

## 📚 Documentation

- `README.md` - Overview and setup
- `DEVELOPMENT.md` - Detailed development guide
- `server/MONGODB_SETUP.md` - MongoDB installation and configuration

## 🔑 Default Credentials

Admin password is set in `server/.env` under `ADMIN_PASSWORD`

## ⚠️ Troubleshooting

**Database connection failed?**
- Check MongoDB is running: `mongosh` or Windows Services
- Verify MONGODB_URI in server/.env
- See `server/MONGODB_SETUP.md` for details

**Port already in use?**
```powershell
netstat -ano | findstr :4000
taskkill /PID <PID> /F
```

**CORS errors?**
- Add your frontend URL to ALLOWED_ORIGINS
- Restart backend server

## 📞 Support

Check DEVELOPMENT.md and server/MONGODB_SETUP.md for detailed guides.
