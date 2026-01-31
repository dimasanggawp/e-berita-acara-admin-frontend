import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    Calendar, Clock, MapPin, User, BookOpen, ArrowLeft,
    Loader2, Search, Filter, CalendarDays, LayoutGrid,
    LogOut, Plus, Edit3, Trash2, X, Save, Upload,
    Download, FileSpreadsheet, AlertCircle, CheckCircle2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from '../components/ThemeToggle';

const ExamSchedule = () => {
    const { logout } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [ujians, setUjians] = useState([]);
    const [proctors, setProctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState('');

    // State logic
    const [editMode, setEditMode] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showImportModal, setShowImportModal] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        ujian_id: '',
        pengawas_id: '',
        ruang: '',
        nama_mapel: '',
        sesi: '',
        mulai_ujian: '',
        ujian_berakhir: '',
    });

    const [importUjianId, setImportUjianId] = useState('');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [schedulesRes, ujiansRes, proctorsRes] = await Promise.all([
                axios.get('http://localhost:8000/api/jadwal-ujian'),
                axios.get('http://localhost:8000/api/ujians'),
                axios.get('http://localhost:8000/api/pengawas')
            ]);
            setSchedules(schedulesRes.data);
            const activeUjians = ujiansRes.data.filter(u => u.is_active);
            setUjians(activeUjians);
            setProctors(proctorsRes.data);

            if (activeUjians.length > 0 && !formData.ujian_id) {
                setImportUjianId(activeUjians[0].id);
                setFormData(prev => ({ ...prev, ujian_id: activeUjians[0].id }));
            }
            if (proctorsRes.data.length > 0 && !formData.pengawas_id) {
                setFormData(prev => ({ ...prev, pengawas_id: proctorsRes.data[0].id }));
            }
        } catch (error) {
            console.error('Failed to fetch data', error);
            setError('Gagal mengambil data dari server.');
        } finally {
            setLoading(false);
        }
    }, [formData.ujian_id, formData.pengawas_id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEdit = (schedule) => {
        setEditingId(schedule.id);
        setFormData({
            ujian_id: schedule.ujian_id,
            pengawas_id: schedule.pengawas_id,
            ruang: schedule.ruang || '',
            nama_mapel: schedule.nama_mapel || '',
            sesi: schedule.sesi || '',
            mulai_ujian: schedule.mulai_ujian.replace(' ', 'T').substring(0, 16),
            ujian_berakhir: schedule.ujian_berakhir.replace(' ', 'T').substring(0, 16),
        });
        setEditMode(true);
        setError('');
        setSuccess('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingId(null);
        setFormData({
            ujian_id: ujians[0]?.id || '',
            pengawas_id: proctors[0]?.id || '',
            ruang: '',
            nama_mapel: '',
            sesi: '',
            mulai_ujian: '',
            ujian_berakhir: '',
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Hapus jadwal ini?')) return;
        try {
            await axios.delete(`http://localhost:8000/api/jadwal-ujian/${id}`);
            setSuccess('Jadwal berhasil dihapus');
            fetchData();
        } catch (err) {
            setError('Gagal menghapus jadwal');
        }
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');
        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/jadwal-ujian/${editingId}`, formData);
                setSuccess('Jadwal berhasil diperbarui');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/jadwal-ujian', formData);
                setSuccess('Jadwal berhasil ditambahkan');
                setFormData(prev => ({
                    ...prev,
                    ruang: '',
                    nama_mapel: '',
                    sesi: '',
                    mulai_ujian: '',
                    ujian_berakhir: '',
                }));
            }
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal menyimpan jadwal');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        const importData = new FormData();
        importData.append('file', e.target.file.files[0]);
        importData.append('ujian_id', importUjianId);

        try {
            const res = await axios.post('http://localhost:8000/api/jadwal-ujian/import', importData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(res.data.message);
            if (res.data.errors?.length > 0) {
                setError('Beberapa baris gagal: ' + res.data.errors.slice(0, 3).join(', '));
            }
            setShowImportModal(false);
            fetchData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengimpor jadwal');
        } finally {
            setSubmitting(false);
        }
    };

    const groupedSchedules = schedules.reduce((acc, schedule) => {
        const date = new Date(schedule.mulai_ujian).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        if (!acc[date]) acc[date] = [];
        acc[date].push(schedule);
        return acc;
    }, {});

    const filteredDates = Object.keys(groupedSchedules).filter(date => {
        if (selectedDate && date !== selectedDate) return false;
        return true;
    });

    const matchesSearch = (schedule) => {
        const term = searchTerm.toLowerCase();
        return (
            (schedule.nama_mapel || '').toLowerCase().includes(term) ||
            (schedule.pengawas?.name || '').toLowerCase().includes(term) ||
            (schedule.ruang || '').toLowerCase().includes(term) ||
            (schedule.sesi || '').toLowerCase().includes(term)
        );
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 flex flex-col transition-colors duration-500 py-8 px-[4%] sm:px-[5%] lg:px-[6%]">
            <div className="w-full mx-auto flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-16 gap-8 relative z-10 w-full">
                    <div className="animate-in slide-in-from-left duration-700 shrink-0">
                        <div className="flex items-center gap-4 mb-5">
                            <Link to="/" className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-sunset/10 hover:border-sunset/50 transition-all group">
                                <ArrowLeft className="text-slate-500 group-hover:text-sunset transition-colors" />
                            </Link>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-sunset via-sunset to-violet bg-clip-text text-transparent">
                                Jadwal Ujian
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                            Mapping Pengawas, <span className="text-sunset font-black italic">Ruang & Sesi</span> Ujian
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

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 items-start">
                    {/* Form Section (Left Column) */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-bottom-5 duration-700 static lg:sticky lg:top-10">
                        <div className={`bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border ${editMode ? 'border-violet/30 ring-2 ring-violet/10' : 'border-slate-100 dark:border-slate-800/50'} rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-500`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${editMode ? 'bg-violet/5' : 'bg-sunset/5'} rounded-full -mr-16 -mt-16 blur-3xl`} />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 ${editMode ? 'bg-violet/10 text-violet border-violet/20' : 'bg-sunset/10 text-sunset border-sunset/20'} rounded-2xl flex items-center justify-center border transition-colors`}>
                                        {editMode ? <Edit3 size={24} /> : <Plus size={24} />}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        {editMode ? 'Edit Jadwal' : 'Tambah Jadwal'}
                                    </h2>
                                </div>
                                {editMode && (
                                    <button onClick={cancelEdit} className="text-slate-400 hover:text-sunset transition-colors p-2 hover:bg-sunset/5 rounded-xl">
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            {!editMode && (
                                <div className="mb-8 p-1 bg-white/50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-3 rounded-xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all group"
                                    >
                                        <FileSpreadsheet size={18} className="group-hover:rotate-6 transition-transform" />
                                        Import Excel / CSV
                                    </button>
                                </div>
                            )}

                            <form onSubmit={handleFormSubmit} className="space-y-6 relative z-10">
                                {error && (
                                    <div className="p-4 bg-sunset/10 border border-sunset/20 rounded-2xl flex items-center gap-3 text-sunset font-bold text-sm animate-in shake">
                                        <AlertCircle size={18} /> {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in zoom-in">
                                        <CheckCircle2 size={18} /> {success}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Event Ujian</label>
                                        <select name="ujian_id" value={formData.ujian_id} onChange={handleFormChange} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer">
                                            {ujians.map(u => <option key={u.id} value={u.id}>{u.nama_ujian}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Mata Pelajaran</label>
                                        <input type="text" name="nama_mapel" value={formData.nama_mapel} onChange={handleFormChange} required placeholder="Misal: Penilaian Akhir Semester" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold placeholder:font-medium" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ruang</label>
                                            <input type="text" name="ruang" value={formData.ruang} onChange={handleFormChange} required placeholder="R.01" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold placeholder:font-medium" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Sesi</label>
                                            <input type="text" name="sesi" value={formData.sesi} onChange={handleFormChange} placeholder="Sesi 1" className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold placeholder:font-medium" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Pengawas</label>
                                        <select name="pengawas_id" value={formData.pengawas_id} onChange={handleFormChange} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer">
                                            {proctors.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Mulai</label>
                                            <input type="datetime-local" name="mulai_ujian" value={formData.mulai_ujian} onChange={handleFormChange} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] sm:text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Selesai</label>
                                            <input type="datetime-local" name="ujian_berakhir" value={formData.ujian_berakhir} onChange={handleFormChange} required className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold" />
                                        </div>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-gradient-to-r ${editMode ? 'from-violet to-indigo-600' : 'from-sunset to-violet'} hover:shadow-[0_0_30px_rgba(255,88,65,0.3)] text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4 text-base sm:text-lg`}
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            {editMode ? <Save size={22} /> : <Plus size={22} />}
                                            {editMode ? 'Update Jadwal' : 'Simpan Jadwal'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section (Right Column) */}
                    <div className="lg:col-span-7 flex flex-col gap-6 animate-in fade-in slide-in-from-right-10 duration-1000">
                        {/* Filters Bar */}
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[2rem] p-2 sm:p-3 flex flex-col sm:flex-row items-stretch gap-3 shadow-lg">
                            <div className="flex-1 relative flex items-center group">
                                <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-sunset transition-colors shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari mapel, ruang, pengawas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-2xl py-2.5 sm:py-3 pl-11 sm:pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder:font-medium text-sm sm:text-base"
                                />
                            </div>
                            <div className="sm:w-48 relative flex items-center group">
                                <Filter size={18} className="absolute left-4 text-slate-400 group-focus-within:text-sunset transition-colors shrink-0 z-10" />
                                <select
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-2xl py-2.5 sm:py-3 pl-11 sm:pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold text-sm appearance-none cursor-pointer"
                                >
                                    <option value="">Semua Tanggal</option>
                                    {Object.keys(groupedSchedules).map(date => <option key={date} value={date}>{date}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* Schedules Display */}
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl flex-1 flex flex-col min-h-[500px]">
                            <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex items-center justify-between shrink-0">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                    <CalendarDays className="text-violet" size={24} />
                                    Daftar Jadwal
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {schedules.length} Sesi
                                </span>
                            </div>

                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar flex-1">
                                {loading && schedules.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-4 opacity-50 py-20">
                                        <Loader2 className="animate-spin text-sunset" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyusun Jadwal...</p>
                                    </div>
                                ) : filteredDates.length === 0 ? (
                                    <div className="h-full flex flex-col items-center justify-center gap-6 opacity-60 min-h-[300px]">
                                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada jadwal ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-12">
                                        {filteredDates.map(date => {
                                            const dailySchedules = groupedSchedules[date].filter(matchesSearch);
                                            if (dailySchedules.length === 0) return null;

                                            return (
                                                <div key={date} className="space-y-6">
                                                    <div className="flex items-center gap-4">
                                                        <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">{date}</h4>
                                                        <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
                                                    </div>

                                                    <div className="grid grid-cols-1 gap-4">
                                                        {dailySchedules.map((schedule) => (
                                                            <div key={schedule.id} className="group bg-white dark:bg-slate-950/40 p-5 sm:p-6 rounded-3xl border border-slate-50 dark:border-slate-800 hover:border-sunset/20 transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                                                <div className="bg-slate-100 dark:bg-slate-800 h-14 w-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 group-hover:scale-110 transition-transform">
                                                                    <Clock size={16} className="text-sunset mb-1" />
                                                                    <span className="text-[10px] font-black">{new Date(schedule.mulai_ujian).getHours().toString().padStart(2, '0')}:{new Date(schedule.mulai_ujian).getMinutes().toString().padStart(2, '0')}</span>
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-3 mb-2">
                                                                        <span className="px-3 py-0.5 bg-sunset/10 text-sunset text-[10px] font-black uppercase tracking-widest rounded-md border border-sunset/20">
                                                                            {schedule.sesi || 'Sesi Umum'}
                                                                        </span>
                                                                        <span className="px-3 py-0.5 bg-indigo-500/10 text-indigo-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-indigo-500/20">
                                                                            {schedule.ruang || 'N/A'}
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-slate-400">
                                                                            {schedule.total_siswa || 0} Siswa
                                                                        </span>
                                                                    </div>
                                                                    <h5 className="font-black text-slate-800 dark:text-white text-base sm:text-lg mb-1 truncate">{schedule.nama_mapel}</h5>
                                                                    <p className="text-xs font-bold text-slate-400 flex items-center gap-2">
                                                                        <User size={12} className="text-sunset" /> {schedule.pengawas?.name || 'Belum Ditentukan'}
                                                                    </p>
                                                                </div>

                                                                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 border-t sm:border-none pt-4 sm:pt-0">
                                                                    <button onClick={() => handleEdit(schedule)} className="flex-1 sm:flex-none h-10 w-full sm:w-10 rounded-xl bg-slate-50 dark:bg-slate-900 sm:bg-transparent flex items-center justify-center text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all">
                                                                        <Edit3 size={18} />
                                                                        <span className="sm:hidden ml-2 font-bold text-xs uppercase tracking-widest">Edit</span>
                                                                    </button>
                                                                    <button onClick={() => handleDelete(schedule.id)} className="flex-1 sm:flex-none h-10 w-full sm:w-10 rounded-xl bg-slate-50 dark:bg-slate-900 sm:bg-transparent flex items-center justify-center text-slate-400 hover:text-sunset hover:bg-sunset/10 transition-all">
                                                                        <Trash2 size={18} />
                                                                        <span className="sm:hidden ml-2 font-bold text-xs uppercase tracking-widest">Hapus</span>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-16 sm:mt-32 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900/50 pt-10 pb-12 font-bold tracking-tight relative z-10 transition-colors duration-500 text-xs sm:text-sm">
                    <p>© 2026 Admin Dashboard • SMK Kartanegara Wates</p>
                </footer>
            </div>

            {/* Import Modal remains as a Modal for better focus during file upload */}
            {showImportModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <div className="flex justify-between items-center mb-8 relative z-10">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Upload size={20} />
                                </div>
                                Import Jadwal
                            </h3>
                            <button onClick={() => setShowImportModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-6 relative z-10">
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center">
                                <FileSpreadsheet size={40} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-4">Pastikan format CSV sesuai template</p>
                                <a
                                    href="http://localhost:8000/api/jadwal-ujian/template"
                                    className="inline-flex items-center gap-2 px-6 py-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wide hover:bg-emerald-500/20 transition-all"
                                >
                                    <Download size={14} /> Download Template
                                </a>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Target Ujian</label>
                                <select value={importUjianId} onChange={(e) => setImportUjianId(e.target.value)} required className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-5 text-slate-700 dark:text-slate-200 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold">
                                    {ujians.map(u => <option key={u.id} value={u.id}>{u.nama_ujian}</option>)}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">File CSV</label>
                                <input type="file" name="file" accept=".csv" required className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-600 dark:file:text-slate-300 hover:file:bg-emerald-500 hover:file:text-white transition-all cursor-pointer" />
                            </div>

                            <button type="submit" disabled={submitting} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-4 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                                {submitting ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
                                Mulai Import
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExamSchedule;
