import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, GraduationCap, Shield, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [mode, setMode] = useState('student'); // 'student' | 'teacher'
    const [loading, setLoading] = useState(false);

    // Form States
    const [rollNo, setRollNo] = useState('');
    const [studentName, setStudentName] = useState('');
    const [className, setClassName] = useState('10');
    const [section, setSection] = useState('A');

    const [instName, setInstName] = useState('');
    const [instPassword, setInstPassword] = useState('');

    const handleStudentLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const loginData = {
                name: studentName,
                roll_no: rollNo,
                class_name: className,
                section: section
            };
            const res = await authAPI.studentLogin(loginData);
            login('student', res.data.data.student);
            toast.success(`Welcome back, ${res.data.data.student.name}!`);
            navigate('/students'); // Direct to reports for students
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleTeacherLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.teacherLogin(instName, instPassword);
            login('teacher');
            toast.success('Welcome back, Teacher!');
            navigate('/');
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-gray-100"
            >
                <div className="p-8 pb-4 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                            <GraduationCap size={40} />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-2">School ERP</h1>
                    <p className="text-gray-500 text-sm">Welcome back! Please login to continue.</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 px-8">
                    <button
                        onClick={() => setMode('student')}
                        className={`flex-1 pb-4 text-sm font-bold transition-all ${mode === 'student' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    >
                        Student Login
                    </button>
                    <button
                        onClick={() => setMode('teacher')}
                        className={`flex-1 pb-4 text-sm font-bold transition-all ${mode === 'teacher' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400'}`}
                    >
                        Teacher Login
                    </button>
                </div>

                <div className="p-8 pt-6">
                    {mode === 'student' ? (
                        <form onSubmit={handleStudentLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Enter Name"
                                        value={studentName}
                                        onChange={e => setStudentName(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                                        placeholder="Roll No (e.g., 1)"
                                        value={rollNo}
                                        onChange={e => setRollNo(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium"
                                        value={className}
                                        onChange={e => setClassName(e.target.value)}
                                    >
                                        <option value="10">10</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                    <select
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all bg-white font-medium"
                                        value={section}
                                        onChange={e => setSection(e.target.value)}
                                    >
                                        <option value="A">A</option>
                                        <option value="B">B</option>
                                        <option value="C">C</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            >
                                {loading ? 'Validating...' : 'View My Report'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleTeacherLogin} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="MySchool"
                                        value={instName}
                                        onChange={e => setInstName(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                                        placeholder="••••••"
                                        value={instPassword}
                                        onChange={e => setInstPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Verifying...' : 'Access Dashboard'}
                            </button>
                            <div className="text-center text-xs text-gray-400 mt-4">
                                Demo: Use <b>MySchool</b> / <b>admin</b>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
