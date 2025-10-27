# share2solve

A full-stack web application where people can share their problems with real-time database storage.

## Features

- 📝 Submit problems with email validation
- 🗄️ **Real PostgreSQL database storage** (no more localStorage!)
- 🔐 Password-protected admin dashboard
- 🔍 Search and filter problems
- 📊 Sort by newest, oldest, email, or status
- ✅ Mark problems as pending/resolved
- 📄 Pagination support
- 📤 Export to CSV
- ↶ Undo delete (5-second window)
- 📤 Share website features
- ♿ WCAG 2.1 AA accessible
- 🎨 Professional, responsive design

## Tech Stack

### Frontend
- React 18.3.1
- Vite 5.4.21
- Modern CSS with animations
- Fetch API for backend communication

### Backend (NEW!)
- Node.js + Express
- PostgreSQL database
- CORS + Helmet security
- Rate limiting
- Input validation & sanitization

## Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (use free Supabase account or local PostgreSQL)

### 1. Clone and Install

```bash
git clone https://github.com/nandhakumar-kb/share2solve.git
cd share2solve
npm install
cd server
npm install
cd ..
```

### 2. Setup Database

**Recommended: Use Supabase (Free)**

1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project
3. Copy connection string from Settings > Database
4. Run the SQL from `server/database.sql` in Supabase SQL Editor

**See `server/README.md` for detailed database setup instructions**

### 3. Configure Environment

```bash
# Backend config
cd server
cp .env.example .env
# Edit server/.env with your DATABASE_URL and ADMIN_PASSWORD

# Frontend config
cd ..
cp .env.example .env
# Edit .env with VITE_API_URL=http://localhost:4000/api
```

### 4. Start Backend Server

```bash
cd server
npm start
# Server runs on http://localhost:4000
```

### 5. Start Frontend

```bash
# In new terminal, from project root
npm run dev
# Frontend runs on http://localhost:5173
```

### 6. Migrate Existing Data (Optional)

If you have localStorage data:

1. Open `migrate.html` in browser
2. Follow on-screen instructions
3. Migrate data to backend database

## Admin Access

Visit: `http://localhost:5173/?admin=view`

Password: Set in `server/.env` as `ADMIN_PASSWORD`

## API Endpoints

### Public
- `GET /api/problems` - Get all problems
- `POST /api/problems` - Submit problem

### Admin (require password)
- `POST /api/admin/login` - Verify password  
- `PATCH /api/problems/:id` - Update status
- `DELETE /api/problems/:id` - Delete problem

Full API documentation in `server/README.md`

## Deployment

### Backend

**Railway.app (Recommended)**
1. Push code to GitHub
2. Create Railway project from repo
3. Add environment variables
4. Deploy automatically

**Render.com**
1. New Web Service
2. Connect GitHub repo
3. Root Directory: `server`
4. Add environment variables

### Frontend

**Vercel**
```bash
# Update .env with production API URL
vercel --prod
```

**Netlify**
- Connect GitHub repo
- Set build command: `npm run build`
- Set publish directory: `dist`
- Add environment variable: `VITE_API_URL`

## Project Structure

```
share2solve/
├── server/                # Backend API
│   ├── index.js          # Express server
│   ├── db.js             # Database connection
│   ├── database.sql      # Database schema
│   ├── package.json
│   └── README.md         # Backend documentation
├── src/
│   ├── components/
│   │   ├── Homepage.jsx  # Problem submission form
│   │   └── AdminView.jsx # Admin dashboard
│   ├── services/
│   │   └── api.js        # API service layer
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── public/
│   ├── logo.png
│   └── .nojekyll
├── migrate.html          # Data migration tool
├── package.json
├── vite.config.js
└── README.md
```

## Security Features

- ✅ Server-side input validation
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (input sanitization)
- ✅ Rate limiting (10 submissions per 15 min)
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Password-based admin auth
- ✅ Environment variable secrets

## Development

```bash
# Frontend with hot reload
npm run dev

# Backend with auto-restart
cd server
npm run dev

# Build for production
npm run build
```

## Troubleshooting

**Backend connection errors:**
- Check `DATABASE_URL` in `server/.env`
- Verify PostgreSQL is accessible
- Check server logs for details

**CORS errors:**
- Add frontend URL to `ALLOWED_ORIGINS` in `server/.env`
- Restart backend server

**Admin login fails:**
- Verify `ADMIN_PASSWORD` matches in `server/.env`
- Clear browser sessionStorage

See `server/README.md` for more troubleshooting tips.

## Documentation

- [Backend Setup Guide](server/README.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Features Documentation](FEATURES.md)
- [Accessibility Guide](ACCESSIBILITY.md)

## License

MIT
