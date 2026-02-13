const pool = require('./config/db');

const classes = ['10 A', '10 B', '10 C'];
const studentCount = 50;
const subjectsList = ['Tamil', 'English', 'Maths', 'Science', 'Social Science'];

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
        console.log('🌱 Starting fresh seed process...');

        // Ensure subjects are correct (redundant check but safe)
        const subjects = (await pool.query('SELECT * FROM subjects')).rows;
        console.log(`📚 Found ${subjects.length} subjects:`, subjects.map(s => s.name).join(', '));

        for (const cls of classes) {
            const [className, section] = cls.split(' ');
            console.log(`\n🏫 Processing Class ${className} - ${section}...`);

            for (let i = 1; i <= studentCount; i++) {
                const rollNo = i.toString();
                const name = getRandomName();

                // Insert Student
                const res = await pool.query(
                    'INSERT INTO students (name, roll_no, "class", section) VALUES ($1, $2, $3, $4) RETURNING id',
                    [name, rollNo, className, section]
                );
                const studentId = res.rows[0].id;

                // Insert Marks for each subject (Mid-Term & Quarterly)
                for (const sub of subjects) {

                    // 1. Mid-Term Marks
                    const midMarks = getRandomInt(35, 100);
                    await pool.query(
                        'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5)',
                        [studentId, sub.id, 'Mid-Term', midMarks, 100]
                    );

                    // 2. Quarterly Marks
                    const quartMarks = getRandomInt(35, 100);
                    await pool.query(
                        'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5)',
                        [studentId, sub.id, 'Quarterly', quartMarks, 100]
                    );
                }

                if (i % 10 === 0) process.stdout.write('.');
            }
        }

        console.log('\n\n✅ Fresh Seeding complete!');
        console.log('🎉 Added 50 students per class with Mid-Term & Quarterly marks for Tamil, English, Maths, Science, Social.');

    } catch (err) {
        console.error('\n❌ Fatal Error:', err);
    } finally {
        await pool.end();
    }
}

seedData();
