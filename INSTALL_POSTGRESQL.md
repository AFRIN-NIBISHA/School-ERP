# PostgreSQL Installation Guide for Windows

## Quick Installation (5 minutes)

### Step 1: Download
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download PostgreSQL 16 for Windows

### Step 2: Install
1. Run the downloaded installer
2. Click "Next" through most options
3. **Important Settings:**
   - Password: Set a memorable password (e.g., `postgres`)
   - Port: Keep 5432 (default)
   - Locale: Default is fine

### Step 3: Create Database
After installation, open **Command Prompt as Administrator**:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database (enter your password when prompted)
CREATE DATABASE school_erp;

# Exit
\q
```

### Step 4: Setup School ERP
```bash
# Navigate to project folder
cd "c:\Users\HP\Desktop\School ERP"

# Run database schema
psql -U postgres -d school_erp -f server\database.sql

# Switch to PostgreSQL mode
switch-to-postgresql.bat

# Start server
cd server
npm start
```

### Step 5: Test
```bash
# Test connection
curl http://localhost:5000/test-db
```

## Alternative: Use pgAdmin (Graphical)

1. During PostgreSQL installation, install pgAdmin 4
2. Open pgAdmin from Start Menu
3. Connect to server with your password
4. Right-click "Databases" → Create → Database
5. Name: `school_erp`
6. Right-click new database → Query Tool
7. Paste contents of `server\database.sql`
8. Click Execute (▶️)

## Troubleshooting

### "psql command not found"
Add PostgreSQL to PATH:
1. Search "Environment Variables" in Windows
2. Click "Edit the system environment variables"
3. Click "Environment Variables"
4. Edit "Path" variable
5. Add: `C:\Program Files\PostgreSQL\16\bin`

### "Connection refused"
Start PostgreSQL service:
1. Open Services (search in Windows)
2. Find "postgresql-x64-16"
3. Right-click → Start

### "Password authentication failed"
1. Check password in `server\.env`
2. Reset PostgreSQL password if needed

## Success Indicators

✅ PostgreSQL installed and running
✅ Database `school_erp` created  
✅ Tables created from schema
✅ Server connects to database
✅ Test endpoint returns success

Once setup is complete, your School ERP will use real PostgreSQL database instead of mock data!
