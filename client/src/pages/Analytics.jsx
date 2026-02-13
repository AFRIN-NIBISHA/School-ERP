import React, { useState, useEffect } from 'react';
import { analyticsAPI } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, TrendingUp, Users, BookOpen } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const res = await analyticsAPI.getDashboard();
            setData(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">Loading Analytics...</div>;
    if (!data) return <div className="p-10 text-center text-red-500">Failed to load analytics data</div>;

    // Process data for charts
    const classData = data.classDistribution.map(item => ({
        name: `Class ${item.class}-${item.section}`,
        students: parseInt(item.count)
    }));

    const subjectData = data.subjectPerformance.map(item => ({
        name: item.subject,
        average: parseFloat(item.average_percentage)
    }));

    const gradeData = data.gradeDistribution.map(item => ({
        name: item.grade,
        value: parseInt(item.count)
    }));

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Activity className="text-indigo-600" size={32} />
                    Analytics Dashboard
                </h1>
                <p className="text-gray-500 mt-2">Real-time insights and performance metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-blue-100 p-3 rounded-xl text-blue-600">
                            <Users size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{data.counts.total_students}</h3>
                    <p className="text-gray-500 text-sm">Total Students</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+5%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{Math.round(subjectData.reduce((acc, curr) => acc + curr.average, 0) / (subjectData.length || 1))}%</h3>
                    <p className="text-gray-500 text-sm">Average Score</p>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <div className="bg-orange-100 p-3 rounded-xl text-orange-600">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800">{data.counts.total_staff}</h3>
                    <p className="text-gray-500 text-sm">Active Staff</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* Subject Performance */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Subject Performance (Average %)</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={subjectData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Grade Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Grade Distribution</h3>
                    <div className="h-80 w-full flex justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={gradeData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {gradeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Class Distribution */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-1 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Student Distribution by Class</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={classData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} />
                                <Bar dataKey="students" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={50} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;
