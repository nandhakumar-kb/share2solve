# Share2Solve - MERN Stack Application

A full-stack problem tracking and management system built with MongoDB, Express, React, and Node.js.

## 🚀 Tech Stack

### Frontend
- **React 18** - UI Library
- **Vite** - Build tool and dev server
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL Database
- **Mongoose** - MongoDB ODM
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - API rate limiting

## 📋 Prerequisites

Before you begin, ensure you have installed:
- Node.js (v18 or higher)
- MongoDB (v5 or higher) - Local installation OR MongoDB Atlas account
- npm or yarn

## 🛠️ Installation

### 1. Install Dependencies

Install all dependencies (both frontend and backend):
```bash
npm run install:all
```

Or install separately:
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
1. Install MongoDB Community Server from https://www.mongodb.com/try/download/community
2. Start MongoDB service (usually starts automatically)
3. MongoDB will create the database automatically when you first run the app

**Option B: MongoDB Atlas (Cloud)**
1. Create free account at https://www.mongodb.com/cloud/atlas
2. Create a cluster (Free M0 tier available)
3. Setup database user and network access
4. Get your connection string

See detailed instructions in `server/MONGODB_SETUP.md`

### 3. Environment Configuration

#### Frontend Environment (.env)
Create `.env` in the root directory:
```bash
VITE_API_URL=http://localhost:4000/api
```

#### Backend Environment (server/.env)
Create `server/.env`:
```bash
# MongoDB Configuration - Choose one:

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/share2solve

# OR MongoDB Atlas
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/share2solve

# Server Configuration
PORT=4000
NODE_ENV=development

# Admin Configuration
ADMIN_PASSWORD=your-secure-admin-password

# CORS Configuration (comma-separated origins)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
```

Replace:
- `username` and `password` with your MongoDB credentials (Atlas only)
- `your-secure-admin-password` with a strong admin password

## 🚀 Running the Application

### Option 1: Run Frontend and Backend Together (Recommended)
```bash
npm run dev:full
```

This will start:
- Backend server on `http://localhost:4000`
- Frontend dev server on `http://localhost:5173`

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## 📁 Project Structure

```
share2solve/
├── src/                      # Frontend source code
│   ├── components/           # React components
│   │   ├── Homepage.jsx      # Public problem submission
│   │   └── AdminView.jsx     # Admin dashboard
│   ├── services/             # API services
│   │   └── api.js           # API client
│   ├── App.jsx              # Main App component
│   ├── main.jsx             # Entry point
│   └── index.css            # Global styles
├── server/                   # Backend source code
│   ├── models/              # MongoDB/Mongoose models
│   │   └── Problem.js       # Problem schema
│   ├── index.js             # Express server
│   ├── db.js                # MongoDB connection
│   ├── MONGODB_SETUP.md     # MongoDB setup guide
│   ├── package.json         # Backend dependencies
│   └── .env                 # Backend environment variables
├── public/                   # Static assets
├── index.html               # HTML template
├── vite.config.js           # Vite configuration
├── package.json             # Frontend dependencies
└── .env                     # Frontend environment variables
```

## 🔑 API Endpoints

### Public Endpoints
- `GET /api/problems` - Get all problems (with filters)
- `POST /api/problems` - Submit a new problem
- `GET /api/health` - Health check

### Admin Endpoints
- `POST /api/admin/login` - Admin authentication
- `PATCH /api/problems/:id` - Update problem status
- `DELETE /api/problems/:id` - Delete a problem

## 🔒 Security Features

- Rate limiting on all API endpoints
- CORS protection
- Helmet security headers
- Input validation and sanitization
- MongoDB injection prevention (Mongoose sanitization)
- Environment-based configuration

## 🎯 Features

- Submit and track problems
- Admin dashboard for problem management
- Search and filter problems
- Status updates (pending/resolved)
- Email tracking
- Responsive design
- MongoDB with Mongoose ODM
- Automatic timestamps and validation

## 📦 Build for Production

### Frontend
```bash
npm run build
```
Output will be in the `dist/` directory.

### Backend
```bash
cd server
npm start
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MongoDB is running: `mongosh` or check Windows Services
- Check MONGODB_URI in `server/.env`
- For Atlas: Verify network access and credentials
- See `server/MONGODB_SETUP.md` for detailed troubleshooting

### Port Already in Use
- Change PORT in `server/.env`
- Update VITE_API_URL in `.env` accordingly

### CORS Errors
- Add your frontend URL to ALLOWED_ORIGINS in `server/.env`
- Restart the backend server

## 📝 License

MIT

## 👨‍💻 Author

Your Name
