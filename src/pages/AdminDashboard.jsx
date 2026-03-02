import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, LayoutGrid, Database, Server, CalendarDays, Loader2, Filter } from 'lucide-react';
import axios from 'axios';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

const AdminDashboard = () => {
    const { user } = useAuth();
    const [systemStatus, setSystemStatus] = useState({
        api: 'loading',
        database: 'loading',
        details: { engine: '', name: '' }
    });

    // Attendance chart state
    const [attendanceData, setAttendanceData] = useState(null);
    const [attendanceLoading, setAttendanceLoading] = useState(true);
    const [selectedUjian, setSelectedUjian] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [ujiansList, setUjiansList] = useState([]);
    const [availableDates, setAvailableDates] = useState([]);

    useEffect(() => {
        const checkSystemHealth = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/health-check');
                setSystemStatus({
                    api: 'ok',
                    database: response.data.database === 'connected' ? 'connected' : 'disconnected',
                    details: response.data.details || { engine: '', name: '' }
                });
            } catch (error) {
                setSystemStatus({
                    api: 'error',
                    database: 'disconnected',
                    details: { engine: 'Server Offline', name: '-' }
                });
            }
        };

        checkSystemHealth();
        const interval = setInterval(checkSystemHealth, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchAttendance = useCallback(async () => {
        setAttendanceLoading(true);
        try {
            const params = {};
            if (selectedUjian) params.ujian_id = selectedUjian;
            if (selectedDate) params.date = selectedDate;

            const res = await axios.get('http://localhost:8000/api/dashboard/attendance-stats', { params });
            const data = res.data;

            setAttendanceData(data);
            setUjiansList(data.ujians || []);
            setAvailableDates(data.available_dates || []);

            // Auto-select ujian if not set yet
            if (!selectedUjian && data.selected_ujian_id) {
                setSelectedUjian(String(data.selected_ujian_id));
            }
        } catch (err) {
            console.error('Failed to fetch attendance stats', err);
        } finally {
            setAttendanceLoading(false);
        }
    }, [selectedUjian, selectedDate]);

    useEffect(() => {
        fetchAttendance();
    }, [fetchAttendance]);

    const handleUjianChange = (e) => {
        setSelectedUjian(e.target.value);
        setSelectedDate(''); // Reset date when changing ujian
    };

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    // Chart configuration
    const chartData = attendanceData ? {
        labels: ['Hadir', 'Tidak Hadir'],
        datasets: [{
            data: [attendanceData.attended, attendanceData.not_attended],
            backgroundColor: [
                'rgba(16, 185, 129, 0.85)',
                'rgba(239, 68, 68, 0.65)',
            ],
            borderColor: [
                'rgba(16, 185, 129, 1)',
                'rgba(239, 68, 68, 1)',
            ],
            borderWidth: 2,
            hoverOffset: 8,
            spacing: 4,
            borderRadius: 6,
        }]
    } : null;

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                titleFont: { weight: 'bold', size: 13 },
                bodyFont: { size: 12 },
                padding: 14,
                cornerRadius: 12,
                displayColors: true,
                boxPadding: 6,
                callbacks: {
                    label: function (context) {
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const pct = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
                        return ` ${context.label}: ${context.parsed} siswa (${pct}%)`;
                    }
                }
            }
        },
        animation: {
            animateRotate: true,
            duration: 800,
        }
    };

    const formatDate = (dateStr) => {
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
    };

    return (
        <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
            <div className="animate-in slide-in-from-left duration-700 mb-10 sm:mb-16">
                <div className="flex items-center gap-4 mb-5">
                    <div className="h-10 w-10 sm:h-14 sm:w-14 bg-gradient-to-br from-sunset to-violet rounded-2xl flex items-center justify-center shadow-lg shadow-sunset/20 rotate-3">
                        <LayoutGrid className="text-white w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black tracking-tighter bg-gradient-to-r from-sunset via-sunset to-violet bg-clip-text text-transparent">
                        Dashboard Admin
                    </h1>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                    Selamat datang kembali, <span className="text-sunset font-black italic">{user?.name || 'Administrator'}</span>
                </p>
            </div>

            {/* Attendance Chart Section */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-14 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-500 mb-16 lg:mb-24">
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full -ml-40 -mb-40 blur-[120px]" />
                <div className="absolute top-0 right-0 w-60 h-60 bg-violet/5 rounded-full -mr-30 -mt-30 blur-[100px]" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-12 gap-6 relative z-10">
                    <h2 className="text-xl sm:text-3xl font-black flex items-center gap-3 sm:gap-5 text-slate-800 dark:text-white">
                        <div className="w-3 h-3 sm:w-5 sm:h-5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.6)]" />
                        Kehadiran Peserta Ujian
                    </h2>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12 relative z-10">
                    <div className="space-y-2">
                        <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Event Ujian</label>
                        <div className="relative group">
                            <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                            <select
                                value={selectedUjian}
                                onChange={handleUjianChange}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer text-sm sm:text-base"
                            >
                                {ujiansList.map(u => (
                                    <option key={u.id} value={u.id}>
                                        {u.nama_ujian} {u.is_active ? '(Aktif)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Filter Tanggal</label>
                        <div className="relative group">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                            <select
                                value={selectedDate}
                                onChange={handleDateChange}
                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer text-sm sm:text-base"
                            >
                                <option value="">Semua Tanggal</option>
                                {availableDates.map(d => (
                                    <option key={d} value={d}>{formatDate(d)}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Chart + Stats */}
                {attendanceLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-4 relative z-10">
                        <Loader2 className="animate-spin text-sunset" size={40} />
                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Memuat statistik...</p>
                    </div>
                ) : attendanceData && attendanceData.total_students > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
                        {/* Doughnut Chart */}
                        <div className="lg:col-span-5 flex items-center justify-center">
                            <div className="relative w-[220px] h-[220px] sm:w-[280px] sm:h-[280px]">
                                <Doughnut data={chartData} options={chartOptions} />
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl sm:text-5xl font-black bg-gradient-to-br from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                                        {attendanceData.percentage}%
                                    </span>
                                    <span className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                        Kehadiran
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Stats Cards */}
                        <div className="lg:col-span-7 grid grid-cols-2 gap-4 sm:gap-6">
                            <div className="bg-white dark:bg-slate-950/50 p-5 sm:p-8 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm group hover:border-blue-500/30 transition-all">
                                <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 sm:mb-3">Total Peserta</p>
                                <p className="text-2xl sm:text-4xl font-black text-slate-800 dark:text-white">{attendanceData.total_students}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">siswa terdaftar</p>
                            </div>
                            <div className="bg-white dark:bg-slate-950/50 p-5 sm:p-8 rounded-3xl border border-emerald-500/20 shadow-sm group hover:border-emerald-500/40 transition-all">
                                <p className="text-[10px] sm:text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-2 sm:mb-3">Hadir</p>
                                <p className="text-2xl sm:text-4xl font-black text-emerald-500">{attendanceData.attended}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">siswa hadir</p>
                            </div>
                            <div className="bg-white dark:bg-slate-950/50 p-5 sm:p-8 rounded-3xl border border-red-500/20 shadow-sm group hover:border-red-500/40 transition-all">
                                <p className="text-[10px] sm:text-xs font-black text-red-500 uppercase tracking-[0.2em] mb-2 sm:mb-3">Tidak Hadir</p>
                                <p className="text-2xl sm:text-4xl font-black text-red-500">{attendanceData.not_attended}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">siswa absen</p>
                            </div>
                            <div className="bg-white dark:bg-slate-950/50 p-5 sm:p-8 rounded-3xl border border-violet/20 shadow-sm group hover:border-violet/40 transition-all">
                                <p className="text-[10px] sm:text-xs font-black text-violet uppercase tracking-[0.2em] mb-2 sm:mb-3">Persentase</p>
                                <p className="text-2xl sm:text-4xl font-black bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">{attendanceData.percentage}%</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">tingkat kehadiran</p>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="lg:col-span-12 flex items-center justify-center gap-8 pt-4">
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-md bg-emerald-500" />
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Hadir ({attendanceData.attended})</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-4 h-4 rounded-md bg-red-500/70" />
                                <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Tidak Hadir ({attendanceData.not_attended})</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center gap-6 opacity-60 relative z-10">
                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <Users size={32} />
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm text-center">
                            Belum ada data peserta untuk event ini
                        </p>
                    </div>
                )}
            </div>

            {/* Infrastructure Status */}
            <div className="bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-14 shadow-xl dark:shadow-2xl relative overflow-hidden transition-colors duration-500">
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-sunset/5 rounded-full -mr-40 -mb-40 blur-[120px] dark:blur-[150px]" />
                <h2 className="text-xl sm:text-3xl font-black mb-8 sm:mb-12 flex items-center gap-3 sm:gap-5 text-slate-800 dark:text-white">
                    <div className={`w-3 h-3 sm:w-5 sm:h-5 rounded-full animate-pulse shadow-[0_0_25px_rgba(255,88,65,1)] ${systemStatus.api === 'ok' && systemStatus.database === 'connected' ? 'bg-emerald-500' : 'bg-sunset'}`} />
                    Status Infrastruktur
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 relative z-10">
                    <div className="bg-white dark:bg-slate-950/50 p-4 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-sunset/30 transition-all duration-300">
                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0 ${systemStatus.api === 'ok' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-sunset/10 border-sunset/20 text-sunset'}`}>
                                <Server size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-2 sm:mb-3">Backend API</p>
                                <p className="text-base sm:text-2xl font-black text-slate-700 dark:text-slate-200">Server Produksi</p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-widest border shadow-sm whitespace-nowrap self-start sm:self-center transition-all ${systemStatus.api === 'ok' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-sunset/10 text-sunset dark:text-sunset border-sunset/20'}`}>
                            <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full animate-pulse flex-shrink-0 ${systemStatus.api === 'ok' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-sunset'}`} />
                            {systemStatus.api === 'ok' ? 'Operasional' : systemStatus.api === 'loading' ? 'Mengecek...' : 'Terputus'}
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-950/50 p-4 sm:p-10 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-inner flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:border-violet/30 transition-all duration-300">
                        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
                            <div className={`h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center border transition-colors flex-shrink-0 ${systemStatus.database === 'connected' ? 'bg-violet-500/10 border-violet-500/20 text-violet-500' : 'bg-sunset/10 border-sunset/20 text-sunset'}`}>
                                <Database size={20} className="sm:w-6 sm:h-6" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-1">Sinkronisasi Data</p>
                                <p className="text-sm sm:text-xl font-black text-slate-700 dark:text-slate-200 truncate sm:break-words">
                                    {systemStatus.database === 'connected'
                                        ? `${systemStatus.details.engine} (${systemStatus.details.name})`
                                        : systemStatus.database === 'loading' ? 'Memuat...' : 'Database Offline'}
                                </p>
                            </div>
                        </div>
                        <div className={`flex items-center gap-2 sm:gap-4 px-3 sm:px-6 py-1.5 sm:py-3 rounded-xl sm:rounded-2xl text-[10px] sm:text-sm font-black uppercase tracking-widest border shadow-sm whitespace-nowrap self-start sm:self-center transition-all ${systemStatus.database === 'connected' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-sunset/10 text-sunset dark:text-sunset border-sunset/20'}`}>
                            <div className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full animate-pulse flex-shrink-0 ${systemStatus.database === 'connected' ? 'bg-emerald-500 dark:bg-emerald-400' : 'bg-sunset'}`} />
                            {systemStatus.database === 'connected' ? 'Aktif' : systemStatus.database === 'loading' ? 'Mengecek...' : 'Terputus'}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
