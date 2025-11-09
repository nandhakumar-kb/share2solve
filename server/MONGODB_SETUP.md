# MongoDB Setup Guide

## Option 1: Local MongoDB Installation (Recommended for Development)

### Install MongoDB

**Windows:**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Run the installer (choose "Complete" setup)
3. Install as a Windows Service (default option)
4. MongoDB Compass will be installed automatically (GUI tool)

**Verify Installation:**
```powershell
mongod --version
mongo --version
```

### Start MongoDB

MongoDB should start automatically as a Windows service. If not:

```powershell
# Start MongoDB service
net start MongoDB

# Stop MongoDB service
net stop MongoDB
```

### Create Database

MongoDB creates databases automatically when you first use them. No need to create manually!

### Connection String

Add to `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/share2solve
```

## Option 2: MongoDB Atlas (Cloud - Free Tier Available)

### Setup MongoDB Atlas

1. **Create Account:**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for free

2. **Create Cluster:**
   - Click "Build a Database"
   - Choose "Free" (M0 Sandbox)
   - Select a cloud provider and region
   - Name your cluster
   - Click "Create"

3. **Setup Database Access:**
   - Click "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose authentication method (Username/Password)
   - Create username and password
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Setup Network Access:**
   - Click "Network Access" in left sidebar
   - Click "Add IP Address"
   - For development: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production: Add specific IP addresses
   - Click "Confirm"

5. **Get Connection String:**
   - Click "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `myFirstDatabase` with `share2solve`

### Connection String

Add to `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/share2solve?retryWrites=true&w=majority
```

Replace:
- `username` - Your database username
- `password` - Your database password
- `cluster0.xxxxx` - Your cluster address

## Verify Connection

### Using MongoDB Compass (GUI)

1. Open MongoDB Compass
2. Connect using your connection string
3. You should see the `share2solve` database after starting your server

### Using Command Line

**Local MongoDB:**
```powershell
# Connect to MongoDB
mongosh

# Show databases
show dbs

# Use your database
use share2solve

# Show collections
show collections

# View problems
db.problems.find()

# Count problems
db.problems.countDocuments()
```

## Database Structure

The MongoDB database will automatically create the `problems` collection with the following schema:

```javascript
{
  _id: ObjectId,           // Auto-generated unique ID
  email: String,           // User email (indexed)
  problem: String,         // Problem description
  status: String,          // 'pending' or 'resolved'
  timestamp: Date,         // Submission time
  createdAt: Date,        // Auto-generated
  updatedAt: Date         // Auto-updated
}
```

### Indexes

The following indexes are automatically created for performance:
- `status` + `timestamp` (compound index)
- `email` (single index)
- `timestamp` (single index)

## Useful MongoDB Commands

```javascript
// Connect to database
use share2solve

// View all problems
db.problems.find().pretty()

// Count problems by status
db.problems.countDocuments({ status: "pending" })
db.problems.countDocuments({ status: "resolved" })

// Find problems by email
db.problems.find({ email: "user@example.com" })

// Find recent problems
db.problems.find().sort({ timestamp: -1 }).limit(10)

// Update problem status
db.problems.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "resolved" } }
)

// Delete a problem
db.problems.deleteOne({ _id: ObjectId("...") })

// Delete all problems (careful!)
db.problems.deleteMany({})

// View collection indexes
db.problems.getIndexes()

// Get collection stats
db.problems.stats()
```

## Backup & Restore

### Export Data
```powershell
# Export to JSON
mongoexport --db=share2solve --collection=problems --out=problems.json

# Export to CSV
mongoexport --db=share2solve --collection=problems --type=csv --fields=email,problem,status,timestamp --out=problems.csv
```

### Import Data
```powershell
# Import from JSON
mongoimport --db=share2solve --collection=problems --file=problems.json

# Import from CSV
mongoimport --db=share2solve --collection=problems --type=csv --headerline --file=problems.csv
```

### Full Database Backup
```powershell
# Backup
mongodump --db=share2solve --out=./backup

# Restore
mongorestore --db=share2solve ./backup/share2solve
```

## Troubleshooting

### MongoDB not starting
```powershell
# Check service status
sc query MongoDB

# Restart service
net stop MongoDB
net start MongoDB
```

### Connection refused
- Ensure MongoDB service is running
- Check firewall settings
- Verify connection string in `.env`

### Authentication failed
- Double-check username and password
- Ensure user has correct permissions
- For Atlas: Check network access whitelist

### Database not appearing
- MongoDB creates databases on first write operation
- Start your backend server and submit a problem
- Refresh MongoDB Compass or run `show dbs`

## Security Best Practices

1. **Strong Passwords:** Use strong, unique passwords for database users
2. **IP Whitelist:** In production, only allow specific IP addresses
3. **Environment Variables:** Never commit `.env` files with credentials
4. **Regular Backups:** Set up automated backups for production
5. **Monitoring:** Enable MongoDB monitoring and alerts

## Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [MongoDB University](https://university.mongodb.com/) - Free courses

## Migration from PostgreSQL

If you had existing data in PostgreSQL, you'll need to migrate:

1. Export data from PostgreSQL
2. Transform data format (remove `id` field, MongoDB will create `_id`)
3. Import into MongoDB using `mongoimport`

See migration scripts in the repository if needed.
