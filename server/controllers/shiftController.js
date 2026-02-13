const pool = require('../config/db');

// Elegant Response Helper
const createResponse = (success, message, data = null, error = null) => ({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
});

// Elegant Add Staff
const addStaff = async (req, res) => {
    try {
        const { name, role, contact } = req.body;
        
        // Elegant Validation
        if (!name || !role) {
            return res.status(400).json(
                createResponse(false, '⚠️ Name and role are required', null, 'Missing required fields')
            );
        }

        const newStaff = await pool.query(
            'INSERT INTO staff (name, role, contact) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), role.trim(), contact ? contact.trim() : null]
        );
        
        res.status(201).json(
            createResponse(true, '✅ Staff member added successfully', newStaff.rows[0])
        );
    } catch (err) {
        console.error('❌ Add Staff Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to add staff', null, err.message)
        );
    }
};

// Elegant Get Staff
const getStaff = async (req, res) => {
    try {
        const staff = await pool.query(
            'SELECT * FROM staff ORDER BY name'
        );
        
        res.json(
            createResponse(true, `👥 Found ${staff.rows.length} staff members`, staff.rows)
        );
    } catch (err) {
        console.error('❌ Get Staff Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to retrieve staff', null, err.message)
        );
    }
};

// Elegant Add Shift
const addShift = async (req, res) => {
    try {
        const { name, start_time, end_time } = req.body;
        
        // Elegant Validation
        if (!name || !start_time || !end_time) {
            return res.status(400).json(
                createResponse(false, '⚠️ All fields are required', null, 'Missing shift details')
            );
        }

        // Validate time format and logic
        if (start_time >= end_time) {
            return res.status(400).json(
                createResponse(false, '⚠️ End time must be after start time', null, 'Invalid time range')
            );
        }

        const newShift = await pool.query(
            'INSERT INTO shifts (name, start_time, end_time) VALUES ($1, $2, $3) RETURNING *',
            [name.trim(), start_time, end_time]
        );
        
        res.status(201).json(
            createResponse(true, '✅ Shift created successfully', newShift.rows[0])
        );
    } catch (err) {
        console.error('❌ Add Shift Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to create shift', null, err.message)
        );
    }
};

// Elegant Get Shifts
const getShifts = async (req, res) => {
    try {
        const shifts = await pool.query(
            'SELECT * FROM shifts ORDER BY start_time'
        );
        
        res.json(
            createResponse(true, `⏰ Found ${shifts.rows.length} shift types`, shifts.rows)
        );
    } catch (err) {
        console.error('❌ Get Shifts Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to retrieve shifts', null, err.message)
        );
    }
};

// Elegant Assign Shift
const assignShift = async (req, res) => {
    try {
        const { staff_id, shift_id, shift_date } = req.body;
        
        // Elegant Validation
        if (!staff_id || !shift_id || !shift_date) {
            return res.status(400).json(
                createResponse(false, '⚠️ All fields are required', null, 'Missing assignment details')
            );
        }

        // Check for duplicate assignment
        const existingAssignment = await pool.query(
            'SELECT id FROM staff_shifts WHERE staff_id = $1 AND shift_date = $2',
            [staff_id, shift_date]
        );

        if (existingAssignment.rows.length > 0) {
            return res.status(409).json(
                createResponse(false, '🔄 Staff already assigned for this date', null, 'Duplicate assignment')
            );
        }

        const newAssignment = await pool.query(
            'INSERT INTO staff_shifts (staff_id, shift_id, shift_date) VALUES ($1, $2, $3) RETURNING *',
            [staff_id, shift_id, shift_date]
        );
        
        res.status(201).json(
            createResponse(true, '✅ Shift assigned successfully', newAssignment.rows[0])
        );
    } catch (err) {
        console.error('❌ Assign Shift Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to assign shift', null, err.message)
        );
    }
};

// Elegant Get Schedule
const getSchedule = async (req, res) => {
    try {
        const { date, staff_id } = req.query;
        let query = `
            SELECT 
                ss.id, 
                ss.shift_date, 
                s.name as staff_name, 
                s.role,
                s.contact,
                sh.name as shift_name, 
                sh.start_time, 
                sh.end_time,
                CASE 
                    WHEN ss.shift_date = CURRENT_DATE THEN '🟢 Today'
                    WHEN ss.shift_date > CURRENT_DATE THEN '🔵 Upcoming'
                    ELSE '� completed'
                END as status
            FROM staff_shifts ss
            JOIN staff s ON ss.staff_id = s.id
            JOIN shifts sh ON ss.shift_id = sh.id
        `;
        const params = [];
        const conditions = [];

        if (date) {
            conditions.push(`ss.shift_date = $${params.length + 1}`);
            params.push(date);
        }

        if (staff_id) {
            conditions.push(`ss.staff_id = $${params.length + 1}`);
            params.push(staff_id);
        }

        if (conditions.length > 0) {
            query += ' WHERE ' + conditions.join(' AND ');
        }

        query += ` ORDER BY ss.shift_date DESC, sh.start_time ASC`;

        const schedule = await pool.query(query, params);
        
        const message = date ? 
            `📅 Schedule for ${date}: ${schedule.rows.length} assignments` :
            `📊 Complete schedule: ${schedule.rows.length} total assignments`;

        res.json(
            createResponse(true, message, schedule.rows)
        );
    } catch (err) {
        console.error('❌ Get Schedule Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to retrieve schedule', null, err.message)
        );
    }
};

module.exports = { 
    addStaff, 
    getStaff, 
    addShift, 
    getShifts, 
    assignShift, 
    getSchedule 
};
