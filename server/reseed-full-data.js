const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME
});

const CLASSES = [
    { name: '10', section: 'A' },
    { name: '10', section: 'B' },
    { name: '10', section: 'C' }
];

const SUBJECTS = ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];
const EXAMS = ['Mid-Term', 'Quarterly'];
const STUDENT_COUNT = 50;
const STAFF_COUNT = 30;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Dhruv', 'Kabir', 'Rudra', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Pari', 'Anvi', 'Riya', 'Prisha', 'Nitya', 'Isha', 'Sara', 'Avery', 'Sofia', 'Kavya', 'Meera', 'Neha', 'Pooja', 'Rani', 'Sneha', 'Tanvi', 'Varsha', 'Zoya', 'Bhavya', 'Chitra', 'Deepa', 'Esha', 'Gargi', 'Hina', 'Juhi', 'Lara', 'Mahi', 'Navya'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Reddy', 'Nair', 'Mehta', 'Iyer', 'Joshi', 'Chopra', 'Malhotra', 'Bhat', 'Saxena', 'Desai', 'Rao', 'Yadav', 'Das', 'Roy', 'Pillai', 'Menon', 'Gowda', 'Shetty', 'Venkatesh', 'Balaji', 'Krishnan', 'Raman', 'Subramaniam', 'Viswanathan'];

function getRandomName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function seed() {
    try {
        console.log('🔄 Starting Full Reseed...');

        // 1. Clear existing data
        console.log('🧹 Clearing old data...');
        await pool.query('TRUNCATE students, marks, staff, staff_shifts RESTART IDENTITY CASCADE');

        // 2. Ensure Subjects exist
        console.log('📚 Verifying subjects...');
        let dbSubjects = [];
        for (const sub of SUBJECTS) {
            await pool.query('INSERT INTO subjects (name) VALUES ($1) ON CONFLICT (name) DO NOTHING', [sub]);
        }
        const subRes = await pool.query('SELECT * FROM subjects WHERE name = ANY($1)', [SUBJECTS]);
        dbSubjects = subRes.rows;

        // 3. Create Students (Sorted Alphabetically -> Sequential Roll No)
        console.log('👨‍🎓 Creating Students...');
        for (const cls of CLASSES) {
            console.log(`   Processing Class ${cls.name}-${cls.section}...`);

            // Generate names first
            let studentsData = [];
            for (let i = 0; i < STUDENT_COUNT; i++) {
                studentsData.push(getRandomName());
            }

            // Sort alphabetically
            studentsData.sort();

            // Insert sorted students with sequential roll numbers
            for (let i = 0; i < studentsData.length; i++) {
                const name = studentsData[i];
                const rollNo = (i + 1).toString().padStart(2, '0'); // 01, 02, etc.

                const res = await pool.query(
                    'INSERT INTO students (name, roll_no, "class", section) VALUES ($1, $2, $3, $4) RETURNING id',
                    [name, rollNo, cls.name, cls.section]
                );
                const studentId = res.rows[0].id;

                // 4. Add Marks
                for (const exam of EXAMS) {
                    for (const subject of dbSubjects) {
                        const marks = getRandomInt(40, 99); // Good marks
                        await pool.query(
                            'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5)',
                            [studentId, subject.id, exam, marks, 100]
                        );
                    }
                }
            }
        }

        // 5. Create Staff
        console.log('\n👨‍🏫 Creating Staff...');
        const shiftsRes = await pool.query('SELECT * FROM shifts');
        const shifts = shiftsRes.rows;

        if (shifts.length === 0) {
            // Create default shifts if missing
            await pool.query("INSERT INTO shifts (name, start_time, end_time) VALUES ('Morning', '08:00', '13:00'), ('Afternoon', '13:00', '18:00')");
            shifts = (await pool.query('SELECT * FROM shifts')).rows;
        }

        for (let i = 0; i < STAFF_COUNT; i++) {
            const name = getRandomName();
            const role = i < 2 ? 'Admin' : 'Teacher';

            const staffRes = await pool.query(
                'INSERT INTO staff (name, role, contact) VALUES ($1, $2, $3) RETURNING id',
                [name, role, `98${getRandomInt(10000000, 99999999)}`]
            );
            const staffId = staffRes.rows[0].id;

            // Assign Shift (Randomly Morning or Afternoon)
            const shift = shifts[Math.floor(Math.random() * shifts.length)];

            // Assign for today and tomorrow
            const dates = [new Date(), new Date(Date.now() + 86400000)];
            for (const date of dates) {
                await pool.query(
                    'INSERT INTO staff_shifts (staff_id, shift_id, shift_date) VALUES ($1, $2, $3)',
                    [staffId, shift.id, date]
                );
            }
        }

        console.log('\n✨ Database successfully re-seeded with:');
        console.log(`   - ${STUDENT_COUNT * CLASSES.length} Students (Sorted & Sequential Roll Nos)`);
        console.log(`   - ${STAFF_COUNT} Staff members with shifts`);
        console.log(`   - Marks for ${EXAMS.join(' & ')} in ${SUBJECTS.join(', ')}`);

    } catch (err) {
        console.error('❌ Error seeding data:', err);
    } finally {
        await pool.end();
    }
}

seed();
