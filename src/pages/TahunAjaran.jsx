import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    CalendarDays, ArrowLeft, Trash2, Plus,
    Loader2, AlertCircle, CheckCircle2, Edit3, X, Save,
    Search, LogOut, Check
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const TahunAjaran = () => {
    const { logout } = useAuth();
    const [years, setYears] = useState([]);
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
        tahun: '',
        is_active: true
    });

    const fetchYears = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/tahun-ajaran');
            setYears(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Gagal mengambil data. Periksa koneksi backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
        setError('');
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            tahun: item.tahun,
            is_active: Boolean(item.is_active)
        });
        setEditMode(true);
        setSuccess('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingId(null);
        setFormData({ tahun: '', is_active: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/tahun-ajaran/${editingId}`, formData);
                setSuccess('Tahun Ajaran berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/tahun-ajaran', formData);
                setSuccess('Tahun Ajaran baru berhasil ditambahkan!');
                setFormData({ tahun: '', is_active: true });
            }
            fetchYears();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan data.';
            setError(typeof msg === 'object' ? Object.values(msg).join(', ') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus Tahun Ajaran ini?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/tahun-ajaran/${id}`);
            setSuccess('Tahun Ajaran berhasil dihapus.');
            fetchYears();
        } catch (err) {
            setError('Gagal menghapus data.');
        }
    };

    const filteredYears = years.filter(y =>
        y.tahun.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 flex flex-col p-4 sm:p-6 lg:p-10 transition-colors duration-500">
            <div className="max-w-[1400px] w-full mx-auto flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-16 gap-8 relative z-10">
                    <div className="animate-in slide-in-from-left duration-700">
                        <div className="flex items-center gap-4 mb-5">
                            <Link to="/" className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-sunset/10 hover:border-sunset/50 transition-all group">
                                <ArrowLeft className="text-slate-500 group-hover:text-sunset transition-colors" />
                            </Link>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-sunset via-sunset to-violet bg-clip-text text-transparent">
                                Tahun Ajaran
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                            {editMode ? 'Edit' : 'Kelola'} <span className="text-sunset font-black italic">Periode & Tahun</span> Pelajaran
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
                    {/* Form Section */}
                    <div className="lg:col-span-5 animate-in fade-in slide-in-from-bottom-5 duration-700 static lg:sticky lg:top-10">
                        <div className={`bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border ${editMode ? 'border-violet/30 ring-2 ring-violet/10' : 'border-slate-100 dark:border-slate-800/50'} rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-500`}>
                            <div className={`absolute top-0 right-0 w-32 h-32 ${editMode ? 'bg-violet/5' : 'bg-sunset/5'} rounded-full -mr-16 -mt-16 blur-3xl`} />

                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 ${editMode ? 'bg-violet/10 text-violet border-violet/20' : 'bg-sunset/10 text-sunset border-sunset/20'} rounded-2xl flex items-center justify-center border`}>
                                        {editMode ? <Edit3 size={24} /> : <Plus size={24} />}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        {editMode ? 'Edit Tahun' : 'Tambah Tahun'}
                                    </h2>
                                </div>
                                {editMode && (
                                    <button
                                        onClick={cancelEdit}
                                        className="text-slate-400 hover:text-sunset transition-colors p-2 hover:bg-sunset/5 rounded-xl"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
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

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Tahun Ajaran</label>
                                    <div className="relative group">
                                        <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="tahun"
                                            value={formData.tahun}
                                            onChange={handleChange}
                                            required
                                            placeholder="Contoh: 2024/2025"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 cursor-pointer" onClick={() => setFormData(prev => ({ ...prev, is_active: !prev.is_active }))}>
                                    <div className={`h-6 w-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.is_active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                        {formData.is_active && <Check size={14} className="text-white" />}
                                    </div>
                                    <span className="font-bold text-slate-600 dark:text-slate-300 text-sm select-none">Set sebagai Aktif (Default)</span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className={`w-full bg-gradient-to-r ${editMode ? 'from-violet to-indigo-600' : 'from-sunset to-violet'} hover:shadow-[0_0_30px_rgba(255,88,65,0.3)] text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4 text-lg`}
                                >
                                    {submitting ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            {editMode ? <Save size={22} /> : <Plus size={22} />}
                                            {editMode ? 'Update Data' : 'Simpan Data'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-7 animate-in fade-in slide-in-from-right duration-700">
                        <div className="bg-slate-50/30 dark:bg-slate-900/20 border border-slate-100 dark:border-slate-800/50 rounded-[2.5rem] overflow-hidden backdrop-blur-sm">
                            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                    <div className="h-2 w-8 bg-sunset rounded-full" />
                                    Daftar Tahun Ajaran
                                </h3>
                                <div className="relative group w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari tahun..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="p-4 sm:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                                        <Loader2 className="animate-spin text-sunset" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                                    </div>
                                ) : filteredYears.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada yang ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredYears.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border ${item.id === editingId ? 'border-violet' : 'border-slate-50 dark:border-slate-800'} hover:border-sunset/20 transition-all duration-300 flex flex-col xs:flex-row items-start xs:items-center justify-between shadow-sm hover:shadow-lg gap-4`}
                                            >
                                                <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full xs:w-auto">
                                                    <div className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-gradient-to-br ${item.is_active ? 'from-emerald-400 to-emerald-600' : 'from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800'} rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform`}>
                                                        <CalendarDays size={24} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate">{item.tahun}</p>
                                                            {item.is_active ? (
                                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">Aktif</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-slate-200 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-md">Non-Aktif</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 font-medium mt-1">Dibuat: {new Date(item.created_at).toLocaleDateString('id-ID')}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 w-full xs:w-auto justify-end">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all active:scale-90"
                                                        title="Edit"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="p-3 bg-slate-50 dark:bg-slate-900 text-slate-400 hover:text-sunset hover:bg-sunset/10 rounded-xl transition-all active:scale-90"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="mt-16 sm:mt-24 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-800/50 pt-10 pb-12 font-bold tracking-tight relative z-10 transition-colors duration-500 text-xs sm:text-sm">
                    <p>© 2026 Dashboard Admin E-Berita Acara • SMK Kartanegara Wates</p>
                </footer>
            </div>
        </div>
    );
};

export default TahunAjaran;
