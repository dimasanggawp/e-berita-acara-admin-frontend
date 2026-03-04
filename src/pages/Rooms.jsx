import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Loader2, AlertCircle, CheckCircle2, Edit3, X, Save,
    Search, Filter, Upload, Download, FileSpreadsheet, Layout
} from 'lucide-react';

const Rooms = () => {
    const { token } = useAuth();
    const [ruangData, setRuangData] = useState([]);
    const [ujians, setUjians] = useState([]);
    const [selectedUjianId, setSelectedUjianId] = useState('');
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
        nama_ruang: '',
        kampus: 'Kampus 1'
    });

    const fetchInitialData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Ujians
            const resUjians = await axios.get('/api/ujians', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const activeUjians = resUjians.data.filter(u => u.is_active);
            setUjians(activeUjians);

            let currentUjianId = selectedUjianId;
            if (!currentUjianId && activeUjians.length > 0) {
                currentUjianId = activeUjians[0].id;
                setSelectedUjianId(currentUjianId);
            }

            if (currentUjianId) {
                const resRuang = await axios.get(`/api/ruang?ujian_id=${currentUjianId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRuangData(resRuang.data);
            } else {
                setRuangData([]);
            }

            setError('');
        } catch (err) {
            console.error('Failed to fetch data', err);
            setError('Gagal mengambil data. Periksa koneksi backend.');
        } finally {
            setLoading(false);
        }
    }, [token, selectedUjianId]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            nama_ruang: item.nama_ruang,
            kampus: item.kampus || 'Kampus 1'
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
            nama_ruang: '',
            kampus: 'Kampus 1'
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUjianId) {
            setError('Silakan pilih Ujian terlebih dahulu!');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            const payload = {
                ...formData,
                ujian_id: selectedUjianId
            };

            if (editMode) {
                await axios.put(`/api/ruang/${editingId}`, payload, config);
                setSuccess('Data Ruang berhasil diperbarui!');
                cancelEdit();
            } else {
                await axios.post('/api/ruang', payload, config);
                setSuccess('Ruang baru berhasil ditambahkan!');
                setFormData({ nama_ruang: '', kampus: 'Kampus 1' });
            }
            fetchInitialData();
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal menyimpan data.';
            setError(typeof msg === 'object' ? Object.values(msg).join(', ') : msg);
        } finally {
            setSubmitting(false);
        }
    };

    // Import Handlers
    const handleDownloadTemplate = () => {
        window.location.href = '/api/ruang/template-import';
    };

    const handleImportSubmit = async (e) => {
        e.preventDefault();

        if (!selectedUjianId) {
            setError('Silakan pilih Ujian pada halaman utama terlebih dahulu.');
            return;
        }

        setSubmitting(true);
        setError('');
        setSuccess('');

        const formDataFile = new FormData();
        const file = e.target.file.files[0];
        formDataFile.append('file', file);
        formDataFile.append('ujian_id', selectedUjianId);

        try {
            const response = await axios.post('/api/ruang/import', formDataFile, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setSuccess(response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
                setError('Beberapa data gagal diimpor: ' + response.data.errors.join(', '));
            }
            setShowImportModal(false);
            fetchInitialData();
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal mengimpor file.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Apakah Anda yakin ingin menghapus ruang ini?')) return;

        try {
            await axios.delete(`/api/ruang/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSuccess('Ruang berhasil dihapus.');
            fetchInitialData();
        } catch (err) {
            setError('Gagal menghapus ruang. Pastikan data tidak sedang digunakan.');
        }
    };

    const filteredRuang = ruangData.filter(item => {
        const searchStr = `${item.nama_ruang} ${item.kampus}`.toLowerCase();
        return searchStr.includes(searchTerm.toLowerCase());
    });

    return (
        <div className="w-full mx-auto text-slate-900 dark:text-slate-200">
            <div className="animate-in slide-in-from-left duration-700 mb-10 sm:mb-16">
                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-sunset via-orange-500 to-amber-600 bg-clip-text text-transparent mb-3">
                    Data Ruang
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5">
                    {editMode ? 'Edit' : 'Kelola'} <span className="text-sunset font-black italic">Ruang</span> Ujian
                </p>
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 flex-1 items-start">
                {/* Form Section */}
                <div className="lg:col-span-5 animate-in fade-in slide-in-from-bottom-5 duration-700 static lg:sticky lg:top-10">
                    <div className="mb-6">
                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Pilih Ujian Aktif</label>
                        <select
                            value={selectedUjianId}
                            onChange={(e) => setSelectedUjianId(Number(e.target.value))}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer shadow-sm"
                        >
                            <option value="" disabled>-- Pilih Ujian --</option>
                            {ujians.map((u) => (
                                <option key={u.id} value={u.id}>{u.nama_ujian}</option>
                            ))}
                        </select>
                    </div>

                    <div className={`bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-xl border ${editMode ? 'border-cyan-500/30 ring-2 ring-cyan-500/10' : 'border-slate-100 dark:border-slate-800/50'} rounded-[2.5rem] p-8 sm:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden transition-all duration-500`}>
                        <div className={`absolute top-0 right-0 w-32 h-32 ${editMode ? 'bg-cyan-500/5' : 'bg-sunset/5'} rounded-full -mr-16 -mt-16 blur-3xl`} />

                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 ${editMode ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-sunset/10 text-sunset border-sunset/20'} rounded-2xl flex items-center justify-center border font-black`}>
                                    {editMode ? <Edit3 size={24} /> : <Plus size={24} />}
                                </div>
                                <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
                                    {editMode ? 'Edit Ruang' : 'Tambah Ruang'}
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
                                    className="w-full bg-violet-500/10 border border-violet-500/20 text-violet-600 dark:text-violet-400 py-3 rounded-2xl font-black text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-violet-500/20 transition-all group"
                                >
                                    <FileSpreadsheet size={18} className="group-hover:scale-110 transition-transform" />
                                    Import Excel/CSV
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 font-bold text-sm animate-in shake duration-500">
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
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Nama Ruang</label>
                                <div className="relative group">
                                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="nama_ruang"
                                        value={formData.nama_ruang}
                                        onChange={handleChange}
                                        required
                                        placeholder="Contoh: LAB. KOMPUTER 1"
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Lokasi Kampus</label>
                                <div className="relative group">
                                    <Layout className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" size={20} />
                                    <select
                                        name="kampus"
                                        value={formData.kampus}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold appearance-none cursor-pointer"
                                    >
                                        <option value="Kampus 1">Kampus 1</option>
                                        <option value="Kampus 2">Kampus 2</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full bg-gradient-to-r ${editMode ? 'from-amber-500 to-orange-600' : 'from-sunset to-orange-600'} hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 mt-4 text-lg`}
                            >
                                {submitting ? (
                                    <Loader2 className="animate-spin" />
                                ) : (
                                    <>
                                        {editMode ? <Save size={22} /> : <Plus size={22} />}
                                        {editMode ? 'Update Ruang' : 'Simpan Ruang'}
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
                                placeholder="Cari ruang..."
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
                                <Layout className="text-sunset" size={24} />
                                Daftar Ruang
                            </h3>
                            <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                                {filteredRuang.length} Ruang
                            </span>
                        </div>

                        <div className="p-4 sm:p-8 max-h-[700px] overflow-y-auto custom-scrollbar">
                            {loading && ruangData.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-4">
                                    <Loader2 className="animate-spin text-sunset" size={40} />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                                </div>
                            ) : filteredRuang.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                    <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <Search size={32} />
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Tidak ada yang ditemukan</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {filteredRuang.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl sm:rounded-[2rem] border ${item.id === editingId ? 'border-amber-500' : 'border-slate-50 dark:border-slate-800'} hover:border-sunset/30 transition-all duration-300 flex flex-col xs:flex-row items-start xs:items-center justify-between shadow-sm hover:shadow-lg gap-4`}
                                        >
                                            <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full xs:w-auto">
                                                <div className={`h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center text-sunset font-black group-hover:scale-110 transition-transform`}>
                                                    <Layout size={24} />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex flex-col mb-1">
                                                        <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate">{item.nama_ruang}</p>
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-sunset/10 text-sunset w-fit mt-1">
                                                            {item.kampus}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 w-full xs:w-auto justify-end border-t xs:border-none pt-3 xs:pt-0 dark:border-slate-800/50 mt-1 xs:mt-0">
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-amber-500/10 hover:text-amber-600 transition-all border xs:border-none border-slate-100 dark:border-slate-800"
                                                    title="Edit Ruang"
                                                >
                                                    <Edit3 size={18} />
                                                    <span className="xs:hidden ml-2 font-bold text-xs uppercase tracking-wider">Edit</span>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="flex-1 xs:flex-none h-10 px-3 xs:px-0 xs:w-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all border xs:border-none border-slate-100 dark:border-slate-800"
                                                    title="Hapus Ruang"
                                                >
                                                    <X size={18} />
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

            {showImportModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2rem] p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />

                        <div className="flex justify-between items-center mb-6 relative z-10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Upload size={20} />
                                </div>
                                <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">Import Data Ruang</h3>
                            </div>
                            <button
                                onClick={() => setShowImportModal(false)}
                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleImportSubmit} className="space-y-6 relative z-10">
                            <div className="p-6 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 text-center group hover:border-indigo-500/50 transition-colors">
                                <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-full shadow-sm flex items-center justify-center mx-auto mb-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                                    <FileSpreadsheet size={24} />
                                </div>
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">Upload file Excel Anda</p>
                                <p className="text-xs text-slate-400 mb-4">Pastikan format sesuai template</p>

                                <button
                                    type="button"
                                    onClick={handleDownloadTemplate}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-black uppercase tracking-wide transition-colors"
                                >
                                    <Download size={14} /> Download Template
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Pilih File</label>
                                <input
                                    type="file"
                                    name="file"
                                    accept=".xlsx,.xls,.csv"
                                    required
                                    className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wide file:bg-slate-100 dark:file:bg-slate-800 file:text-slate-600 dark:file:text-slate-300 hover:file:bg-indigo-500 hover:file:text-white transition-all cursor-pointer"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] text-white font-black py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2"
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

export default Rooms;
