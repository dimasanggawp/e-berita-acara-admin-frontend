import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import ThemeToggle from '../components/ThemeToggle';
import { Users, Calendar, FileText, LogOut, LayoutGrid, Database, Server, Activity, Shield } from 'lucide-react';
import axios from 'axios';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [systemStatus, setSystemStatus] = useState({
        api: 'loading',     // 'loading', 'ok', 'error'
        database: 'loading', // 'loading', 'connected', 'disconnected'
        details: { engine: '', name: '' }
    });

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
        const interval = setInterval(checkSystemHealth, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 flex flex-col p-4 sm:p-6 lg:p-10 transition-colors duration-500">
            <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-20 gap-8 relative z-10">
                    <div className="animate-in slide-in-from-left duration-700">
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

                    <div className="flex flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                        <ThemeToggle className="h-[48px] w-[48px] sm:h-[52px] sm:w-[52px] shrink-0" />
                        <button
                            onClick={logout}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-5 sm:px-8 py-3 sm:py-3.5 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:text-sunset dark:hover:text-white hover:border-sunset/50 hover:bg-sunset/5 dark:hover:bg-sunset/10 transition-all group font-black shadow-sm dark:shadow-xl active:scale-95 text-xs sm:text-base whitespace-nowrap"
                        >
                            <LogOut size={16} className="sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                            Keluar
                        </button>
                    </div>
                </header>

                <main className="flex-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 lg:gap-8 mb-16 lg:mb-24">
                        {/* Quick Access Cards */}
                        <div className="group bg-white dark:bg-slate-900/30 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 p-8 rounded-[2.5rem] hover:border-sunset/40 transition-all duration-500 cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-sunset/5 dark:bg-sunset/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                            <div className="w-14 h-14 bg-sunset/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all relative z-10 border border-sunset/20">
                                <Users className="w-7 h-7 text-sunset" />
                            </div>
                            <h3 className="text-xl font-black mb-2 relative z-10 text-slate-800 dark:text-white">Kelola Siswa</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10 font-medium whitespace-pre-wrap">Atur pendaftaran dan profil siswa.</p>
                        </div>

                        <div className="group bg-white dark:bg-slate-900/30 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 p-8 rounded-[2.5rem] hover:border-violet/40 transition-all duration-500 cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-violet/5 dark:bg-violet/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                            <div className="w-14 h-14 bg-violet/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all relative z-10 border border-violet/20">
                                <Calendar className="w-7 h-7 text-violet" />
                            </div>
                            <h3 className="text-xl font-black mb-2 relative z-10 text-slate-800 dark:text-white">Jadwal Ujian</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10 font-medium whitespace-pre-wrap">Atur jadwal dan pengawas ujian.</p>
                        </div>

                        <div className="group bg-white dark:bg-slate-900/30 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 p-8 rounded-[2.5rem] hover:border-slate-400 dark:hover:border-slate-500 transition-all duration-500 cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-500/5 dark:bg-slate-100/5 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                            <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all relative z-10 border border-slate-200 dark:border-slate-700">
                                <FileText className="w-7 h-7 text-slate-500 dark:text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black mb-2 relative z-10 text-slate-800 dark:text-white">Laporan</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10 font-medium whitespace-pre-wrap">Hasilkan laporan analitik siswa.</p>
                        </div>

                        <Link to="/users" className="group bg-white dark:bg-slate-900/30 backdrop-blur-xl border border-slate-100 dark:border-slate-800/50 p-8 rounded-[2.5rem] hover:border-emerald-400/40 transition-all duration-500 cursor-pointer shadow-xl shadow-slate-200/50 dark:shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-3xl transition-transform group-hover:scale-150 duration-700" />
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-all relative z-10 border border-emerald-500/20 dark:shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <Shield className="w-7 h-7 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-black mb-2 relative z-10 text-slate-800 dark:text-white">Kelola Pengguna</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed relative z-10 font-medium whitespace-pre-wrap">Tambah & atur admin sistem.</p>
                        </Link>
                    </div>

                    {/* System Status Section - Fixed for Mobile Responsiveness */}
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
                                                ? `${systemStatus.details.engine.toUpperCase()} (${systemStatus.details.name})`
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
                </main>

                <footer className="mt-16 sm:mt-32 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900/50 pt-10 pb-12 font-bold tracking-tight relative z-10 transition-colors duration-500 text-xs sm:text-sm">
                    <p>© 2026 Dashboard Admin • Dibuat dengan <span className="text-sunset animate-pulse inline-block mx-1">❤</span> oleh Antigravity Digital</p>
                </footer>
            </div>
        </div>
    );
};

export default Dashboard;
