import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    UserCheck, ArrowLeft, Shield, Trash2, Plus,
    Loader2, AlertCircle, CheckCircle2, Edit3, X, Save,
    Search, Filter, LogOut, FileBadge, Upload, Download, FileSpreadsheet, Calendar
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Proctors = () => {
    const { logout } = useAuth();
    const [proctors, setProctors] = useState([]);
    const [ujians, setUjians] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        niy: '',
        ujian_id: ''
    });

    // Import state
    const [importUjianId, setImportUjianId] = useState('');

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            const [proctorsRes, ujiansRes] = await Promise.all([
                axios.get('http://localhost:8000/api/pengawas'),
                axios.get('http://localhost:8000/api/ujians')
            ]);
            setProctors(proctorsRes.data);
            setUjians(ujiansRes.data);

            // Set default ujian if available
            if (ujiansRes.data.length > 0) {
                const activeUjian = ujiansRes.data.find(u => u.is_active) || ujiansRes.data[0];
                setFormData(prev => ({ ...prev, ujian_id: activeUjian.id }));
                setImportUjianId(activeUjian.id);
            }

            setError('');
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Gagal mengambil data. Periksa koneksi backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEdit = (proctor) => {
        setEditingId(proctor.id);
        setFormData({
            name: proctor.name,
            niy: proctor.niy || '',
            ujian_id: proctor.ujian_id || (ujians.length > 0 ? ujians[0].id : '')
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
            name: '',
            niy: '',
            ujian_id: ujians.length > 0 ? (ujians.find(u => u.is_active) || ujians[0]).id : ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/pengawas/${editingId}`, formData);
                setSuccess('Data Pengawas berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/pengawas', formData);
                setSuccess('Pengawas baru berhasil ditambahkan!');
                setFormData(prev => ({
                    ...prev,
                    name: '',
                    niy: ''
                    // Keep ujian_id same as previous selection
                }));
            }
            // Refresh proctors only
            const res = await axios.get('http://localhost:8000/api/pengawas');
            setProctors(res.data);
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan data.';
            setError(typeof msg === 'object' ? Object.values(msg).join(', ') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Import Handlers
    const handleDownloadTemplate = () => {
        window.location.href = 'http://localhost:8000/api/pengawas/template-import';
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        if (!importUjianId) {
            setError('Silakan pilih ujian terlebih dahulu.');
            setSubmitting(false);
            return;
        }

        const formData = new FormData();
        const file = e.target.file.files[0];
        formData.append('file', file);
        formData.append('ujian_id', importUjianId);

        try {
            const response = await axios.post('http://localhost:8000/api/pengawas/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setError('Beberapa data gagal diimpor: ' + response.data.errors.join(', '));
            }
            setShowImportModal(false);
            const res = await axios.get('http://localhost:8000/api/pengawas');
            setProctors(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengimpor file.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus pengawas ini?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/pengawas/${id}`);
            setSuccess('Pengawas berhasil dihapus.');
            const res = await axios.get('http://localhost:8000/api/pengawas');
            setProctors(res.data);
        } catch (err) {
            setError('Gagal menghapus pengawas. Pastikan tidak ada jadwal terkait.');
        }
    };

    const filteredProctors = proctors.filter(p => {
        const isActive = p.ujian?.is_active || ujians.find(u => u.id == p.ujian_id)?.is_active;

        if (!isActive) return false;

        return (
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.niy && p.niy.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (p.ujian && p.ujian.nama_ujian.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    return (
        <div className="min-h-screen w-full bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-200 flex flex-col transition-colors duration-500 overflow-x-hidden py-8 px-[4%] sm:px-[5%] lg:px-[6%]">
            <div className="w-full mx-auto flex-1 flex flex-col">
                <header className="flex flex-col sm:flex-row sm:items-center justify-between mb-10 sm:mb-16 gap-8 relative z-10">
                    <div className="animate-in slide-in-from-left duration-700 shrink-0">
                        <div className="flex items-center gap-4 mb-5">
                            <Link to="/" className="h-10 w-10 sm:h-12 sm:w-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center hover:bg-sunset/10 hover:border-sunset/50 transition-all group">
                                <ArrowLeft className="text-slate-500 group-hover:text-sunset transition-colors" />
                            </Link>
                            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-sunset via-sunset to-violet bg-clip-text text-transparent">
                                Data Pengawas
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                            {editMode ? 'Edit' : 'Kelola'} <span className="text-sunset font-black italic">Guru & Staff</span> Pengawas Ujian
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
                                        {editMode ? 'Edit Pengawas' : 'Tambah Pengawas'}
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

                            {!editMode && (
                                <div className="mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                    <button
                                        onClick={() => setShowImportModal(true)}
                                        className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 py-3 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-all group"
                                    >
                                        <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" />
                                        Import Excel/CSV
                                    </button>
                                </div>
                            )}

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
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Ujian (Event)</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <select
                                            name="ujian_id"
                                            value={formData.ujian_id}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer"
                                        >
                                            <option value="" disabled>Pilih Ujian</option>
                                            {ujians.filter(u => u.is_active).map((ujian) => (
                                                <option key={ujian.id} value={ujian.id}>
                                                    {ujian.nama_ujian} {ujian.is_active ? '(Aktif)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap & Gelar</label>
                                    <div className="relative group">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Contoh: Drs. Budi Santoso, M.Pd."
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NIY / NIP (Opsional)</label>
                                    <div className="relative group">
                                        <FileBadge className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="niy"
                                            value={formData.niy}
                                            onChange={handleChange}
                                            placeholder="Nomor Induk Yayasan / Pegawai"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
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
                                            {editMode ? 'Update Pengawas' : 'Simpan Pengawas'}
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* List Section */}
                    <div className="lg:col-span-7 flex flex-col gap-6 animate-in fade-in slide-in-from-right-10 duration-1000">
                        {/* Search Bar */}
                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-3xl sm:rounded-[2rem] p-2 sm:p-3 flex items-center gap-2 sm:gap-4 shadow-lg">
                            <div className="flex-1 relative flex items-center group">
                                <Search size={18} className="absolute left-4 text-slate-400 group-focus-within:text-sunset transition-colors shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Cari pengawas..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border-none rounded-2xl py-2.5 sm:py-3 pl-11 sm:pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:ring-0 font-bold placeholder:font-medium text-sm sm:text-base"
                                />
                            </div>
                            <div className="h-10 w-10 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400">
                                <Filter size={18} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                            <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex items-center justify-between">
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                                    <UserCheck className="text-violet" size={24} />
                                    Daftar Pengawas
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {filteredProctors.length} Guru
                                </span>
                            </div>

                            <div className="p-4 sm:p-8 max-h-[700px] overflow-y-auto custom-scrollbar">
                                {loading && proctors.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="animate-spin text-sunset" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                                    </div>
                                ) : filteredProctors.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada yang ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredProctors.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border ${item.id === editingId ? 'border-violet' : 'border-slate-50 dark:border-slate-800'} hover:border-sunset/20 transition-all duration-300 flex flex-col xs:flex-row items-start xs:items-center justify-between shadow-sm hover:shadow-lg gap-4`}
                                            >
                                                <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full xs:w-auto">
                                                    <div className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center text-slate-500 font-black text-lg group-hover:scale-110 transition-transform`}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate">{item.name}</p>
                                                        </div>
                                                        <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                                            <span className="flex items-center gap-1.5">
                                                                <FileBadge size={14} />
                                                                {item.niy || 'Tidak ada NIY'}
                                                            </span>
                                                            {item.ujian && (
                                                                <span className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md text-slate-500">
                                                                    <Calendar size={12} />
                                                                    {item.ujian.nama_ujian}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 w-full xs:w-auto justify-end border-t xs:border-none pt-3 xs:pt-0 dark:border-slate-800/50 mt-1 xs:mt-0">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-violet/10 hover:text-violet transition-all border xs:border-none border-slate-100 dark:border-slate-800"
                                                        title="Edit Pengawas"
                                                    >
                                                        <Edit3 size={18} />
                                                        <span className="xs:hidden ml-2 font-bold text-xs uppercase tracking-wider">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-sunset/10 hover:text-sunset transition-all border xs:border-none border-slate-100 dark:border-slate-800"
                                                        title="Hapus Pengawas"
                                                    >
                                                        <Trash2 size={18} />
                                                        <span className="xs:hidden ml-2 font-bold text-xs uppercase tracking-wider">Hapus</span>
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

                <footer className="mt-16 sm:mt-32 text-center text-slate-400 dark:text-slate-600 border-t border-slate-100 dark:border-slate-900/50 pt-10 pb-12 font-bold tracking-tight relative z-10 transition-colors duration-500 text-xs sm:text-sm">
                    <p>© 2026 Dashboard Admin E-Berita Acara • Dibuat oleh Tim IT SMK Kartanegara Wates</p>
                </footer>
            </div>
            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                    <Upload size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">Import Data</h3>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-6 relative z-10">
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center group hover:border-emerald-500/50 transition-colors">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-emerald-500 transition-colors">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Upload file CSV Anda</p>
                                <p className="text-xs text-slate-400 mb-4">Pastikan format sesuai template</p>

                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-black uppercase tracking-wide transition-colors"
                                >
                                    <Download size={14} /> Download Template
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih Ujian (Target Import)</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={20} />
                                    <select
                                        value={importUjianId}
                                        onChange={(e) => setImportUjianId(e.target.value)}
                                        required
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled>Pilih Ujian</option>
                                        {ujians.filter(u => u.is_active).map((ujian) => (
                                            <option key={ujian.id} value={ujian.id}>
                                                {ujian.nama_ujian} {ujian.is_active ? '(Aktif)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih File</label>
                                <input
                                    type="file"
                                    name="file"
                                    accept=".csv,.txt"
                                    required
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wide file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-600 dark:file:text-slate-300 hover:file:bg-emerald-500 hover:file:text-white transition-all cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            >
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

export default Proctors;
