const pool = require('../config/db');

// Elegant Response Helper
const createResponse = (success, message, data = null, error = null) => ({
    success,
    message,
    data,
    error,
    timestamp: new Date().toISOString()
});

const getAnalytics = async (req, res) => {
    try {
        const stats = {};

        // 1. Student Distribution by Class
        const classDist = await pool.query(`
            SELECT "class", section, COUNT(*) as count 
            FROM students 
            GROUP BY "class", section 
            ORDER BY "class", section
        `);
        stats.classDistribution = classDist.rows;

        // 2. Subject Performance (Average Marks)
        const subjectPerf = await pool.query(`
            SELECT s.name as subject, ROUND(AVG(m.marks_obtained::numeric / m.max_marks * 100), 2) as average_percentage
            FROM marks m
            JOIN subjects s ON m.subject_id = s.id
            GROUP BY s.name
            ORDER BY average_percentage DESC
        `);
        stats.subjectPerformance = subjectPerf.rows;

        // 3. Overall Grade Distribution
        const gradeDist = await pool.query(`
            SELECT 
                CASE 
                    WHEN (marks_obtained::float / max_marks * 100) >= 90 THEN 'Excellent'
                    WHEN (marks_obtained::float / max_marks * 100) >= 80 THEN 'Very Good'
                    WHEN (marks_obtained::float / max_marks * 100) >= 70 THEN 'Good'
                    WHEN (marks_obtained::float / max_marks * 100) >= 60 THEN 'Average'
                    ELSE 'Needs Improvement'
                END as grade,
                COUNT(*) as count
            FROM marks
            GROUP BY grade
        `);
        stats.gradeDistribution = gradeDist.rows;

        // 4. Counts
        const counts = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM students) as total_students,
                (SELECT COUNT(*) FROM staff) as total_staff,
                (SELECT COUNT(*) FROM shifts) as total_shifts
        `);
        stats.counts = counts.rows[0];

        res.json(createResponse(true, '📊 Analytics data retrieved', stats));

    } catch (err) {
        console.error('❌ Analytics Error:', err.message);
        res.status(500).json(createResponse(false, 'Failed to fetch analytics', null, err.message));
    }
};

module.exports = {
    getAnalytics
};
