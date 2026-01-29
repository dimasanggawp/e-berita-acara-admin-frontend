import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    UserPlus, ArrowLeft, Shield, Trash2, User as UserIcon,
    Loader2, AlertCircle, CheckCircle2, Edit3, X, Save,
    Lock, MoreVertical, Search, Filter, LogOut
} from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

const Users = () => {
    const { logout, user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
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
        name: '',
        username: '',
        password: ''
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:8000/api/users');
            setUsers(response.data);
            setError('');
        } catch (err) {
            console.error('Failed to fetch users', err);
            setError('Gagal mengambil data pengguna. Periksa koneksi backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEdit = (user) => {
        setEditingId(user.id);
        setFormData({
            name: user.name,
            username: user.username,
            password: '' // Don't show password, let it be empty if no change
        });
        setEditMode(true);
        setSuccess('');
        setError('');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const cancelEdit = () => {
        setEditMode(false);
        setEditingId(null);
        setFormData({ name: '', username: '', password: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            if (editMode) {
                await axios.put(`http://localhost:8000/api/users/${editingId}`, formData);
                setSuccess('Pengguna berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('http://localhost:8000/api/users', formData);
                setSuccess('Pengguna baru berhasil ditambahkan!');
                setFormData({ name: '', username: '', password: '' });
            }
            fetchUsers();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan data.';
            setError(typeof msg === 'object' ? Object.values(msg).join(', ') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (id === currentUser?.id) {
            setError('Anda tidak dapat menghapus akun Anda sendiri.');
            return;
        }

        if (!window.confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) return;

        try {
            await axios.delete(`http://localhost:8000/api/users/${id}`);
            setSuccess('Pengguna berhasil dihapus.');
            fetchUsers();
        } catch (err) {
            setError('Gagal menghapus pengguna.');
        }
    };

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase())
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
                                Kelola Pengguna
                            </h1>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5 ml-2">
                            {editMode ? 'Perbarui informasi' : 'Tambah dan atur akses'} <span className="text-sunset font-black italic">Administrator</span> sistem
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
                                        {editMode ? <Edit3 size={24} /> : <UserPlus size={24} />}
                                    </div>
                                    <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                        {editMode ? 'Edit User' : 'Tambah User'}
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
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative group">
                                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                            placeholder="Masukkan nama lengkap"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Username</label>
                                    <div className="relative group">
                                        <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            required
                                            placeholder="Buat username unik"
                                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">
                                        {editMode ? 'Password Baru (Opsional)' : 'Password'}
                                    </label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!editMode}
                                            placeholder={editMode ? "Kosongkan jika tidak diubah" : "Minimal 8 karakter"}
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
                                            {editMode ? <Save size={22} /> : <UserPlus size={22} />}
                                            {editMode ? 'Update User' : 'Simpan User'}
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
                                    placeholder="Cari administrator..."
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
                                    <Shield className="text-violet" size={24} />
                                    Daftar Admin
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                                    {filteredUsers.length} User
                                </span>
                            </div>

                            <div className="p-4 sm:p-8">
                                {loading && users.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-4">
                                        <Loader2 className="animate-spin text-sunset" size={40} />
                                        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                                    </div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                        <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                            <Search size={32} />
                                        </div>
                                        <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada yang ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {filteredUsers.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border ${item.id === editingId ? 'border-violet' : 'border-slate-50 dark:border-slate-800'} hover:border-sunset/20 transition-all duration-300 flex flex-col xs:flex-row items-start xs:items-center justify-between shadow-sm hover:shadow-lg gap-4`}
                                            >
                                                <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full xs:w-auto">
                                                    <div className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-gradient-to-br ${item.id === currentUser?.id ? 'from-emerald-400 to-emerald-600' : 'from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900'} rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform`}>
                                                        {item.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                                            <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate">{item.name}</p>
                                                            {item.id === currentUser?.id && (
                                                                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest rounded-md border border-emerald-500/20">Anda</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <code className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-900 py-1 px-3 rounded-lg border border-slate-100 dark:border-slate-800 truncate block">@{item.username}</code>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 w-full xs:w-auto justify-end border-t xs:border-none pt-3 xs:pt-0 dark:border-slate-800/50 mt-1 xs:mt-0">
                                                    <button
                                                        onClick={() => handleEdit(item)}
                                                        className="flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-violet/10 hover:text-violet transition-all border xs:border-none border-slate-100 dark:border-slate-800"
                                                        title="Edit Pengguna"
                                                    >
                                                        <Edit3 size={18} />
                                                        <span className="xs:hidden ml-2 font-bold text-xs uppercase tracking-wider">Edit</span>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        disabled={item.id === currentUser?.id}
                                                        className={`flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center transition-all border xs:border-none ${item.id === currentUser?.id ? 'opacity-20 cursor-not-allowed hidden xs:flex' : 'text-slate-400 hover:bg-sunset/10 hover:text-sunset border-slate-100 dark:border-slate-800'}`}
                                                        title="Hapus Pengguna"
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

                <footer className="mt-16 text-center text-slate-400 dark:text-slate-600 py-10 font-bold tracking-tight text-xs sm:text-sm">
                    <p>© 2026 Admin Panel • Database: <span className="text-sunset uppercase">MySQL</span></p>
                </footer>
            </div>
        </div>
    );
};

export default Users;
