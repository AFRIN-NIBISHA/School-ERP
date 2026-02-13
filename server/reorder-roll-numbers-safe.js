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
        console.log('🚀 Reordering Roll Numbers (Safe Mode)...');

        // 1. Get all students sorted by Name
        const res = await pool.query('SELECT id, name FROM students ORDER BY name ASC');
        const students = res.rows;

        console.log(`📚 Found ${students.length} students.`);

        // 2. TEMPORARY UPDATE: Avoid unique constraint collisions
        // We add a 'TEMP_' prefix + id to make them unique and different from target format
        console.log('🔄 Step 1: Assigning temporary roll numbers...');
        for (const student of students) {
            await pool.query('UPDATE students SET roll_no = $1 WHERE id = $2', [`TEMP_${student.id}`, student.id]);
        }

        // 3. FINAL UPDATE: Assign correct sequential roll numbers
        console.log('✨ Step 2: Assigning sorted roll numbers...');
        for (let i = 0; i < students.length; i++) {
            const student = students[i];
            const newRollNo = `R24${String(i + 1).padStart(3, '0')}`; // e.g. R24001

            await pool.query('UPDATE students SET roll_no = $1 WHERE id = $2', [newRollNo, student.id]);
        }

        console.log('✅ Done! Students are now A-Z with sequential IDs.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error reordering:', err);
        process.exit(1);
    }
}

reorderRollNumbers();
