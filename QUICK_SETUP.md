# Quick Setup Guide for School ERP

## Database Setup (Required for Full Functionality)

### Option 1: Install PostgreSQL (Recommended)
1. **Download and Install PostgreSQL:**
   - Go to https://www.postgresql.org/download/windows/
   - Download and run the installer
   - Remember your password during installation

2. **Create Database:**
   ```sql
   -- Open pgAdmin or psql and run:
   CREATE DATABASE school_erp;
   ```

3. **Update Environment:**
   - Edit `server/.env` file
   - Update `DB_PASSWORD` with your PostgreSQL password

4. **Run Database Schema:**
   ```bash
   cd server
   psql -U postgres -d school_erp -f database.sql
   ```

### Option 2: Use Mock Data (Quick Testing)
If you don't want to install PostgreSQL right now, the app has mock data built-in for testing.

## Start the Application

### Method 1: Use the Batch File (Easiest)
```bash
# Double-click this file or run in terminal
start-all.bat
```

### Method 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd server
npm start

# Terminal 2 - Start Frontend  
cd client
npm run dev
```

## Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Database Test: http://localhost:5000/test-db

## Features to Test
1. **Dashboard** - View statistics
2. **Student Reports** - Add students, manage marks
3. **Shift Management** - Add staff, create shifts, assign schedules

## Troubleshooting
- If backend fails: Check if PostgreSQL is running
- If frontend fails: Make sure backend is running first
- Port conflicts: Change ports in .env files if needed
