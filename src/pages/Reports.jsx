import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
    FileText, Loader2, Search, Eye, Printer, X, ChevronDown
} from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [ujians, setUjians] = useState([]);
    const [tahunAjarans, setTahunAjarans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTahunAjaran, setSelectedTahunAjaran] = useState('');
    const [selectedUjianId, setSelectedUjianId] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const params = selectedUjianId ? { ujian_id: selectedUjianId } : {};
            const [reportsRes, ujianRes, tahunAjaranRes] = await Promise.all([
                axios.get('/api/laporan', { params }),
                axios.get('/api/ujians'),
                axios.get('/api/tahun-ajaran'),
            ]);
            setReports(reportsRes.data);
            setUjians(ujianRes.data);
            setTahunAjarans(tahunAjaranRes.data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setLoading(false);
        }
    }, [selectedUjianId]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    // Filter ujians by selected tahun ajaran
    const filteredUjians = selectedTahunAjaran
        ? ujians.filter(u => String(u.tahun_ajaran) === String(selectedTahunAjaran))
        : ujians;

    // Reset ujian filter when tahun ajaran changes and selected ujian is no longer in the list
    useEffect(() => {
        if (selectedUjianId && !filteredUjians.find(u => String(u.id) === String(selectedUjianId))) {
            setSelectedUjianId('');
        }
    }, [selectedTahunAjaran, filteredUjians, selectedUjianId]);

    const filteredReports = reports.filter(r => {
        const term = searchTerm.toLowerCase();
        const matchesSearch = (
            r.pengawas?.name?.toLowerCase().includes(term) ||
            r.kelas?.nama_kelas?.toLowerCase().includes(term) ||
            r.nama_mapel?.toLowerCase().includes(term) ||
            r.ruang?.toLowerCase().includes(term)
        );
        // Also filter by tahun ajaran if selected (match via ujian's tahun_ajaran)
        const matchesTahunAjaran = !selectedTahunAjaran ||
            String(r.ujian?.tahun_ajaran) === String(selectedTahunAjaran);
        return matchesSearch && matchesTahunAjaran;
    });

    const openReport = (report) => {
        setSelectedReport(report);
        setShowModal(true);
    };

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${days[date.getDay()]}, tanggal ${date.getDate()} bulan ${date.getMonth() + 1} tahun ${date.getFullYear()}`;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getSesiText = (sesi) => {
        if (!sesi || sesi === '-') return '-';
        const num = sesi.replace(/\D/g, '');
        const words = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam'];
        return `${num} (${words[parseInt(num)] || num})`;
    };

    const getTingkatText = (kelasName) => {
        if (!kelasName) return '-';
        if (kelasName.startsWith('XII')) return 'XII (Dua Belas)';
        if (kelasName.startsWith('XI')) return 'XI (Sebelas)';
        if (kelasName.startsWith('X')) return 'X (Sepuluh)';
        return kelasName;
    };

    return (
        <>
            <div className="max-w-[1400px] w-full mx-auto text-slate-900 dark:text-slate-200 print:hidden">
                <div className="animate-in slide-in-from-left duration-700 mb-10 sm:mb-16">
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tighter bg-gradient-to-r from-sunset via-sunset to-violet bg-clip-text text-transparent mb-3">
                        Berita Acara
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-xs sm:text-lg border-l-4 border-sunset/30 pl-5">
                        Lihat dan cetak <span className="text-sunset font-black italic">Berita Acara Ujian</span> yang disubmit oleh pengawas
                    </p>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                    <div className="flex-1 relative group">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sunset transition-colors" />
                        <input
                            type="text"
                            placeholder="Cari pengawas, kelas, mapel, ruang..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold text-sm"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedTahunAjaran}
                            onChange={(e) => setSelectedTahunAjaran(e.target.value)}
                            className="w-full sm:w-52 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="">Semua Tahun Ajaran</option>
                            {tahunAjarans.map(ta => (
                                <option key={ta.id} value={ta.id}>{ta.tahun}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedUjianId}
                            onChange={(e) => setSelectedUjianId(e.target.value)}
                            className="w-full sm:w-64 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl py-3 px-4 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-4 focus:ring-sunset/10 focus:border-sunset transition-all font-bold text-sm appearance-none cursor-pointer"
                        >
                            <option value="">Semua Ujian</option>
                            {filteredUjians.map(u => (
                                <option key={u.id} value={u.id}>{u.nama_ujian}</option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Reports Grid */}
                <div className="bg-white dark:bg-slate-900/40 backdrop-blur-xl border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl">
                    <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                            <FileText className="text-violet" size={24} />
                            Daftar Berita Acara
                        </h3>
                        <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest">
                            {filteredReports.length} Laporan
                        </span>
                    </div>

                    <div className="p-4 sm:p-8 max-h-[65vh] overflow-y-auto">
                        {loading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-4">
                                <Loader2 className="animate-spin text-sunset" size={40} />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Mengambil data...</p>
                            </div>
                        ) : filteredReports.length === 0 ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-6 opacity-60">
                                <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-[2rem] flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                    <FileText size={32} />
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest text-sm">Belum ada berita acara</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredReports.map((report) => (
                                    <div
                                        key={report.id}
                                        className="group bg-white dark:bg-slate-950/40 p-4 sm:p-6 rounded-3xl border border-slate-50 dark:border-slate-800 hover:border-sunset/20 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm hover:shadow-lg gap-4 cursor-pointer"
                                        onClick={() => openReport(report)}
                                    >
                                        <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full sm:w-auto">
                                            <div className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 bg-gradient-to-br from-violet to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-lg group-hover:scale-110 transition-transform">
                                                <FileText size={24} />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                                    <p className="font-black text-slate-800 dark:text-white text-base sm:text-lg truncate">
                                                        {report.pengawas?.name || '-'}
                                                    </p>
                                                    <span className="px-2 py-0.5 bg-violet/10 text-violet text-[10px] font-black uppercase tracking-widest rounded-md border border-violet/20">
                                                        {report.ujian?.jenis_ujian || 'Ujian'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 font-medium">
                                                    <span>📝 {report.nama_mapel}</span>
                                                    <span>🏫 {report.kelas?.nama_kelas || '-'}</span>
                                                    <span>🚪 {report.ruang} - {report.kampus}</span>
                                                    <span>📅 {new Date(report.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1 text-xs font-bold">
                                                    <span className="text-emerald-500">Hadir: {report.total_present}</span>
                                                    <span className="text-sunset">Tidak Hadir: {report.total_absent}</span>
                                                    <span className="text-slate-400">Total: {report.total_expected}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); openReport(report); }}
                                            className="flex items-center gap-2 px-4 py-2 bg-violet/10 text-violet rounded-xl border border-violet/20 hover:bg-violet/20 transition-all font-bold text-xs"
                                        >
                                            <Eye size={16} /> Lihat
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Berita Acara Modal */}
            {showModal && selectedReport && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center print:static print:block">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm print:hidden" onClick={() => setShowModal(false)} />

                    <div className="relative w-full max-w-[210mm] max-h-[95vh] overflow-y-auto bg-white rounded-2xl shadow-2xl print:max-h-none print:shadow-none print:rounded-none print:overflow-visible print:max-w-none print:w-full">
                        {/* Print/Close Toolbar */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-slate-200 print:hidden">
                            <h3 className="font-black text-slate-800">Preview Berita Acara</h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-4 py-2 bg-violet text-white rounded-xl font-bold text-sm hover:bg-violet/90 transition-all"
                                >
                                    <Printer size={16} /> Cetak
                                </button>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>
                        </div>

                        {/* Berita Acara Document */}
                        <BeritaAcaraDocument report={selectedReport} />
                    </div>
                </div>
            )}
        </>
    );
};

/**
 * The formal Berita Acara document component — A4, print-ready.
 */
const BeritaAcaraDocument = ({ report }) => {
    const formatDateFormal = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        const days = ['minggu', 'senin', 'selasa', 'rabu', 'kamis', 'jumat', 'sabtu'];
        const months = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        return `${days[date.getDay()]}. tanggal ${date.getDate()} bulan ${months[date.getMonth()]} tahun ${date.getFullYear()}`;
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    const getSesiText = (sesi) => {
        if (!sesi || sesi === '-') return '-';
        const num = sesi.replace(/\D/g, '');
        const words = { '1': 'Satu', '2': 'Dua', '3': 'Tiga', '4': 'Empat', '5': 'Lima', '6': 'Enam' };
        return `${num} (${words[num] || num})`;
    };

    const getTingkatText = (kelasName) => {
        if (!kelasName) return '-';
        if (kelasName.startsWith('XII')) return 'XII (Dua Belas)';
        if (kelasName.startsWith('XI')) return 'XI (Sebelas)';
        if (kelasName.startsWith('X')) return 'X (Sepuluh)';
        return kelasName;
    };

    const ujianName = report.ujian?.nama_ujian || '-';
    const jenisUjian = report.ujian?.jenis_ujian || 'Ujian Praktek';
    const tahunAjaran = '2025/2026';
    const headerTitle = `${ujianName.toUpperCase()}`;

    // Generate blank lines for absent names
    const absentLines = report.absent_details
        ? report.absent_details.split('\n').filter(Boolean)
        : [];
    const blankLinesNeeded = Math.max(5 - absentLines.length, 2);

    return (
        <div className="bg-white text-black" style={{ fontFamily: 'Times New Roman, serif', fontSize: '12pt' }}>
            {/* Page */}
            <div className="px-[20mm] py-[10mm] print:px-[20mm] print:py-[10mm]" style={{ minHeight: '297mm', position: 'relative' }}>

                {/* Kop Surat */}
                <div className="mb-2">
                    <img src="/kop-surat.png" alt="Kop Surat SMK Kartanegara Wates" className="w-full" />
                </div>
                <hr className="border-t-[3px] border-black mb-1" />
                <hr className="border-t-[1px] border-black mb-6" />

                {/* Title */}
                <div className="text-center mb-6">
                    <p className="font-bold text-[14pt] tracking-wide">BERITA ACARA</p>
                    <p className="font-bold text-[12pt]">{headerTitle}</p>
                    <p className="font-bold text-[12pt]">SMK KARTANEGARA WATES KAB. KEDIRI</p>
                </div>

                {/* Opening Paragraph */}
                <p className="mb-4 text-justify leading-relaxed">
                    Pada hari ini {formatDateFormal(report.mulai_ujian)}, telah diselenggarakan {ujianName.toLowerCase()} kelas {getTingkatText(report.kelas?.nama_kelas)} matapelajaran {report.nama_mapel?.toLowerCase() || '-'} mulai pukul {formatTime(report.mulai_ujian)} sampai pukul {formatTime(report.ujian_berakhir)} pada :
                </p>

                {/* Info Table */}
                <div className="ml-8 mb-6">
                    <table className="w-full">
                        <tbody>
                            <InfoRow label="1. Sekolah" value="SMK Kartanegara Wates" />
                            <InfoRow label="    Alamat" value="Jl. Raya Bondo - Wates, Kabupaten Kediri, Jawa Timur" />
                            <InfoRow label="    Tingkat" value={getTingkatText(report.kelas?.nama_kelas)} />
                            <InfoRow label="    Kelas" value={report.kelas?.nama_kelas || '-'} />
                            <InfoRow label="    Ruang" value={`${report.ruang || '-'} - ${report.kampus || '-'}`} />
                            <InfoRow label="    Sesi" value={getSesiText(report.sesi)} />
                            <InfoRow label="    Jumlah peserta seharusnya" value={`${report.total_expected} peserta`} />
                            <InfoRow label="    Jumlah peserta yang hadir" value={`${report.total_present} peserta`} />
                            <InfoRow label="    Jumlah peserta yang tidak hadir" value={`${report.total_absent} peserta`} />
                        </tbody>
                    </table>

                    {/* Absent details */}
                    <div className="mt-2">
                        <p style={{ paddingLeft: '1.5em' }}>Nama peserta yang tidak hadir :</p>
                        <div className="mt-2 ml-6">
                            {absentLines.map((line, i) => (
                                <p key={i} className="border-b border-black py-1">{line}</p>
                            ))}
                            {Array.from({ length: blankLinesNeeded }).map((_, i) => (
                                <div key={`blank-${i}`} className="border-b border-black h-6 mt-1" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Catatan */}
                <div className="mb-8">
                    <p className="font-bold mb-2">2. Catatan pelaksanaan :</p>
                    <div className="border border-black rounded-sm min-h-[120px] p-3">
                        <p className="whitespace-pre-wrap">{report.notes || ''}</p>
                    </div>
                </div>

                {/* Section 3 & 4: Pengawas & Tanda Tangan */}
                <div className="flex justify-between mt-8">
                    <div className="w-[45%]">
                        <p className="font-bold mb-2">3. Nama pengawas ruang</p>
                        <div className="border border-black rounded-sm min-h-[80px] p-3 flex items-center justify-center">
                            <p className="text-center font-bold">{report.pengawas?.name || '-'}</p>
                        </div>
                    </div>
                    <div className="w-[45%]">
                        <p className="font-bold mb-2">4. Tanda tangan pengawas</p>
                        <div className="border border-black rounded-sm min-h-[80px] p-2 flex items-center justify-center">
                            {report.signature_url ? (
                                <img src={report.signature_url} alt="Tanda tangan" className="max-h-[70px] object-contain" />
                            ) : (
                                <p className="text-slate-400 text-sm italic">Tidak ada tanda tangan</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-[10mm] left-[20mm] right-[20mm] print:bottom-[10mm]">
                    <div className="flex justify-between items-center bg-slate-800 text-white text-[9pt] px-4 py-2 rounded-sm italic">
                        <span>Berita Acara</span>
                        <span>SMK Kartanegara Wates</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value }) => (
    <tr>
        <td className="align-top pr-2 whitespace-nowrap py-0.5" style={{ width: '45%' }}>{label}</td>
        <td className="align-top px-2 py-0.5">:</td>
        <td className="align-top py-0.5">{value}</td>
    </tr>
);

export default Reports;
