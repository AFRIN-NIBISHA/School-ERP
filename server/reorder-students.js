const pool = require('./config/db');

async function reorderRollNumbers() {
    try {
        console.log('🔄 Starting Roll Number Reordering based on Alphabetical Order...');

        const classesRes = await pool.query('SELECT DISTINCT "class", section FROM students');
        const classes = classesRes.rows;

        for (const cls of classes) {
            const className = cls.class;
            const section = cls.section;

            console.log(`\n🏫 Processing Class ${className} - ${section}...`);

            // 1. Fetch students sorted alphabetically
            const studentsRes = await pool.query(
                'SELECT id, name FROM students WHERE "class" = $1 AND section = $2 ORDER BY name ASC',
                [className, section]
            );
            const students = studentsRes.rows;

            if (students.length === 0) continue;

            // 2. Temporarily rename roll numbers to avoid unique constraint collisions
            // We use a prefix like 'TEMP-' followed by ID to ensure uniqueness during the transition
            for (const student of students) {
                await pool.query(
                    'UPDATE students SET roll_no = $1 WHERE id = $2',
                    [`TEMP-${student.id}`, student.id]
                );
            }

            // 3. Assign new sequential roll numbers (1, 2, 3...)
            for (let i = 0; i < students.length; i++) {
                const student = students[i];
                const newRollNo = (i + 1).toString();

                await pool.query(
                    'UPDATE students SET roll_no = $1 WHERE id = $2',
                    [newRollNo, student.id]
                );
            }
            console.log(`   ✅ Reordered ${students.length} students.`);
        }

        console.log('\n🎉 Roll number reordering complete!');

    } catch (err) {
        console.error('❌ Error reordering roll numbers:', err);
    } finally {
        await pool.end();
    }
}

reorderRollNumbers();
