# Backend Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or hosted)

## Recommended: Use Supabase (Free PostgreSQL Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Settings > Database** and copy the connection string
4. The connection string format: `postgresql://postgres:[YOUR-PASSWORD]@[HOST]:5432/postgres`

## Alternative: Local PostgreSQL

If you prefer local development:
```bash
# Install PostgreSQL (Windows)
# Download from: https://www.postgresql.org/download/windows/

# Or use Docker
docker run --name share2solve-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

## Setup Steps

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Configure Environment

Create `.env` file in the `server` directory:

```bash
cp .env.example .env
```

Edit `.env` with your details:

```env
# Use your Supabase connection string or local PostgreSQL
DATABASE_URL=postgresql://postgres:your-password@db.xxx.supabase.co:5432/postgres

PORT=4000
NODE_ENV=development

# Set a strong admin password
ADMIN_PASSWORD=your-secure-admin-password-here

# Add your frontend URLs (comma-separated)
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174,https://your-vercel-domain.vercel.app
```

### 3. Create Database Tables

Connect to your PostgreSQL database and run the schema:

**Option A: Using psql command line**
```bash
psql "your-connection-string" -f database.sql
```

**Option B: Using Supabase SQL Editor**
1. Go to Supabase Dashboard > SQL Editor
2. Copy contents of `database.sql`
3. Paste and click "Run"

**Option C: Using pgAdmin or any PostgreSQL client**
- Connect to your database
- Execute the SQL from `database.sql`

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on http://localhost:4000
📊 Environment: development
```

### 5. Test the API

Open your browser or use curl:

```bash
# Health check
curl http://localhost:4000/api/health

# Get all problems
curl http://localhost:4000/api/problems

# Submit a problem
curl -X POST http://localhost:4000/api/problems \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","problem":"This is a test problem"}'
```

## Frontend Configuration

### 1. Create `.env` in project root

```bash
cd ..
echo "VITE_API_URL=http://localhost:4000/api" > .env
```

### 2. Install frontend dependencies (if not already done)

```bash
npm install
```

### 3. Start frontend

```bash
npm run dev
```

## Migrate Existing Data

If you have data in localStorage:

1. Open `migrate.html` in your browser
2. Make sure the backend server is running
3. Click "Check LocalStorage"
4. Click "Start Migration"
5. After successful migration, click "Clear LocalStorage"

## Production Deployment

### Deploy Backend

**Recommended: Railway.app**

1. Go to [railway.app](https://railway.app)
2. Click "New Project" > "Deploy from GitHub repo"
3. Select your repository
4. Add environment variables in Railway dashboard
5. Railway will auto-detect Node.js and deploy

**Alternative: Render.com**

1. Go to [render.com](https://render.com)
2. New > Web Service
3. Connect your GitHub repo
4. Root Directory: `server`
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Add environment variables

### Deploy Frontend

Update `.env` with production API URL:

```env
VITE_API_URL=https://your-backend.railway.app/api
```

Deploy to Vercel:
```bash
vercel --prod
```

## Security Checklist

- ✅ Use strong ADMIN_PASSWORD
- ✅ Enable HTTPS in production
- ✅ Set correct ALLOWED_ORIGINS
- ✅ Use environment variables (never commit .env)
- ✅ Keep dependencies updated
- ✅ Monitor server logs
- ✅ Set up database backups (Supabase does this automatically)

## Troubleshooting

**Connection refused error:**
- Check DATABASE_URL is correct
- Verify PostgreSQL is running
- Check firewall/network settings

**CORS errors:**
- Add your frontend URL to ALLOWED_ORIGINS in .env
- Restart the server after changing .env

**Authentication errors:**
- Verify ADMIN_PASSWORD in server/.env matches what you're using
- Clear browser cache and sessionStorage

## API Endpoints

### Public Endpoints

- `GET /api/health` - Health check
- `GET /api/problems` - Get all problems (with filters)
  - Query params: `search`, `status`, `sortBy`, `limit`
- `POST /api/problems` - Submit new problem
  - Body: `{ email, problem, timestamp? }`

### Admin Endpoints (require adminPassword)

- `POST /api/admin/login` - Verify admin password
  - Body: `{ password }`
- `PATCH /api/problems/:id` - Update problem status
  - Body: `{ status, adminPassword }`
- `DELETE /api/problems/:id` - Delete problem
  - Body: `{ adminPassword }`

## Support

For issues:
1. Check server logs
2. Verify database connection
3. Test API endpoints with curl
4. Check browser console for frontend errors
