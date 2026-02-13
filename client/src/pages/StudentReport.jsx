import React, { useState, useEffect } from 'react';
import { studentAPI } from '../services/api';
import { Plus, Search, FileText, ArrowRight, GraduationCap, X } from 'lucide-react';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const StudentReport = () => {
    const { userRole, currentUser } = useAuth();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [reportData, setReportData] = useState(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isMarksOpen, setIsMarksOpen] = useState(false);

    // Form States
    const [newStudent, setNewStudent] = useState({ name: '', roll_no: '', class_name: '', section: '' });
    const [marksForm, setMarksForm] = useState({ subject_id: '', exam_type: 'Mid-Term', marks_obtained: '', max_marks: 100 });
    const [subjects, setSubjects] = useState([]);

    const [selectedClass, setSelectedClass] = useState(null);
    const classOptions = ['10 A', '10 B', '10 C'];

    useEffect(() => {
        loadStudents();
        loadSubjects();
    }, []);

    const loadStudents = async () => {
        try {
            const res = await studentAPI.getStudents();
            let allStudents = res.data?.data || [];

            // Normalize class property for consistency (backend returns 'class', frontend form uses 'class_name')
            allStudents = allStudents.map(s => ({
                ...s,
                class_name: s.class || s.class_name // Ensure consistent property
            }));

            // If student logged in, only show their own record
            if (userRole === 'student' && currentUser) {
                allStudents = allStudents.filter(s => s.id === currentUser.id);
            }

            setStudents(allStudents);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadSubjects = async () => {
        try {
            const res = await studentAPI.getSubjects();
            setSubjects(res.data?.data || []);
        } catch (err) { console.error(err); }
    };

    const handleCreateStudent = async (e) => {
        e.preventDefault();

        // Client-side validation
        if (!newStudent.name.trim()) {
            toast.error('Student name is required');
            return;
        }

        if (!newStudent.roll_no.trim()) {
            toast.error('Roll number is required');
            return;
        }

        if (!newStudent.class_name.trim()) {
            toast.error('Class is required');
            return;
        }

        if (!newStudent.section.trim()) {
            toast.error('Section is required');
            return;
        }

        // Check for duplicate roll number locally within the SAME Class & Section
        const existingStudent = students.find(s =>
            s.roll_no === newStudent.roll_no.trim() &&
            s.class_name === newStudent.class_name.trim() &&
            s.section === newStudent.section.trim()
        );

        if (existingStudent) {
            toast.error(`🔄 Roll number already exists in Class ${newStudent.class_name} - ${newStudent.section}`);
            return;
        }

        try {
            await studentAPI.addStudent(newStudent);
            setIsAddOpen(false);
            setNewStudent({ name: '', roll_no: '', class_name: '', section: '' });
            loadStudents();
            toast.success('Student added successfully');
        } catch (err) {
            console.error('Error adding student:', err);
            // Backend might return specific error message
            const errorMsg = err.response?.data?.message || 'Failed to add student';
            toast.error(errorMsg);
        }
    };

    const handleViewReport = async (student) => {
        try {
            const res = await studentAPI.getReport(student.id);
            setReportData(res.data.data);
            setSelectedStudent(student);
        } catch (err) {
            console.error('Error viewing report:', err);
        }
    };

    const handleAddMarks = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            await studentAPI.addMarks({ ...marksForm, student_id: selectedStudent.id });
            setIsMarksOpen(false);
            handleViewReport(selectedStudent); // Reload report
            toast.success('Marks added successfully');
        } catch (err) {
            console.error('Error adding marks:', err);
        }
    };

    // Filter students based on selected Class Tab
    const filteredStudents = selectedClass ? students.filter(student => {
        const currentClassComp = `${student.class_name} ${student.section}`;
        return currentClassComp === selectedClass;
    }) : [];

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-extrabold text-gray-900 flex items-center gap-3">
                        <GraduationCap className="w-10 h-10 text-blue-600" />
                        Student Reports
                    </h1>
                    <p className="text-lg text-gray-600 mt-2 font-medium">Manage students and academic records</p>
                </div>
                {userRole === 'teacher' && (
                    <button
                        onClick={() => {
                            const [cls, sec] = selectedClass.split(' ');
                            setNewStudent({ name: '', roll_no: '', class_name: cls || '', section: sec || '' });
                            setIsAddOpen(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 text-lg"
                    >
                        <Plus size={22} /> Add Student
                    </button>
                )}
            </div>

            {/* Class Selection Tabs */}
            <div className="flex gap-4 mb-8">
                {classOptions.map((option) => (
                    <button
                        key={option}
                        onClick={() => setSelectedClass(option)}
                        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all ${selectedClass === option
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-105'
                            : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        Class {option}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? <div className="text-center py-20">Loading...</div> : (
                <>
                    {!selectedClass ? (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm">
                            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <GraduationCap size={40} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Class</h3>
                            <p className="text-gray-500 font-medium max-w-md mx-auto">Please select a class from the tabs above to view students and their reports.</p>
                        </div>
                    ) : (
                        <>
                            {filteredStudents.length === 0 ? (
                                <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                    <p className="text-xl text-gray-400 font-medium">No students found in Class {selectedClass}</p>
                                    {userRole === 'teacher' && (
                                        <button
                                            onClick={() => {
                                                setNewStudent({
                                                    name: '',
                                                    roll_no: '',
                                                    class_name: selectedClass.split(' ')[0],
                                                    section: selectedClass.split(' ')[1]
                                                });
                                                setIsAddOpen(true);
                                            }}
                                            className="mt-4 text-blue-600 hover:text-blue-700 font-bold flex items-center gap-2 mx-auto"
                                        >
                                            <Plus size={20} /> Add Student to {selectedClass}
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredStudents.map(student => (
                                        <div key={student.id} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-xl shadow-lg">
                                                    {student.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-1">{student.name}</h3>
                                                    <p className="text-gray-600 font-medium">Roll: {student.roll_no}</p>
                                                    <p className="text-gray-500">Class {student.class_name} - {student.section}</p>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleViewReport(student)}
                                                className="w-full py-2 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                                            >
                                                View Report <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Add Modal (Only visible if state is true) */}
            <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Student">
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={newStudent.name} onChange={e => setNewStudent({ ...newStudent, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={newStudent.roll_no} onChange={e => setNewStudent({ ...newStudent, roll_no: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={newStudent.class_name} onChange={e => setNewStudent({ ...newStudent, class_name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                            <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={newStudent.section} onChange={e => setNewStudent({ ...newStudent, section: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all mt-6">
                        Create Student
                    </button>
                </form>
            </Modal>

            {/* Report Modal */}
            <Modal isOpen={!!selectedStudent && !isMarksOpen} onClose={() => setSelectedStudent(null)} title="Student Report Card">
                {reportData && (
                    <div>
                        <div className="text-center mb-6">
                            <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-4xl mx-auto mb-4 shadow-xl">
                                {reportData.student.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">{reportData.student.name}</h2>
                            <div className="flex justify-center gap-4 text-gray-600 font-medium">
                                <span className="bg-gray-100 px-3 py-1 rounded-lg">Roll: {reportData.student.roll_no}</span>
                                <span className="bg-gray-100 px-3 py-1 rounded-lg">Class {reportData.student.class || reportData.student.class_name} - {reportData.student.section}</span>
                            </div>
                        </div>

                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                            {reportData.marks && reportData.marks.length > 0 ? (
                                <table className="w-full text-sm text-left text-gray-500 rounded-lg overflow-hidden">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 text-center">
                                        <tr>
                                            <th className="px-4 py-3 text-left">Subject</th>
                                            <th className="px-4 py-3">Mid-Term (100)</th>
                                            <th className="px-4 py-3">Quarterly (100)</th>
                                            <th className="px-4 py-3 font-bold bg-gray-100">Total (200)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {reportData.marks.map((row, index) => (
                                            <tr key={index} className="bg-white border-b hover:bg-gray-50 text-center">
                                                <td className="px-4 py-3 font-medium text-gray-900 text-left border-r border-gray-100">{row.subject}</td>

                                                <td className={`px-4 py-3 border-r border-gray-100 ${row.mid_term < 35 && row.mid_term !== '-' ? 'text-red-500 font-bold' : ''}`}>
                                                    {row.mid_term}
                                                </td>

                                                <td className={`px-4 py-3 border-r border-gray-100 ${row.quarterly < 35 && row.quarterly !== '-' ? 'text-red-500 font-bold' : ''}`}>
                                                    {row.quarterly}
                                                </td>

                                                <td className={`px-4 py-3 font-bold bg-gray-50 ${row.total < 70 ? 'text-red-600' : 'text-blue-600'}`}>
                                                    {row.total}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                    No marks recorded yet.
                                </div>
                            )}
                        </div>

                        {userRole === 'teacher' && (
                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button onClick={() => setIsMarksOpen(true)} className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1">
                                    <Plus size={16} /> Add Marks
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Add Marks Modal - Only reachable if button is clicked (role checked above) */}
            <Modal isOpen={isMarksOpen} onClose={() => setIsMarksOpen(false)} title={`Add Marks for ${selectedStudent?.name}`}>
                <form onSubmit={handleAddMarks} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                        <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={marksForm.subject_id} onChange={e => setMarksForm({ ...marksForm, subject_id: e.target.value })}
                        >
                            <option value="">Select Subject</option>
                            {subjects.map(sub => (
                                <option key={sub.id} value={sub.id}>{sub.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            value={marksForm.exam_type} onChange={e => setMarksForm({ ...marksForm, exam_type: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Marks Obtained</label>
                            <input type="number" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={marksForm.marks_obtained} onChange={e => setMarksForm({ ...marksForm, marks_obtained: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Max Marks</label>
                            <input type="number" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={marksForm.max_marks} onChange={e => setMarksForm({ ...marksForm, max_marks: e.target.value })} />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={() => setIsMarksOpen(false)} className="flex-1 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-colors">
                            Cancel
                        </button>
                        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all">
                            Save Marks
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default StudentReport;
