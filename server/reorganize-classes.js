const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function reorganizeClasses() {
    try {
        console.log('🚀 Reorganizing Classes...');

        // 1. Get all students sorted by Roll No (which is alphabetical)
        const res = await pool.query('SELECT id, name FROM students ORDER BY roll_no ASC');
        const students = res.rows;
        const total = students.length;

        console.log(`📚 Found ${total} students. Converting all to Class 10...`);

        // 2. Calculate distribution
        // We want chunks: A, B, C
        const size = Math.ceil(total / 3); // 50/3 = 17. 17+17+16 = 50.

        for (let i = 0; i < total; i++) {
            const student = students[i];
            let section;

            if (i < size) section = 'A';
            else if (i < size * 2) section = 'B';
            else section = 'C';

            // Update Class to 10 and assign new Section
            await pool.query(
                'UPDATE students SET "class" = $1, section = $2 WHERE id = $3',
                ['10', section, student.id]
            );
        }

        console.log('✅ Successfully moved all students to Class 10 (Sections A, B, C).');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error reorganizing:', err);
        process.exit(1);
    }
}

reorganizeClasses();
