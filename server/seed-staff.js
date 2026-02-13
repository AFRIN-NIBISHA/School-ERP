const pool = require('./config/db');

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

async function seedStaff() {
    try {
        console.log('👥 Starting Staff Seeding...');

        // 1. Ensure Shifts Exist
        let shiftsRes = await pool.query('SELECT * FROM shifts');
        if (shiftsRes.rows.length === 0) {
            console.log('   Creating default shifts...');
            await pool.query(`INSERT INTO shifts (name, start_time, end_time) VALUES 
                ('Morning', '08:00:00', '13:00:00'),
                ('Afternoon', '13:00:00', '18:00:00')`);
            shiftsRes = await pool.query('SELECT * FROM shifts');
        }
        const shifts = shiftsRes.rows;
        console.log(`   Found ${shifts.length} shifts.`);

        // 2. Clear existing staff (optional, but good for fresh state if desired. keeping append only if not specified, 
        // but user generally implies "setup" logic. I'll just append for safety or check count).
        // User asked "25 staffs", I'll ensuring at least 25 exist by adding 25 new ones.

        const countRes = await pool.query('SELECT count(*) FROM staff');
        const currentCount = parseInt(countRes.rows[0].count);
        console.log(`   Current staff count: ${currentCount}`);

        if (currentCount >= 25) {
            console.log('   ⚠️ Staff already populated. Skipping insertion to avoid duplicates.');
            // But I should ensure they have shifts for TODAY.
        } else {
            // 3. Create 25 Staff
            const targetCount = 25;
            const today = new Date().toISOString().split('T')[0];

            console.log(`   Creating ${targetCount} new staff members...`);

            for (let i = 0; i < targetCount; i++) {
                const name = getRandomName();
                const role = staffRoles[Math.floor(Math.random() * staffRoles.length)];
                const contact = `98${getRandomInt(10000000, 99999999)}`;

                // Insert Staff
                const staffRes = await pool.query(
                    'INSERT INTO staff (name, role, contact) VALUES ($1, $2, $3) RETURNING id',
                    [name, role, contact]
                );
                const staffId = staffRes.rows[0].id;

                // Assign Shift (Morning or Afternoon)
                const shift = shifts[i % shifts.length]; // Distribute evenly

                await pool.query(
                    'INSERT INTO staff_shifts (staff_id, shift_id, shift_date) VALUES ($1, $2, $3)',
                    [staffId, shift.id, today]
                );
            }
            console.log('   ✅ Added 25 staff members with today\'s shift.');
        }

        // Ensure all exist staff have a shift for today (in case of re-run or old data)
        const staffWithoutShift = await pool.query(`
            SELECT s.id FROM staff s
            WHERE NOT EXISTS (
                SELECT 1 FROM staff_shifts ss 
                WHERE ss.staff_id = s.id AND ss.shift_date = CURRENT_DATE
            )
        `);

        if (staffWithoutShift.rows.length > 0) {
            console.log(`   Found ${staffWithoutShift.rows.length} staff without shift for today. Assigning...`);
            const today = new Date().toISOString().split('T')[0];
            for (let i = 0; i < staffWithoutShift.rows.length; i++) {
                const shift = shifts[i % shifts.length];
                await pool.query(
                    'INSERT INTO staff_shifts (staff_id, shift_id, shift_date) VALUES ($1, $2, $3)',
                    [staffWithoutShift.rows[i].id, shift.id, today]
                );
            }
            console.log('   ✅ Shifts backfilled.');
        }

        console.log('🎉 Staff seeding complete!');

    } catch (err) {
        console.error('❌ Error seeding staff:', err);
    } finally {
        await pool.end();
    }
}

seedStaff();
