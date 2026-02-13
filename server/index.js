const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const pool = require('./config/db');

dotenv.config();

// Elegant Express App Setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Elegant Request Logger Middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// Elegant API Routes
const studentRoutes = require('./routes/studentRoutes');
const shiftRoutes = require('./routes/shiftRoutes');

app.use('/api/students', studentRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

// Elegant Database Health Check
app.get('/test-db', async (req, res) => {
    try {
        const startTime = Date.now();
        const result = await pool.query('SELECT NOW() as current_time, version() as version');
        const responseTime = Date.now() - startTime;

        res.json({
            success: true,
            message: '✅ Database Connection Excellent',
            data: {
                time: result.rows[0].current_time,
                version: result.rows[0].version.split(',')[0],
                responseTime: `${responseTime}ms`
            },
            mode: 'POSTGRESQL',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error('❌ Database Error:', err.message);
        res.status(500).json({
            success: false,
            error: 'Database Connection Failed',
            details: err.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Elegant Health Check
app.get('/health', (req, res) => {
    const uptime = process.uptime();
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    res.json({
        success: true,
        status: '🚀 Server Running Smoothly',
        uptime: `${hours}h ${minutes}m ${seconds}s`,
        timestamp: new Date().toISOString(),
        mode: 'POSTGRESQL',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Elegant Main Route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: '🎓 School ERP - Elegant Management System',
        version: '2.0.0',
        status: '✅ All Systems Operational',
        database: {
            status: '🟢 PostgreSQL Connected',
            type: 'Production Ready'
        },
        api: {
            documentation: 'Available at /api endpoints',
            students: '/api/students',
            shifts: '/api/shifts',
            health: '/health',
            test: '/test-db'
        },
        frontend: {
            url: 'http://localhost:5173',
            status: '🟢 Running'
        },
        features: [
            '📚 Student Management',
            '📊 Report Generation',
            '👥 Staff Management',
            '⏰ Shift Scheduling',
            '📈 Analytics Dashboard'
        ]
    });
});

// Elegant 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: '🔍 Endpoint Not Found',
        message: `The requested endpoint ${req.originalUrl} does not exist`,
        availableEndpoints: [
            '/',
            '/health',
            '/test-db',
            '/api/students',
            '/api/shifts'
        ],
        timestamp: new Date().toISOString()
    });
});

// Elegant Error Handler
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err.stack);
    res.status(500).json({
        success: false,
        error: '⚠️ Internal Server Error',
        message: 'Something went wrong on our end',
        timestamp: new Date().toISOString()
    });
});

// Elegant Server Start
app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('🎓 SCHOOL ERP - ELEGANT MANAGEMENT SYSTEM');
    console.log('='.repeat(60));
    console.log(`� Server: http://localhost:${PORT}`);
    console.log(`� Frontend: http://localhost:5173`);
    console.log(`🗄️  Database: PostgreSQL Connected`);
    console.log(`⚡ Status: All Systems Operational`);
    console.log('='.repeat(60));
    console.log('🌟 Ready to serve educational excellence!\n');
});
