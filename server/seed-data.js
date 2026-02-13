const pool = require('./config/db');

const classes = ['10 A', '10 B', '10 C'];
const studentCount = 50;

const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharva', 'Dhruv', 'Kabir', 'Rudra', 'Ananya', 'Diya', 'Saanvi', 'Aadhya', 'Kiara', 'Myra', 'Pari', 'Anvi', 'Riya', 'Prisha', 'Nitya', 'Isha', 'Sara', 'Avery', 'Sofia'];
const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Kumar', 'Reddy', 'Nair', 'Mehta', 'Iyer', 'Joshi', 'Chopra', 'Malhotra', 'Bhat', 'Saxena', 'Desai', 'Rao', 'Yadav', 'Das', 'Roy'];

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomName() {
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    return `${first} ${last}`;
}

async function seedData() {
    try {
        console.log('🌱 Starting seed process...');

        // Verify subjects exist
        const subRes = await pool.query('SELECT * FROM subjects');
        if (subRes.rows.length === 0) {
            console.log('⚠️ No subjects found. Inserting defaults...');
            await pool.query("INSERT INTO subjects (name) VALUES ('Mathematics'), ('Science'), ('English'), ('History')");
        }
        const subjects = (await pool.query('SELECT * FROM subjects')).rows;

        console.log(`📚 Found ${subjects.length} subjects.`);

        for (const cls of classes) {
            const [className, section] = cls.split(' ');
            console.log(`\n🏫 Processing Class ${className} - ${section}...`);

            for (let i = 1; i <= studentCount; i++) {
                const rollNo = i.toString();
                const name = getRandomName();

                try {
                    // Check if student exists (just in case, though unlikely in clean db)
                    const check = await pool.query(
                        'SELECT id FROM students WHERE roll_no = $1 AND "class" = $2 AND section = $3',
                        [rollNo, className, section]
                    );

                    let studentId;

                    if (check.rows.length > 0) {
                        studentId = check.rows[0].id;
                    } else {
                        // Insert Student
                        const res = await pool.query(
                            'INSERT INTO students (name, roll_no, "class", section) VALUES ($1, $2, $3, $4) RETURNING id',
                            [name, rollNo, className, section]
                        );
                        studentId = res.rows[0].id;
                    }

                    // Insert Marks for each subject
                    for (const sub of subjects) {
                        const marks = getRandomInt(35, 100); // Mostly pass marks
                        const maxMarks = 100;

                        // Check if marks exist
                        const markCheck = await pool.query(
                            'SELECT id FROM marks WHERE student_id = $1 AND subject_id = $2 AND exam_type = $3',
                            [studentId, sub.id, 'Mid-Term']
                        );

                        if (markCheck.rows.length === 0) {
                            await pool.query(
                                'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5)',
                                [studentId, sub.id, 'Mid-Term', marks, maxMarks]
                            );
                        }
                    }
                    if (i % 10 === 0) process.stdout.write('.');

                } catch (err) {
                    console.error(`❌ Error processing Roll ${rollNo} in ${cls}:`, err.message);
                }
            }
        }

        console.log('\n\n✅ Seeding initialization complete!');
        console.log('🎉 Added 50 students with marks to 10 A, 10 B, and 10 C.');

    } catch (err) {
        console.error('\n❌ Fatal Error:', err);
    } finally {
        await pool.end();
    }
}

seedData();
