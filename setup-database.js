const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: 'postgres' // Connect to default database first
});

async function setupDatabase() {
    try {
        console.log('🔧 Setting up PostgreSQL database...');

        // Create database if it doesn't exist
        await pool.query(`CREATE DATABASE school_erp`);
        console.log('✅ Database "school_erp" created');
    } catch (err) {
        if (err.code === '42P04') {
            console.log('✅ Database "school_erp" already exists');
        } else {
            console.error('❌ Error creating database:', err.message);
            return;
        }
    }

    // Close connection to postgres database
    await pool.end();

    // Connect to school_erp database
    const schoolPool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: 'school_erp'
    });

    try {
        // Drop existing tables to ensure fresh schema
        await schoolPool.query(`
            DROP TABLE IF EXISTS marks CASCADE;
            DROP TABLE IF EXISTS staff_shifts CASCADE;
            DROP TABLE IF EXISTS students CASCADE;
            DROP TABLE IF EXISTS subjects CASCADE;
            DROP TABLE IF EXISTS staff CASCADE;
            DROP TABLE IF EXISTS shifts CASCADE;
        `);
        console.log('🗑️  Existing tables dropped (Fresh start)');

        // Create tables

        const schema = `
        CREATE TABLE IF NOT EXISTS students (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            roll_no VARCHAR(20) NOT NULL,
            "class" VARCHAR(20) NOT NULL,
            section VARCHAR(10) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(roll_no, "class", section)
        );

        CREATE TABLE IF NOT EXISTS subjects (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE
        );

        CREATE TABLE IF NOT EXISTS marks (
            id SERIAL PRIMARY KEY,
            student_id INTEGER REFERENCES students(id) ON DELETE CASCADE,
            subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
            exam_type VARCHAR(50) NOT NULL,
            marks_obtained INTEGER NOT NULL,
            max_marks INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS staff (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            role VARCHAR(50) NOT NULL,
            contact VARCHAR(20),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS shifts (
            id SERIAL PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            start_time TIME NOT NULL,
            end_time TIME NOT NULL
        );

        CREATE TABLE IF NOT EXISTS staff_shifts (
            id SERIAL PRIMARY KEY,
            staff_id INTEGER REFERENCES staff(id) ON DELETE CASCADE,
            shift_id INTEGER REFERENCES shifts(id) ON DELETE CASCADE,
            shift_date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Sample Data
        INSERT INTO subjects (name) VALUES ('Tamil'), ('English'), ('Maths'), ('Science'), ('Social Science') ON CONFLICT DO NOTHING;
        INSERT INTO shifts (name, start_time, end_time) VALUES 
        ('Morning', '08:00:00', '13:00:00'),
        ('Afternoon', '13:00:00', '18:00:00') ON CONFLICT DO NOTHING;
        `;

        await schoolPool.query(schema);
        console.log('✅ Tables created successfully');
        console.log('✅ Sample data inserted');
        console.log('🎉 Database setup complete!');

    } catch (err) {
        console.error('❌ Error setting up tables:', err.message);
    } finally {
        await schoolPool.end();
    }
}

setupDatabase();
