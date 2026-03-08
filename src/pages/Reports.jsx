import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    FileText, Loader2, Search, Eye, Printer, X, ChevronDown, Trash2
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
    const [isBulkPrinting, setIsBulkPrinting] = useState(false);

    const fetchReports = useCallback(async (showLoading = true) => {
        if (showLoading) setLoading(true);
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
            if (showLoading) setLoading(false);
        }
    }, [selectedUjianId]);

    // Initial fetch and manual re-fetch when selectedUjianId changes
    useEffect(() => {
        fetchReports(true);
    }, [fetchReports]);

    // Background polling every 10 seconds for real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            fetchReports(false);
        }, 10000); // 10 seconds

        return () => clearInterval(interval);
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
            r.ruang?.toLowerCase().includes(term) ||
            r.kelas_name?.toLowerCase().includes(term)
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
        // Calling window.print() behaves as "Save as PDF" on most modern desktop browsers
        window.print();
    };

    const handleBulkPrint = () => {
        setIsBulkPrinting(true);
        // Wait a bit for React to render the massive hidden div and images to load
        setTimeout(() => {
            window.print();
            setIsBulkPrinting(false);
        }, 1000);
    };

    const handleDelete = (id, e) => {
        e.stopPropagation();
        Swal.fire({
            title: 'Hapus Berita Acara?',
            text: "Data yang dihapus tidak bisa dikembalikan!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Ya, Hapus!',
            cancelButtonText: 'Batal'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/laporan/${id}`);
                    Swal.fire('Terhapus!', 'Berita acara berhasil dihapus.', 'success');
                    fetchReports();
                } catch (error) {
                    console.error('Failed to delete report', error);
                    Swal.fire('Gagal!', 'Gagal menghapus berita acara.', 'error');
                }
            }
        });
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
                    <div className="p-8 sm:p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider flex items-center gap-3">
                            <FileText className="text-violet" size={24} />
                            Daftar Berita Acara
                        </h3>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            {filteredReports.length > 0 && (
                                <button
                                    onClick={handleBulkPrint}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all font-bold text-xs"
                                >
                                    <Printer size={16} /> Download Semua PDF
                                </button>
                            )}
                            <span className="bg-slate-100 dark:bg-slate-800 px-4 py-1.5 rounded-full text-xs font-black text-slate-500 uppercase tracking-widest hidden sm:inline-block">
                                {filteredReports.length} Laporan
                            </span>
                        </div>
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
                                                    <span>🏫 {report.kelas?.nama_kelas || report.kelas_name || '-'}</span>
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
                                        <div className="flex items-center gap-2 shrink-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); openReport(report); }}
                                                className="flex items-center gap-2 px-4 py-2 bg-violet/10 text-violet rounded-xl border border-violet/20 hover:bg-violet/20 transition-all font-bold text-xs"
                                            >
                                                <Eye size={16} /> Lihat
                                            </button>
                                            <button
                                                onClick={(e) => handleDelete(report.id, e)}
                                                className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-all font-bold text-xs"
                                                title="Hapus Laporan"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Berita Acara Modal (Single View) */}
            {showModal && selectedReport && !isBulkPrinting && (
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
                                    <Printer size={16} /> Download PDF
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

            {/* Bulk Print Hidden Container */}
            {isBulkPrinting && (
                <div className="fixed inset-0 z-[200] bg-white print:block overflow-y-auto">
                    {/* Status message while building the massive DOM */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center print:hidden">
                        <Loader2 className="animate-spin text-violet mb-4" size={48} />
                        <h2 className="text-xl font-black text-slate-800">Menyiapkan {filteredReports.length} Dokumen PDF...</h2>
                        <p className="text-slate-500 font-bold mt-2">Mohon tunggu sebentar, dialog print akan segera muncul.</p>
                    </div>

                    <div className="hidden print:block">
                        {filteredReports.map((report, idx) => (
                            <div key={report.id} style={{ pageBreakAfter: idx < filteredReports.length - 1 ? 'always' : 'auto' }}>
                                <BeritaAcaraDocument report={report} />
                            </div>
                        ))}
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
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
        return `${days[date.getDay()]}, tanggal ${date.getDate()} bulan ${months[date.getMonth()]} tahun ${date.getFullYear()}`;
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
        if (!kelasName || kelasName === '-') return '-';
        // Match Roman numerals for high school grades, unique them, and join them
        const matches = String(kelasName).match(/\b(XII|XI|X)\b/g);
        if (matches && matches.length > 0) {
            return [...new Set(matches)].join(', ');
        }
        return '-';
    };

    const ujianName = report.ujian?.nama_ujian || '-';
    const headerTitle = `${ujianName.toUpperCase()}`;

    // Debugging line to see what exactly `report` contains for kelas
    console.log("Rendering BeritaAcaraDocument with report data:", {
        kelasObject: report.kelas,
        kelasNameProp: report.kelas_name
    });

    // LaporanController explicitly returns 'kelas' object if it exists (from DB relation) or falls back to 'kelas_name' from the getAssignment/list API if it's mixed
    const displayKelas = report.kelas?.nama_kelas || report.kelas_name || (typeof report.kelas === 'string' ? report.kelas : '-');

    // Ensure blank lines don't push content to second page
    const absentLines = report.absent_details
        ? report.absent_details.split('\n').filter(Boolean)
        : [];
    const maxLines = 15; // Max limit to avoid pushing footprint down
    const safeAbsentLines = absentLines.slice(0, maxLines);
    const blankLinesNeeded = Math.max(0, 3 - safeAbsentLines.length);

    // Prepare signature URL. LaporanController returns signature_url which might be missing port 8000 in dev environments
    let sigUrl = null;
    if (report.signature_path) {
        const cleanPath = report.signature_path.replace(/^storage\//, '').replace(/^public\//, '');
        sigUrl = `http://${window.location.hostname}:8000/storage/${cleanPath}`;
    } else if (report.signature_url) {
        sigUrl = report.signature_url.includes(':8000') ? report.signature_url : report.signature_url.replace(window.location.hostname, `${window.location.hostname}:8000`);
    }

    return (
        <div className="bg-white text-black shrink-0 relative overflow-hidden" style={{ fontFamily: 'Times New Roman, serif', fontSize: '11pt' }}>
            <style type="text/css" media="print">
                {`
                    @page { size: A4 portrait; margin: 0; }
                    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                `}
            </style>

            {/* Page Container forced to exactly 1 A4 page dimensions */}
            <div className="px-[20mm] py-[10mm] print:px-[15mm] print:py-[10mm] print:pb-[15mm] flex flex-col w-[210mm] min-h-[297mm] print:h-[297mm] mx-auto box-border relative">

                {/* Kop Surat */}
                <div className="mb-2 shrink-0">
                    <img src="/kop-surat.png" alt="Kop Surat SMK Kartanegara Wates" className="w-full h-auto max-h-[35mm]" />
                </div>

                {/* Title */}
                <div className="text-center mb-4 mt-2 shrink-0">
                    <p className="font-bold text-[13pt] tracking-wide">BERITA ACARA</p>
                    <p className="font-bold text-[11pt]">{headerTitle}</p>
                    <p className="font-bold text-[11pt]">SMK KARTANEGARA WATES KAB. KEDIRI</p>
                </div>

                {/* Opening Paragraph */}
                <p className="mb-3 text-justify leading-relaxed shrink-0">
                    Pada hari ini {formatDateFormal(report.mulai_ujian)}, telah diselenggarakan {ujianName.toLowerCase()} kelas {getTingkatText(displayKelas)} matapelajaran {report.nama_mapel?.toLowerCase() || '-'} mulai pukul {formatTime(report.mulai_ujian)} sampai pukul {formatTime(report.ujian_berakhir)} pada :
                </p>

                {/* Info Table */}
                <div className="ml-8 mb-4 shrink-0">
                    <table className="w-full">
                        <tbody>
                            <InfoRow label="1. Sekolah" value="SMK Kartanegara Wates" />
                            <InfoRow label="    Alamat" value="Jl. Raya Bondo - Wates, Kabupaten Kediri, Jawa Timur" />
                            <InfoRow label="    Tingkat" value={getTingkatText(displayKelas)} />
                            <InfoRow label="    Kelas" value={displayKelas} />
                            <InfoRow label="    Ruang" value={`${report.ruang || '-'} - ${report.kampus || '-'}`} />
                            <InfoRow label="    Sesi" value={getSesiText(report.sesi)} />
                            <InfoRow label="    Jumlah peserta seharusnya" value={`${report.total_expected} peserta`} />
                            <InfoRow label="    Jumlah peserta yang hadir" value={`${report.total_present} peserta`} />
                            <InfoRow label="    Jumlah peserta yang tidak hadir" value={`${report.total_absent} peserta`} />
                        </tbody>
                    </table>

                    {/* Absent details */}
                    <div className="mt-2 shrink-0 text-[10pt]">
                        <p style={{ paddingLeft: '1.5em' }}>Nama peserta yang tidak hadir :</p>
                        <div className="mt-1 ml-6">
                            {safeAbsentLines.map((line, i) => (
                                <p key={i} className="border-b border-black py-[2px]">{line}</p>
                            ))}
                            {safeAbsentLines.length === 0 && Array.from({ length: Math.min(blankLinesNeeded, 2) }).map((_, i) => (
                                <div key={`blank-${i}`} className="border-b border-black h-5 mt-1" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Section 2: Catatan */}
                <div className="mb-2 shrink-0">
                    <p className="font-bold mb-1">2. Catatan pelaksanaan :</p>
                    <div className="border border-black rounded-sm min-h-[60px] max-h-[80px] overflow-hidden p-2 text-[10pt]">
                        <p className="whitespace-pre-wrap">{report.notes || ''}</p>
                    </div>
                </div>

                {/* Section 3 & 4: Pengawas & Tanda Tangan (Pushed to bottom) */}
                <div className="flex justify-between mt-12 mb-[10mm] shrink-0">
                    <div className="w-[45%]">
                        <p className="font-bold mb-1">3. Nama pengawas ruang</p>
                        <div className="border border-black rounded-sm h-[60px] p-2 flex items-center justify-center">
                            <p className="text-center font-bold text-[10pt]">{report.pengawas?.name || '-'}</p>
                        </div>
                    </div>
                    <div className="w-[45%]">
                        <p className="font-bold mb-1">4. Tanda tangan pengawas</p>
                        <div className="border border-black rounded-sm h-[60px] p-2 flex items-center justify-center">
                            {sigUrl ? (
                                <img src={sigUrl} alt="Tanda tangan" className="max-h-[50px] object-contain" />
                            ) : (
                                <p className="text-slate-400 text-sm italic">Tidak ada</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-[8mm] left-[15mm] right-[15mm] print:bottom-[8mm]">
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
