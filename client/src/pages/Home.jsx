import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Calendar, Users, BarChart, TrendingUp, Clock, BookOpen, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { studentAPI, shiftAPI, healthAPI } from '../services/api';
import toast from 'react-hot-toast';

const StatCard = ({ icon: Icon, title, value, color, trend, loading }) => (
    <motion.div
        whileHover={{ scale: 1.02 }}
        className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden"
    >
        {loading && (
            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                <Activity className="animate-spin text-blue-500" size={24} />
            </div>
        )}
        <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
                <Icon size={24} className="text-white" />
            </div>
            {trend && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <TrendingUp size={16} />
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
        <p className="text-gray-500 text-sm">{title}</p>
    </motion.div>
);

const FeatureCard = ({ icon: Icon, title, description, to, color }) => (
    <Link to={to} className="block group">
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition-all border border-gray-100 h-full"
        >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${color}`}>
                <Icon size={28} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </motion.div>
    </Link>
);

const Home = () => {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalStaff: 0,
        todayShifts: 0,
        totalSubjects: 0
    });
    const [loading, setLoading] = useState(true);
    const [healthStatus, setHealthStatus] = useState('checking');
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        loadStats();
        checkHealth();

        // Refresh stats every 30 seconds
        const interval = setInterval(loadStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const [studentsRes, staffRes, scheduleRes, subjectsRes] = await Promise.all([
                studentAPI.getStudents(),
                shiftAPI.getStaff(),
                shiftAPI.getSchedule(),
                studentAPI.getSubjects()
            ]);

            const today = new Date().toISOString().split('T')[0];
            const todayShifts = scheduleRes.data?.data?.filter?.(shift =>
                shift.shift_date === today
            )?.length || 0;

            setStats({
                totalStudents: studentsRes.data?.data?.length || 0,
                totalStaff: staffRes.data?.data?.length || 0,
                todayShifts: todayShifts,
                totalSubjects: subjectsRes.data?.data?.length || 0
            });

            setLastUpdated(new Date());
        } catch (err) {
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    const checkHealth = async () => {
        try {
            setHealthStatus('checking');
            const response = await healthAPI.check();
            setHealthStatus(response.data?.success ? 'healthy' : 'unhealthy');
        } catch (err) {
            setHealthStatus('unhealthy');
            console.error('Health check failed:', err);
        }
    };

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Health Status Bar */}
            <div className="mb-8">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl ${healthStatus === 'healthy' ? 'bg-green-50 text-green-700 border border-green-200' :
                    healthStatus === 'checking' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    <Activity className={`w-5 h-5 ${healthStatus === 'checking' ? 'animate-spin' : ''}`} />
                    <span className="font-medium">
                        {healthStatus === 'healthy' ? '🟢 System Healthy' :
                            healthStatus === 'checking' ? '🟡 Checking System...' : '🔴 System Issues'}
                    </span>
                    {lastUpdated && (
                        <span className="text-sm opacity-75 ml-auto">
                            Last updated: {lastUpdated.toLocaleTimeString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8 mb-12"
            >
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
                    Welcome to <span className="text-blue-600">School ERP</span>
                </h1>
                <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                    Manage your institution efficiently with our elegant and powerful tools for student reporting and staff scheduling.
                </p>
            </motion.div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    icon={GraduationCap}
                    title="Total Students"
                    value={stats.totalStudents}
                    color="bg-blue-500"
                    trend={12}
                    loading={loading}
                />
                <StatCard
                    icon={Users}
                    title="Total Staff"
                    value={stats.totalStaff}
                    color="bg-purple-500"
                    trend={8}
                    loading={loading}
                />
                <StatCard
                    icon={Clock}
                    title="Today's Shifts"
                    value={stats.todayShifts}
                    color="bg-green-500"
                    loading={loading}
                />
                <StatCard
                    icon={BookOpen}
                    title="Subjects"
                    value={stats.totalSubjects}
                    color="bg-orange-500"
                    loading={loading}
                />
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                <FeatureCard
                    to="/students"
                    icon={GraduationCap}
                    title="Student Reports"
                    description="Track academic performance, manage grades, and generate detailed report cards for every student."
                    color="bg-blue-500"
                />
                <FeatureCard
                    to="/shifts"
                    icon={Calendar}
                    title="Shift Management"
                    description="Organize staff schedules, assign shifts, and ensure smooth daily operations with our intuitive calendar."
                    color="bg-purple-500"
                />
                <FeatureCard
                    to="/analytics"
                    icon={BarChart}
                    title="Analytics Dashboard"
                    description="Visual insights into school performance and attendance trends with real-time monitoring."
                    color="bg-indigo-500"
                />
            </div>

            {/* System Info */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-16 border-t border-gray-200 pt-8"
            >
                <div className="text-center">
                    <div className="flex items-center justify-center gap-6 text-sm text-gray-400 mb-4">
                        <span>🎓 Version 2.0.0</span>
                        <span>•</span>
                        <span>🗄️ PostgreSQL Database</span>
                        <span>•</span>
                        <span>⚡ Real-time Updates</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                        &copy; 2026 School ERP System. Built with ❤️ for educational excellence.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default Home;
