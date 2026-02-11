# School ERP System

Elegant School Management System with Student Reports and Shift Management.

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL

## Setup Instructions

### 1. Database Setup
1. Ensure PostgreSQL is installed and running.
2. Create a database named `school_erp`:
   ```sql
   CREATE DATABASE school_erp;
   ```
3. Run the schema script located at `server/database.sql` to create the tables.

### 2. Backend Setup
1. Navigate to the server folder:
   ```bash
   cd server
   ```
2. Configure environment variables in `.env` (update `DB_USER` and `DB_PASSWORD`):
   ```
   DB_USER=postgres
   DB_PASSWORD=yourpassword
   ```
3. Install dependencies (if not done):
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:5000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the client folder:
   ```bash
   cd client
   ```
2. Install dependencies (if not done):
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## Features
- **Student Reports:** Add students, manage marks, and view report cards.
- **Shift Management:** Manage staff, define shifts, assigns shifts, and view daily schedules.
