const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const studentRoutes = require('./routes/studentRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

app.use('/api/students', studentRoutes);
app.use('/api/shifts', shiftRoutes);

// Test DB Connection
app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');
        res.json({ 
            message: 'Database Connected', 
            time: result.rows[0].now,
            mode: 'POSTGRESQL'
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ 
            error: 'Database Connection Failed',
            details: err.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        mode: 'POSTGRESQL'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('🚀 School ERP Backend - PostgreSQL Mode');
    console.log('📊 Frontend: http://localhost:5173');
    console.log('🔧 API: http://localhost:5000');
    console.log('🗄️  Database: PostgreSQL');
});
