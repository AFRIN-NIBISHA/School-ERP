# Database Setup Guide for School ERP

## Option 1: PostgreSQL (Recommended for Production)

### Step 1: Install PostgreSQL
1. **Download PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download PostgreSQL 16 or later
   - Run the installer

2. **During Installation:**
   - Remember the password you set for `postgres` user
   - Keep the default port 5432
   - Install pgAdmin (optional but helpful)

### Step 2: Create Database
1. **Open pgAdmin** (web interface) or **Command Line**
2. **Using pgAdmin:**
   - Right-click on "Databases" → Create → Database
   - Name: `school_erp`
   - Click Save

3. **Using Command Line:**
   ```bash
   # Open Command Prompt as Administrator
   psql -U postgres
   CREATE DATABASE school_erp;
   \q
   ```

### Step 3: Run Database Schema
```bash
cd "c:\Users\HP\Desktop\School ERP\server"
psql -U postgres -d school_erp -f database.sql
```

### Step 4: Update Environment
Edit `server\.env` file:
```
DB_USER=postgres
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=5432
DB_NAME=school_erp
```

## Option 2: SQLite (Easier for Development)

If PostgreSQL installation is difficult, I can convert the system to use SQLite:

1. **Install SQLite:**
   ```bash
   npm install sqlite3
   ```

2. **I'll modify the backend to use SQLite instead**

## Option 3: Continue with Mock Data (Current Working)

The app currently works with mock data - no database needed!

## Testing Connection

After setup, test the connection:
```bash
curl http://localhost:5000/test-db
```

Should return:
```json
{
  "message": "Database Connected",
  "time": "2024-01-22T..."
}
```

## Troubleshooting

### Common Issues:
1. **"Connection refused"** → PostgreSQL not running
2. **"Password authentication failed"** → Wrong password in .env
3. **"Database does not exist"** → Create school_erp database
4. **"Port already in use"** → Change port in .env

### Start/Stop PostgreSQL Services:
- **Windows Services:** Find "postgresql-x64-16" service
- **Command:** `net start postgresql-x64-16`

## Quick Test Commands

```bash
# Test if PostgreSQL is running
pg_isready -h localhost -p 5432

# Connect to database
psql -U postgres -d school_erp

# List tables
\dt

# Exit
\q
```

Choose the option that works best for you!
