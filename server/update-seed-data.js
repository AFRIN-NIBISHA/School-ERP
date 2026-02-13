const pool = require('./config/db');

// Reuse name arrays
const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Dhruv', 'Kabir', 'Rudra', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Pari', 'Anvi', 'Riya', 'Prisha', 'Nitya', 'Isha', 'Sara', 'Avery', 'Sofia'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Reddy', 'Nair', 'Mehta', 'Iyer', 'Joshi', 'Chopra', 'Malhotra', 'Bhat', 'Saxena', 'Desai', 'Rao', 'Yadav', 'Das', 'Roy'];
const staffRoles = ['Teacher', 'Admin', 'Clerk', 'Principal', 'Lab Assistant'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

async function updateData() {
    try {
        console.log('🌱 Starting update process...');

        // 1. Add Quarterly Marks for existing students
        console.log('📊 adding Quarterly marks...');

        const students = await pool.query('SELECT id FROM students');
        const subjects = await pool.query('SELECT * FROM subjects');

        console.log(`Found ${students.rows.length} students to update.`);

        for (const student of students.rows) {
            for (const sub of subjects.rows) {
                // Check if quarterly marks already exist
                const markCheck = await pool.query(
                    'SELECT id FROM marks WHERE student_id = $1 AND subject_id = $2 AND exam_type = $3',
                    [student.id, sub.id, 'Quarterly']
                );

                if (markCheck.rows.length === 0) {
                    const marks = getRandomInt(35, 100);
                    await pool.query(
                        'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5)',
                        [student.id, sub.id, 'Quarterly', marks, 100]
                    );
                }
            }
        }
        console.log('✅ Quarterly marks added.');


        // 2. Add 25 Staff Members and Allocate Shifts
        console.log('👥 Adding 25 staff members and assigning shifts...');

        // Ensure shifts exist
        const shiftsRes = await pool.query('SELECT * FROM shifts');
        let shifts = shiftsRes.rows;
        if (shifts.length === 0) {
            console.log('creating default shifts...');
            await pool.query(`INSERT INTO shifts (name, start_time, end_time) VALUES 
                ('Morning', '08:00:00', '13:00:00'),
                ('Afternoon', '13:00:00', '18:00:00')`);
            shifts = (await pool.query('SELECT * FROM shifts')).rows;
        }

        const staffCount = 25;
        const today = new Date().toISOString().split('T')[0];

        for (let i = 0; i < staffCount; i++) {
            const name = getRandomName();
            const role = staffRoles[Math.floor(Math.random() * staffRoles.length)];
            const contact = `98${getRandomInt(10000000, 99999999)}`;

            // Create Staff
            const newStaff = await pool.query(
                'INSERT INTO staff (name, role, contact) VALUES ($1, $2, $3) RETURNING id',
                [name, role, contact]
            );
            const staffId = newStaff.rows[0].id;

            // Assign Shift (Alternating or Random)
            const shift = shifts[i % shifts.length]; // Distribute evenly

            await pool.query(
                'INSERT INTO staff_shifts (staff_id, shift_id, shift_date) VALUES ($1, $2, $3)',
                [staffId, shift.id, today]
            );
        }

        console.log('✅ Added 25 staff members with shift allocations.');
        console.log('🎉 Update complete!');

    } catch (err) {
        console.error('❌ Error updating data:', err);
    } finally {
        await pool.end();
    }
}

updateData();
