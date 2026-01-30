import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    Users, ArrowLeft, Trash2, Plus,
    Loader2, AlertCircle, CheckCircle2, Edit3, X, Save,
    Search, LogOut, UserCheck, Hash, Layout, GraduationCap
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Students = () => {
    const { logout } = useAuth();
    const [students, setStudents] = useState([]);
    const [meta, setMeta] = useState({ ruangs: [], kelases: [] });
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
        nama: '',
        nisn: '',
        nomor_peserta: '',
        ruang_id: '',
        kelas_id: ''
    });

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [studentsRes, metaRes] = await Promise.all([
                axios.get('http://localhost:8000/api/peserta-ujian'),
                axios.get('http://localhost:8000/api/peserta-ujian-meta')
            ]);
            setStudents(studentsRes.data);
            setMeta(metaRes.data);
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
            nama: item.nama,
            nisn: item.nisn,
            nomor_peserta: item.nomor_peserta,
            ruang_id: item.ruang_id,
            kelas_id: item.kelas_id
        });
        setEditMode(true);
        setSuccess('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingId(null);
        setFormData({ nama: '', nisn: '', nomor_peserta: '', ruang_id: '', kelas_id: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/peserta-ujian/${editingId}`, formData);
                setSuccess('Data peserta berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/peserta-ujian', formData);
                setSuccess('Peserta baru berhasil ditambahkan!');
                setFormData({ nama: '', nisn: '', nomor_peserta: '', ruang_id: '', kelas_id: '' });
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
        if (!window.confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/peserta-ujian/${id}`);
            setSuccess('Peserta berhasil dihapus.');
            fetchData();
        } catch (err) {
            setError('Gagal menghapus data.');
        }
    };

    const filteredStudents = students.filter(s =>
        s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.nisn.includes(searchTerm) ||
        s.nomor_peserta.toLowerCase().includes(searchTerm.toLowerCase())
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
                                Peserta Ujian
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                            {editMode ? 'Edit' : 'Kelola'} <span className="text-sunset font-black italic">Data & Profil</span> Siswa Peserta
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
                                        {editMode ? 'Edit Peserta' : 'Tambah Peserta'}
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

                            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
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

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative group">
                                        <UserCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                                        <input
                                            type="text"
                                            name="nama"
                                            value={formData.nama}
                                            onChange={handleChange}
                                            required
                                            placeholder="Nama Lengkap Siswa"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">NISN</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="nisn"
                                                value={formData.nisn}
                                                onChange={handleChange}
                                                required
                                                placeholder="NISN"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">No. Peserta</label>
                                        <div className="relative group">
                                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                                            <input
                                                type="text"
                                                name="nomor_peserta"
                                                value={formData.nomor_peserta}
                                                onChange={handleChange}
                                                required
                                                placeholder="No. Peserta"
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Kelas</label>
                                        <div className="relative">
                                            <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            <select
                                                name="kelas_id"
                                                value={formData.kelas_id}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="">Pilih Kelas</option>
                                                {meta.kelases.map(k => (
                                                    <option key={k.id} value={k.id}>{k.nama_kelas}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Ruang</label>
                                        <div className="relative">
                                            <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                            <select
                                                name="ruang_id"
                                                value={formData.ruang_id}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer"
                                            >
                                                <option value="">Pilih Ruang</option>
                                                {meta.ruangs.map(r => (
                                                    <option key={r.id} value={r.id}>{r.nama_ruang}</option>
                                                ))}
                                            </select>
                                        </div>
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
                                    Daftar Peserta
                                </h3>
                                <div className="relative group w-full sm:w-64">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Cari nama/NISN/nomor..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="p-4 sm:p-8 max-h-[calc(100vh-320px)] overflow-y-auto custom-scrollbar">
                                {loading ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4 opacity-50">
                                        <Loader2 className="animate-spin text-sunset" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Users size={32} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada yang ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredStudents.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border ${item.id === editingId ? 'border-violet' : 'border-slate-50 dark:border-slate-800'} hover:border-sunset/20 transition-all duration-300 flex flex-col xs:flex-row items-start xs:items-center justify-between shadow-sm hover:shadow-lg gap-4`}
                                            >
                                                <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full xs:w-auto">
                                                    <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 dark:text-slate-500 font-black text-lg group-hover:scale-110 group-hover:bg-sunset/10 group-hover:text-sunset transition-all">
                                                        <Users size={24} />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate mb-1">{item.nama}</p>
                                                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3">
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                                <Hash size={12} className="text-sunset" />
                                                                <span>{item.nomor_peserta}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                                <GraduationCap size={12} className="text-violet" />
                                                                <span>{item.kelas?.nama_kelas || '-'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold">
                                                                <Layout size={12} className="text-blue-500" />
                                                                <span>{item.ruang?.nama_ruang || '-'}</span>
                                                            </div>
                                                        </div>
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

export default Students;
