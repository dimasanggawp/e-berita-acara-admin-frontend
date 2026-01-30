import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Calendar, ArrowLeft, Plus, Trash2, Edit3, X, Save,
    Loader2, AlertCircle, CheckCircle2, Search, Filter,
    Clock, MapPin, User, BookOpen, GraduationCap, LayoutGrid, LogOut
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Schedules = () => {
    const { logout } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [options, setOptions] = useState({
        ujians: [],
        pengawas: [],
        mata_pelajarans: [],
        sesis: []
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editMode, setEditMode] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        ujian_id: '',
        pengawas_id: '',
        mapel_id: '',
        sesi_id: '',
        mulai_ujian: '',
        ujian_berakhir: '',
        total_siswa: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [schedRes, optRes] = await Promise.all([
                axios.get('http://localhost:8000/api/jadwal-ujian'),
                axios.get('http://localhost:8000/api/init-data')
            ]);
            setSchedules(schedRes.data);
            setOptions(optRes.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Gagal mengambil data. Periksa koneksi backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            ujian_id: item.ujian_id,
            pengawas_id: item.pengawas_id,
            mapel_id: item.mapel_id,
            sesi_id: item.sesi_id,
            mulai_ujian: item.mulai_ujian.replace(' ', 'T').substring(0, 16),
            ujian_berakhir: item.ujian_berakhir.replace(' ', 'T').substring(0, 16),
            total_siswa: item.total_siswa
        });
        setEditMode(true);
        setSuccess('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingId(null);
        setFormData({
            ujian_id: '',
            pengawas_id: '',
            mapel_id: '',
            sesi_id: '',
            mulai_ujian: '',
            ujian_berakhir: '',
            total_siswa: ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/jadwal-ujian/${editingId}`, formData);
                setSuccess('Jadwal berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/jadwal-ujian', formData);
                setSuccess('Jadwal baru berhasil ditambahkan!');
                setFormData({
                    ujian_id: '',
                    pengawas_id: '',
                    mapel_id: '',
                    sesi_id: '',
                    mulai_ujian: '',
                    ujian_berakhir: '',
                    total_siswa: ''
                });
            }
            fetchData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan data.';
            setError(typeof msg === 'object' ? Object.values(msg).join(', ') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/jadwal-ujian/${id}`);
            setSuccess('Jadwal berhasil dihapus.');
            fetchData();
        } catch (err) {
            setError('Gagal menghapus jadwal.');
        }
    };

    const filteredSchedules = schedules.filter(s =>
        s.mata_pelajaran?.nama_mapel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.pengawas?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 flex flex-col transition-colors duration-500 overflow-x-hidden py-8 px-[4%] sm:px-[5%] lg:px-[6%]">
            <div className="w-full flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-16 gap-8 relative z-10 w-full">
                    <div className="animate-in slide-in-from-left duration-700 shrink-0">
                        <div className="flex items-center gap-4 mb-5">
                            <Link to="/" className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-violet/10 hover:border-violet/50 transition-all group">
                                <ArrowLeft className="text-slate-500 group-hover:text-violet transition-colors" />
                            </Link>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-violet via-violet to-sunset bg-clip-text text-transparent">
                                Kelola Jadwal
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-violet/30 pl-5 ml-2">
                            {editMode ? 'Edit' : 'Atur'} <span className="text-violet font-black italic">Agenda Ujian</span> SMK Kartanegara Wates
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

                <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
                    {/* Form Section */}
                    <div className="lg:col-span-4 animate-in fade-in slide-in-from-bottom-5 duration-700 static lg:sticky lg:top-10 w-full">
                        <div className={`bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border ${editMode ? 'border-violet/30 ring-2 ring-violet/10' : 'border-slate-100 dark:border-slate-800/50'} rounded-[2.5rem] p-6 sm:p-8 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-500`}>
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider mb-8 flex items-center gap-3">
                                <div className={`h-10 w-10 ${editMode ? 'bg-violet/10 text-violet' : 'bg-sunset/10 text-sunset'} rounded-xl flex items-center justify-center border border-current/20`}>
                                    {editMode ? <Edit3 size={20} /> : <Plus size={20} />}
                                </div>
                                {editMode ? 'Edit Jadwal' : 'Tambah Jadwal'}
                                {editMode && (
                                    <button onClick={cancelEdit} className="ml-auto text-slate-400 hover:text-sunset transition-colors">
                                        <X size={20} />
                                    </button>
                                )}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {error && (
                                    <div className="p-4 bg-sunset/10 border border-sunset/20 rounded-2xl flex items-center gap-3 text-sunset font-bold text-sm animate-in shake duration-500">
                                        <AlertCircle size={18} />
                                        {error}
                                    </div>
                                )}
                                {success && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm animate-in zoom-in duration-300">
                                        <CheckCircle2 size={18} />
                                        {success}
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Ujian (Event)</label>
                                    <select
                                        name="ujian_id"
                                        value={formData.ujian_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold"
                                    >
                                        <option value="">Pilih Ujian...</option>
                                        {options.ujians.map(u => <option key={u.id} value={u.id}>{u.nama_ujian}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mata Pelajaran</label>
                                        <select
                                            name="mapel_id"
                                            value={formData.mapel_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold"
                                        >
                                            <option value="">Pilih Mapel...</option>
                                            {options.mata_pelajarans.map(m => (
                                                <option key={m.id} value={m.id}>{m.nama_mapel} ({m.kelas?.nama_kelas || 'N/A'})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Sesi</label>
                                        <select
                                            name="sesi_id"
                                            value={formData.sesi_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold"
                                        >
                                            <option value="">Pilih Sesi...</option>
                                            {options.sesis.map(s => <option key={s.id} value={s.id}>{s.nama_sesi}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pengawas</label>
                                    <select
                                        name="pengawas_id"
                                        value={formData.pengawas_id}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold"
                                    >
                                        <option value="">Pilih Pengawas...</option>
                                        {options.pengawas.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waktu Mulai</label>
                                        <input
                                            type="datetime-local"
                                            name="mulai_ujian"
                                            value={formData.mulai_ujian}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold text-xs"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Waktu Berakhir</label>
                                        <input
                                            type="datetime-local"
                                            name="ujian_berakhir"
                                            value={formData.ujian_berakhir}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Siswa</label>
                                    <div className="relative group">
                                        <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet transition-colors" size={20} />
                                        <input
                                            type="number"
                                            name="total_siswa"
                                            value={formData.total_siswa}
                                            onChange={handleChange}
                                            required
                                            placeholder="Jumlah peserta"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-violet/10 focus:border-violet transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-gradient-to-r ${editMode ? 'from-violet to-indigo-600' : 'from-violet to-sunset'} hover:shadow-lg text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4`}
                                >
                                    {submitting ? <Loader2 className="animate-spin" /> : (
                                        <>
                                            {editMode ? <Save size={20} /> : <Calendar size={20} />}
                                            {editMode ? 'Update Jadwal' : 'Simpan Jadwal'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-8 flex flex-col gap-6 animate-in fade-in slide-in-from-right-10 duration-1000 w-full">
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-[2rem] p-3 flex items-center gap-3 shadow-lg">
                            <div className="flex-1 relative flex items-center group">
                                <Search size={20} className="absolute left-4 text-slate-400 group-focus-within:text-violet transition-colors shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari mapel atau pengawas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder:font-medium text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
                            {loading ? (
                                <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-violet" size={40} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Menyinkronkan data...</p>
                                </div>
                            ) : filteredSchedules.length === 0 ? (
                                <div className="col-span-full py-20 bg-slate-50/50 dark:bg-slate-900/20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center gap-6 opacity-60">
                                    <Calendar size={48} className="text-slate-300" />
                                    <p className="text-slate-500 font-black uppercase tracking-widest text-sm text-center px-6">Belum ada jadwal yang ditemukan</p>
                                </div>
                            ) : (
                                filteredSchedules.map((item) => (
                                    <div
                                        key={item.id}
                                        className={`group bg-white dark:bg-slate-900/40 border ${item.id === editingId ? 'border-violet' : 'border-slate-100 dark:border-slate-800'} rounded-[2.5rem] p-6 lg:p-8 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden`}
                                    >
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="px-3 py-1 bg-violet/10 text-violet text-[10px] font-black uppercase tracking-widest rounded-lg border border-violet/20">
                                                        {item.ujian?.nama_ujian || 'Ujian'}
                                                    </span>
                                                </div>
                                                <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white leading-tight">
                                                    {item.mata_pelajaran?.nama_mapel}
                                                </h3>
                                                <p className="text-slate-500 font-bold flex items-center gap-2 mt-2">
                                                    <LayoutGrid size={16} className="text-violet/50" />
                                                    {item.mata_pelajaran?.kelas?.nama_kelas || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="flex gap-2 shrink-0">
                                                <button onClick={() => handleEdit(item)} className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-violet/10 hover:text-violet transition-all">
                                                    <Edit3 size={18} />
                                                </button>
                                                <button onClick={() => handleDelete(item.id)} className="h-10 w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-sunset/10 hover:text-sunset transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-800">
                                                    <User size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Pengawas</p>
                                                    <p className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200">{item.pengawas?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-800">
                                                    <Clock size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Waktu</p>
                                                    <p className="text-[11px] sm:text-base font-black text-slate-700 dark:text-slate-200">
                                                        {new Date(item.mulai_ujian).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(item.mulai_ujian).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="h-11 w-11 bg-slate-50 dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-400 shrink-0 border border-slate-100 dark:border-slate-800">
                                                    <GraduationCap size={20} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Peserta</p>
                                                    <p className="text-sm sm:text-base font-black text-slate-700 dark:text-slate-200">{item.total_siswa} Siswa</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </main>

                <footer className="mt-16 sm:mt-32 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900/50 pt-10 pb-12 font-bold tracking-tight relative z-10 transition-colors duration-500 text-xs sm:text-sm">
                    <p>© 2026 Dashboard Admin E-Berita Acara • Dibuat oleh Tim IT SMK Kartanegara Wates</p>
                </footer>
            </div>
        </div>
    );
};

export default Schedules;
