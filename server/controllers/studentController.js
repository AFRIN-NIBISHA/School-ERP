const pool = require('../config/db');

// Elegant Response Helper
const createResponse = (success, message, data = null, error = null) => ({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
});

// Elegant Add Student
const addStudent = async (req, res) => {
    try {
        console.log('📥 Add Student Request:', req.body);
        const { name, roll_no, class_name, section } = req.body;

        // Elegant Validation
        if (!name || !roll_no || !class_name || !section) {
            return res.status(400).json(
                createResponse(false, '⚠️ All fields are required', null, 'Missing required fields')
            );
        }

        // Elegant Database Insert
        const newStudent = await pool.query(
            'INSERT INTO students (name, roll_no, "class", section) VALUES ($1, $2, $3, $4) RETURNING *',
            [name.trim(), roll_no.trim(), class_name.trim(), section.trim()]
        );

        res.status(201).json(
            createResponse(true, '✅ Student added successfully', newStudent.rows[0])
        );
    } catch (err) {
        console.error('❌ Add Student Error:', err.message);

        // Elegant Duplicate Handling
        if (err.code === '23505') {
            return res.status(409).json(
                createResponse(false, '🔄 Roll number "' + roll_no + '" already exists', null, 'Duplicate roll number: ' + roll_no)
            );
        }

        res.status(500).json(
            createResponse(false, '❌ Failed to add student', null, err.message)
        );
    }
};

// Elegant Get All Students
const getAllStudents = async (req, res) => {
    try {
        const allStudents = await pool.query(
            'SELECT * FROM students ORDER BY length(roll_no), roll_no ASC'
        );

        res.json(
            createResponse(true, `📚 Found ${allStudents.rows.length} students`, allStudents.rows)
        );
    } catch (err) {
        console.error('❌ Get Students Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to retrieve students', null, err.message)
        );
    }
};

// Elegant Add Marks
const addMarks = async (req, res) => {
    try {
        const { student_id, subject_id, exam_type, marks_obtained, max_marks } = req.body;

        // Elegant Validation
        if (!student_id || !subject_id || !exam_type || marks_obtained === undefined || !max_marks) {
            return res.status(400).json(
                createResponse(false, '⚠️ All fields are required', null, 'Missing required fields')
            );
        }

        if (marks_obtained > max_marks) {
            return res.status(400).json(
                createResponse(false, '⚠️ Marks obtained cannot exceed maximum marks', null, 'Invalid marks')
            );
        }

        const newMarks = await pool.query(
            'INSERT INTO marks (student_id, subject_id, exam_type, marks_obtained, max_marks) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [student_id, subject_id, exam_type.trim(), marks_obtained, max_marks]
        );

        res.status(201).json(
            createResponse(true, '✅ Marks added successfully', newMarks.rows[0])
        );
    } catch (err) {
        console.error('❌ Add Marks Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to add marks', null, err.message)
        );
    }
};

// Elegant Get Student Report
const getStudentReport = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(id)) {
            return res.status(400).json(
                createResponse(false, '⚠️ Valid student ID is required', null, 'Invalid student ID')
            );
        }

        // Get Student Info
        const student = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
        if (student.rows.length === 0) {
            return res.status(404).json(
                createResponse(false, '🔍 Student not found', null, 'Student ID does not exist')
            );
        }

        // Get Marks with Subject Names
        const marksRes = await pool.query(`
            SELECT 
                s.name as subject, 
                m.exam_type, 
                m.marks_obtained, 
                m.max_marks
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            WHERE m.student_id = $1
            ORDER BY s.id -- Keep consistent order
        `, [id]);

        // Process marks to group by subject
        const subjectsMap = {};

        marksRes.rows.forEach(row => {
            if (!subjectsMap[row.subject]) {
                subjectsMap[row.subject] = {
                    subject: row.subject,
                    mid_term: '-',
                    quarterly: '-',
                    total: 0
                };
            }

            if (row.exam_type === 'Mid-Term') {
                subjectsMap[row.subject].mid_term = row.marks_obtained;
                subjectsMap[row.subject].total += row.marks_obtained;
            } else if (row.exam_type === 'Quarterly') {
                subjectsMap[row.subject].quarterly = row.marks_obtained;
                subjectsMap[row.subject].total += row.marks_obtained;
            }
        });

        const formattedMarks = Object.values(subjectsMap);

        // Calculate Overall Performance
        const totalObtained = formattedMarks.reduce((sum, item) => sum + item.total, 0);
        // Assuming max marks is 100 per exam, so 200 per subject total
        const totalMax = formattedMarks.length * 200;
        const overallPercentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;

        const reportData = {
            student: student.rows[0],
            marks: formattedMarks,
            summary: {
                totalSubjects: formattedMarks.length,
                overallPercentage,
                totalMarksObtained: totalObtained,
                totalMaxMarks: totalMax,
                grade: overallPercentage >= 90 ? '🏆 Excellent' :
                    overallPercentage >= 80 ? '🌟 Very Good' :
                        overallPercentage >= 70 ? '👍 Good' :
                            overallPercentage >= 60 ? '✅ Average' : '❌ Needs Improvement'
            }
        };

        res.json(
            createResponse(true, '📊 Student report generated successfully', reportData)
        );
    } catch (err) {
        console.error('❌ Get Report Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to generate report', null, err.message)
        );
    }
};

// Elegant Get Subjects
const getSubjects = async (req, res) => {
    try {
        const subjects = await pool.query(
            'SELECT * FROM subjects ORDER BY name'
        );

        res.json(
            createResponse(true, `📖 Found ${subjects.rows.length} subjects`, subjects.rows)
        );
    } catch (err) {
        console.error('❌ Get Subjects Error:', err.message);
        res.status(500).json(
            createResponse(false, '❌ Failed to retrieve subjects', null, err.message)
        );
    }
};

module.exports = {
    addStudent,
    getAllStudents,
    addMarks,
    getStudentReport,
    getSubjects
};
