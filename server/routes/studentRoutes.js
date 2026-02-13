const express = require('express');
const router = express.Router();
const { addStudent, getAllStudents, addMarks, getStudentReport, getSubjects } = require('../controllers/studentController');

router.post('/', addStudent);
router.get('/', getAllStudents);
router.post('/marks', addMarks);
router.get('/:id/report', getStudentReport);
router.get('/subjects', getSubjects);

module.exports = router;
