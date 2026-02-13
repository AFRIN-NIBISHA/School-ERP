import React, { useState, useEffect } from 'react';
import { shiftAPI } from '../services/api';
import { Calendar, Users, Clock, Plus, UserPlus, Briefcase } from 'lucide-react';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const ShiftManagement = () => {
    const [schedule, setSchedule] = useState([]);
    const [staffList, setStaffList] = useState([]);
    const [shiftDefinitions, setShiftDefinitions] = useState([]);
    const [view, setView] = useState('schedule'); // schedule | staff

    // Modals
    const [isAssignOpen, setIsAssignOpen] = useState(false);
    const [isStaffOpen, setIsStaffOpen] = useState(false);
    const [isShiftOpen, setIsShiftOpen] = useState(false);

    // Forms
    const [assignForm, setAssignForm] = useState({ staff_id: '', shift_id: '', shift_date: new Date().toISOString().split('T')[0] });
    const [staffForm, setStaffForm] = useState({ name: '', role: 'Teacher', contact: '' });
    const [shiftForm, setShiftForm] = useState({ name: '', start_time: '', end_time: '' });

    useEffect(() => {
        loadSchedule();
        loadStaff();
        loadShifts();
    }, []);

    const loadSchedule = async () => {
        try {
            const res = await shiftAPI.getSchedule();
            setSchedule(res.data?.data || []);
        } catch (err) { console.error(err); }
    };

    const loadStaff = async () => {
        try {
            const res = await shiftAPI.getStaff();
            setStaffList(res.data?.data || []);
        } catch (err) { console.error(err); }
    };

    const loadShifts = async () => {
        try {
            const res = await shiftAPI.getShifts();
            setShiftDefinitions(res.data?.data || []);
        } catch (err) { console.error(err); }
    };

    const handleAssignShift = async (e) => {
        e.preventDefault();
        try {
            await shiftAPI.assignShift(assignForm);
            setIsAssignOpen(false);
            loadSchedule();
        } catch (err) {
            console.error('Error assigning shift:', err);
        }
    };

    const handleAddStaff = async (e) => {
        e.preventDefault();
        try {
            await shiftAPI.addStaff(staffForm);
            setIsStaffOpen(false);
            setStaffForm({ name: '', role: 'Teacher', contact: '' });
            loadStaff();
        } catch (err) {
            console.error('Error adding staff:', err);
        }
    };

    const handleAddShift = async (e) => {
        e.preventDefault();
        try {
            await shiftAPI.addShift(shiftForm);
            setIsShiftOpen(false);
            setShiftForm({ name: '', start_time: '', end_time: '' });
            loadShifts();
        } catch (err) {
            console.error('Error adding shift:', err);
        }
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        <Calendar className="w-8 h-8 text-purple-600" />
                        Shift Management
                    </h1>
                    <p className="text-gray-500 mt-1">Manage staff schedules and shifts</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setIsShiftOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium border border-gray-200 transition-all flex items-center gap-2"
                    >
                        <Briefcase size={20} /> Add Shift
                    </button>
                    <button
                        onClick={() => setIsStaffOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 px-5 py-2.5 rounded-xl font-medium border border-gray-200 transition-all flex items-center gap-2"
                    >
                        <UserPlus size={20} /> Add Staff
                    </button>
                    <button
                        onClick={() => setIsAssignOpen(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-purple-200 transition-all flex items-center gap-2"
                    >
                        <Plus size={20} /> Assign Shift
                    </button>
                </div>
            </div>

            {/* Schedule Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                        <Clock size={18} /> Daily Schedule
                    </h2>
                    <span className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </span>
                </div>

                {schedule.length > 0 ? (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="px-6 py-4 font-semibold">Staff Name</th>
                                <th className="px-6 py-4 font-semibold">Role</th>
                                <th className="px-6 py-4 font-semibold">Shift</th>
                                <th className="px-6 py-4 font-semibold">Time</th>
                                <th className="px-6 py-4 font-semibold">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {schedule.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 text-gray-800 font-medium flex items-center gap-3">
                                        <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                                            {item.staff_name[0]}
                                        </div>
                                        {item.staff_name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs">{item.role}</span>
                                    </td>
                                    <td className="px-6 py-4 text-purple-600 font-medium">{item.shift_name}</td>
                                    <td className="px-6 py-4 text-gray-500 text-sm font-mono">
                                        {item.start_time.slice(0, 5)} - {item.end_time.slice(0, 5)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-500 text-sm">
                                        {new Date(item.shift_date).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="p-12 text-center text-gray-400">
                        <Calendar size={48} className="mx-auto mb-4 opacity-20" />
                        <p>No shifts assigned currently.</p>
                    </div>
                )}
            </div>

            {/* Assign Shift Modal */}
            <Modal isOpen={isAssignOpen} onClose={() => setIsAssignOpen(false)} title="Assign Shift">
                <form onSubmit={handleAssignShift} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff Member</label>
                        <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={assignForm.staff_id} onChange={e => setAssignForm({ ...assignForm, staff_id: e.target.value })}
                        >
                            <option value="">Select Staff</option>
                            {staffList.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shift Type</label>
                        <select required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={assignForm.shift_id} onChange={e => setAssignForm({ ...assignForm, shift_id: e.target.value })}
                        >
                            <option value="">Select Shift</option>
                            {shiftDefinitions.map(s => (
                                <option key={s.id} value={s.id}>{s.name} ({s.start_time.slice(0, 5)} - {s.end_time.slice(0, 5)})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input type="date" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={assignForm.shift_date} onChange={e => setAssignForm({ ...assignForm, shift_date: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all mt-6">
                        Assign Shift
                    </button>
                </form>
            </Modal>

            {/* Add Staff Modal */}
            <Modal isOpen={isStaffOpen} onClose={() => setIsStaffOpen(false)} title="Add New Staff">
                <form onSubmit={handleAddStaff} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={staffForm.name} onChange={e => setStaffForm({ ...staffForm, name: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={staffForm.role} onChange={e => setStaffForm({ ...staffForm, role: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Contact</label>
                        <input type="text" className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={staffForm.contact} onChange={e => setStaffForm({ ...staffForm, contact: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all mt-6">
                        Add Staff
                    </button>
                </form>
            </Modal>

            {/* Add Shift Modal */}
            <Modal isOpen={isShiftOpen} onClose={() => setIsShiftOpen(false)} title="Add New Shift">
                <form onSubmit={handleAddShift} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shift Name</label>
                        <input type="text" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                            value={shiftForm.name} onChange={e => setShiftForm({ ...shiftForm, name: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input type="time" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                value={shiftForm.start_time} onChange={e => setShiftForm({ ...shiftForm, start_time: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input type="time" required className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
                                value={shiftForm.end_time} onChange={e => setShiftForm({ ...shiftForm, end_time: e.target.value })} />
                        </div>
                    </div>
                    <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-purple-200 transition-all mt-6">
                        Add Shift
                    </button>
                </form>
            </Modal>
        </div>
    );
};
export default ShiftManagement;
