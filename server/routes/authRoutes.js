const express = require('express');
const router = express.Router();
const { studentLogin, teacherLogin } = require('../controllers/authController');

router.post('/student-login', studentLogin);
router.post('/teacher-login', teacherLogin);

module.exports = router;
