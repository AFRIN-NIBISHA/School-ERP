const express = require('express');
const router = express.Router();
const { addStaff, getStaff, addShift, getShifts, assignShift, getSchedule } = require('../controllers/shiftController');

router.post('/staff', addStaff);
router.get('/staff', getStaff);
router.post('/definition', addShift);
router.get('/definition', getShifts);
router.post('/assign', assignShift);
router.get('/schedule', getSchedule);

module.exports = router;
