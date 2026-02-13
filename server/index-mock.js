const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Mock data for testing without database
const mockStudents = [
    { id: 1, name: "Arun Kumar", roll_no: "STU001", class: "10-A", section: "A", created_at: new Date() },
    { id: 2, name: "Priya Sharma", roll_no: "STU002", class: "9-B", section: "B", created_at: new Date() },
    { id: 3, name: "Rahul Verma", roll_no: "STU003", class: "10-A", section: "A", created_at: new Date() }
];

const mockSubjects = [
    { id: 1, name: "Mathematics" },
    { id: 2, name: "Science" },
    { id: 3, name: "English" },
    { id: 4, name: "History" }
];

const mockMarks = [
    { id: 1, student_id: 1, subject_id: 1, exam_type: "Mid-Term", marks_obtained: 85, max_marks: 100, created_at: new Date() },
    { id: 2, student_id: 1, subject_id: 2, exam_type: "Mid-Term", marks_obtained: 78, max_marks: 100, created_at: new Date() },
    { id: 3, student_id: 2, subject_id: 1, exam_type: "Mid-Term", marks_obtained: 92, max_marks: 100, created_at: new Date() }
];

const mockStaff = [
    { id: 1, name: "John Smith", role: "Teacher", contact: "9876543210", created_at: new Date() },
    { id: 2, name: "Sarah Johnson", role: "Administrator", contact: "9876543211", created_at: new Date() }
];

const mockShifts = [
    { id: 1, name: "Morning", start_time: "08:00:00", end_time: "13:00:00" },
    { id: 2, name: "Afternoon", start_time: "13:00:00", end_time: "18:00:00" }
];

const mockStaffShifts = [
    { id: 1, staff_id: 1, shift_id: 1, shift_date: new Date().toISOString().split('T')[0], created_at: new Date() },
    { id: 2, staff_id: 2, shift_id: 2, shift_date: new Date().toISOString().split('T')[0], created_at: new Date() }
];

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock API endpoints
app.get('/api/students', (req, res) => {
    res.json(mockStudents);
});

app.post('/api/students', (req, res) => {
    const newStudent = {
        id: mockStudents.length + 1,
        ...req.body,
        created_at: new Date()
    };
    mockStudents.push(newStudent);
    res.json(newStudent);
});

app.get('/api/students/subjects', (req, res) => {
    res.json(mockSubjects);
});

app.post('/api/students/marks', (req, res) => {
    const newMark = {
        id: mockMarks.length + 1,
        ...req.body,
        created_at: new Date()
    };
    mockMarks.push(newMark);
    res.json(newMark);
});

app.get('/api/students/:id/report', (req, res) => {
    const student = mockStudents.find(s => s.id == req.params.id);
    if (!student) {
        return res.status(404).json({ msg: 'Student not found' });
    }
    
    const studentMarks = mockMarks.filter(m => m.student_id == req.params.id);
    const report = studentMarks.map(mark => {
        const subject = mockSubjects.find(s => s.id === mark.subject_id);
        return {
            ...mark,
            subject: subject ? subject.name : 'Unknown'
        };
    });
    
    res.json({
        student,
        report
    });
});

app.get('/api/shifts/staff', (req, res) => {
    res.json(mockStaff);
});

app.post('/api/shifts/staff', (req, res) => {
    const newStaff = {
        id: mockStaff.length + 1,
        ...req.body,
        created_at: new Date()
    };
    mockStaff.push(newStaff);
    res.json(newStaff);
});

app.get('/api/shifts/definition', (req, res) => {
    res.json(mockShifts);
});

app.post('/api/shifts/definition', (req, res) => {
    const newShift = {
        id: mockShifts.length + 1,
        ...req.body
    };
    mockShifts.push(newShift);
    res.json(newShift);
});

app.post('/api/shifts/assign', (req, res) => {
    const newAssignment = {
        id: mockStaffShifts.length + 1,
        ...req.body,
        created_at: new Date()
    };
    mockStaffShifts.push(newAssignment);
    res.json(newAssignment);
});

app.get('/api/shifts/schedule', (req, res) => {
    const schedule = mockStaffShifts.map(staffShift => {
        const staff = mockStaff.find(s => s.id === staffShift.staff_id);
        const shift = mockShifts.find(s => s.id === staffShift.shift_id);
        return {
            ...staffShift,
            staff_name: staff ? staff.name : 'Unknown',
            role: staff ? staff.role : 'Unknown',
            shift_name: shift ? shift.name : 'Unknown',
            start_time: shift ? shift.start_time : '00:00:00',
            end_time: shift ? shift.end_time : '00:00:00'
        };
    });
    res.json(schedule);
});

// Test DB Connection (mock)
app.get('/test-db', async (req, res) => {
    res.json({ 
        message: 'Mock Data Mode - No Database Required', 
        time: new Date().toISOString(),
        mode: 'MOCK_DATA'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log('🚀 School ERP Backend - Mock Data Mode');
    console.log('📊 Frontend: http://localhost:5173');
    console.log('🔧 API: http://localhost:5000');
    console.log('💡 To use real database, install PostgreSQL and update .env');
});
