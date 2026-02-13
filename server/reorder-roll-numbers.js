const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

async function reorderRollNumbers() {
    try {
        console.log('🚀 Reordering Roll Numbers based on Name...');

        // 1. Get all students sorted by Name
        const res = await pool.query('SELECT id, name FROM students ORDER BY name ASC');
        const students = res.rows;

        console.log(`📚 Found ${students.length} students. Updating roll numbers...`);

        // 2. Update Roll Numbers sequentially
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const newRollNo = `R24${String(i + 1).padStart(3, '0')}`; // e.g. R24001, R24002

            await pool.query('UPDATE students SET roll_no = $1 WHERE id = $2', [newRollNo, student.id]);
            // console.log(`   ✅ ${student.name} -> ${newRollNo}`);
        }

        console.log('✨ Successfully updated all roll numbers!');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error reordering:', err);
        process.exit(1);
    }
}

reorderRollNumbers();
