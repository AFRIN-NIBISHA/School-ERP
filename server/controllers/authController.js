const pool = require('../config/db');

// Elegant Response Helper
const createResponse = (success, message, data = null, error = null) => ({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
});

// Credentials for Teacher Login (Hardcoded for Demo)
const INSTITUTION_CREDENTIALS = {
    name: "MySchool",
    password: "admin"
};

const studentLogin = async (req, res) => {
    try {
        const { name, roll_no, class_name, section } = req.body;

        if (!name || !roll_no || !class_name || !section) {
            return res.status(400).json(createResponse(false, '⚠️ All fields are required (Name, Roll No, Class, Section)'));
        }

        // Check if student exists matching ALL criteria
        // Case-insensitive check for string fields
        const student = await pool.query(
            `SELECT * FROM students 
             WHERE LOWER(name) = LOWER($1) 
             AND roll_no = $2 
             AND LOWER("class") = LOWER($3) 
             AND LOWER(section) = LOWER($4)`,
            [name.trim(), roll_no.trim(), class_name.trim(), section.trim()]
        );

        if (student.rows.length === 0) {
            return res.status(404).json(createResponse(false, '❌ Student not found with these details'));
        }

        res.json(createResponse(true, '✅ Student Login Successful', {
            role: 'student',
            student: student.rows[0]
        }));

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json(createResponse(false, 'Login Failed', null, err.message));
    }
};

const teacherLogin = async (req, res) => {
    try {
        const { institution_name, password } = req.body;

        if (!institution_name || !password) {
            return res.status(400).json(createResponse(false, '⚠️ All fields are required'));
        }

        if (institution_name === INSTITUTION_CREDENTIALS.name && password === INSTITUTION_CREDENTIALS.password) {
            res.json(createResponse(true, '✅ Teacher Login Successful', {
                role: 'teacher'
            }));
        } else {
            res.status(401).json(createResponse(false, '❌ Invalid Institution Name or Password'));
        }

    } catch (err) {
        console.error('Login Error:', err);
        res.status(500).json(createResponse(false, 'Login Failed', null, err.message));
    }
};

module.exports = {
    studentLogin,
    teacherLogin
};
