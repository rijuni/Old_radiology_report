import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
    Search, RotateCcw, Eye,
    ChevronLeft, ChevronRight, AlertTriangle,
    ChevronDown, ChevronUp,
    Database, CheckCircle2, Clock, FilePlus,
} from 'lucide-react';

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {[...Array(8)].map((_, i) => (
                <td key={i} className="px-4 py-3">
                    <div className="skeleton" style={{ height: '13px', width: i === 2 ? '70%' : i === 3 ? '80%' : '50%', minWidth: '28px' }} />
                </td>
            ))}
        </tr>
    );
}

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
    const s = status || '';
    const isFinal = s === 'Final' || s === '2' || s === '3';
    const isDraft = s === 'Draft' || s === '1';
    const isNew = s === 'New' || s === '0';
    const label = isFinal ? 'Final' : isDraft ? 'Draft' : isNew ? 'New' : s || '—';

    const cfg = isFinal
        ? { bg: '#dcfce7', border: '#86efac', color: '#15803d' }
        : isDraft
            ? { bg: '#fef9c3', border: '#fde047', color: '#a16207' }
            : isNew
                ? { bg: '#dbeafe', border: '#93c5fd', color: '#1d4ed8' }
                : { bg: '#f1f5f9', border: '#e2e8f0', color: '#94a3b8' };

    return (
        <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
        >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
            {label}
        </span>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, primary }) {
    return (
        <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{
                background: primary ? '#1e293b' : '#ffffff',
                border: primary ? 'none' : '1px solid #e2e8f0',
                boxShadow: primary ? '0 4px 16px rgba(30,41,59,0.3)' : '0 1px 4px rgba(0,0,0,0.05)',
            }}
        >
            <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{
                    background: primary ? 'rgba(255,255,255,0.12)' : `${accent}18`,
                    border: `1.5px solid ${primary ? 'rgba(255,255,255,0.15)' : accent + '40'}`,
                }}
            >
                <Icon size={20} style={{ color: primary ? '#fff' : accent }} />
            </div>
            <div>
                <p className="text-xs font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: primary ? 'rgba(255,255,255,0.55)' : '#94a3b8' }}>
                    {label}
                </p>
                <p className="text-2xl font-extrabold leading-none"
                    style={{ color: primary ? '#fff' : '#1e293b', animation: 'countUp 0.4s ease-out' }}>
                    {value.toLocaleString()}
                </p>
            </div>
        </div>
    );
}

// ── Filter Field ──────────────────────────────────────────────────────────────
function FilterInput({ label, required, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#64748b' }}>
                {label}{required && <span style={{ color: '#ef4444', marginLeft: '3px' }}>*</span>}
            </label>
            <input {...props} className="input-slate" />
        </div>
    );
}

function FilterSelect({ label, children, disabled, ...props }) {
    return (
        <div className="flex flex-col gap-1">
            <label style={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: disabled ? '#cbd5e1' : '#64748b' }}>
                {label}
            </label>
            <select {...props} disabled={disabled} className="input-slate" style={{ cursor: disabled ? 'not-allowed' : 'pointer', appearance: 'none' }}>
                {children}
            </select>
        </div>
    );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [filtersExpanded, setFiltersExpanded] = useState(true);
    const [error, setError] = useState('');
    const [searchExecuted, setSearchExecuted] = useState(false);
    const [jumpPage, setJumpPage] = useState('');
    const [reportError, setReportError] = useState({});   // { [rowIdx]: message }
    const [statusCounts, setStatusCounts] = useState({ final: 0, draft: 0, newR: 0, displayTotal: 0 });
    const [searchParams, setSearchParams] = useState({
        name: '', id: '', modality: '', study: '',
        serviceStatus: '', radiologist: '',
        accessionNo: '', fromDate: '', toDate: '',
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    useEffect(() => { fetchPatients({}, 1, true); }, []);

    const fetchPatients = async (filters, page = 1, skipResults = false) => {
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams();
            query.append('page', page);
            query.append('page_size', 15);

            // Always include all non-blank fields using && (AND) logic:
            // Patient ID, Modality, Study, Patient Type, Service Status + date range
            if (filters.id) query.append('id', filters.id);
            if (filters.modality) query.append('modality', filters.modality);
            if (filters.study) query.append('study', filters.study);
            if (filters.serviceStatus) {
                const map = { 'New': '0', 'Draft': '1', 'Final': '2' };
                query.append('service_status', map[filters.serviceStatus] || filters.serviceStatus);
            }
            if (filters.name) query.append('name', filters.name);
            if (filters.accessionNo) query.append('accessionNo', filters.accessionNo);
            if (filters.fromDate) query.append('fromDate', filters.fromDate);
            if (filters.toDate) query.append('toDate', filters.toDate);

            // Helper: fetch just the count for a given service_status using the same filters.
            // page_size=1 means only 1 record is transferred — we only need data.count.
            const fetchStatusCount = async (statusCode) => {
                const sq = new URLSearchParams(query);
                sq.set('page', 1);
                sq.set('page_size', 1);
                sq.set('service_status', statusCode);
                // Remove any existing service_status filter so we get the clean per-status count.
                // (URLSearchParams.set replaces instead of appending, so this is already correct.)
                try {
                    const r = await fetch(`/api/patients/?${sq.toString()}`, {
                        headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
                    });
                    if (!r.ok) return 0;
                    const d = await r.json();
                    return d.count || 0;
                } catch { return 0; }
            };

            const res = await fetch(`/api/patients/?${query.toString()}`, {
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
            });

            if (res.status === 401) { localStorage.clear(); navigate('/login'); return; }
            if (!res.ok) throw new Error('fetch failed');

            const data = await res.json();
            const results = data.results || [];

            let fCount = 0, dCount = 0, nCount = 0, dTotal = 0;

            // Fetch aggregated stats for the full filtered dataset across all pages
            const [finalCount, draftCount, newCount] = await Promise.all([
                fetchStatusCount('2'),
                fetchStatusCount('1'),
                fetchStatusCount('0')
            ]);
            fCount = finalCount;
            dCount = draftCount;
            nCount = newCount;
            dTotal = data.count || 0;

            if (!skipResults) {
                setPatients(results);
                setTotalPages(Math.ceil((data.count || 0) / 15));
                setCurrentPage(page);
            } else {
                setPatients([]);
                setTotalPages(1);
                setCurrentPage(1);
            }
            setTotalCount(data.count || 0); // Raw DB total for pagination to work
            setStatusCounts({ final: fCount, draft: dCount, newR: nCount, displayTotal: data.count || 0 });
        } catch (err) {
            console.error(err);
            setError('Error fetching patients. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setError('');
        if (name === 'fromDate') {
            setSearchParams(prev => {
                const nd = { ...prev, [name]: value };
                if (nd.toDate && nd.toDate < value) nd.toDate = value;
                return nd;
            });
        } else {
            setSearchParams(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateSearch = () => {
        // Date range is NOT required if any of these key fields are filled
        const hasKeyFilter = !!(searchParams.name || searchParams.id || searchParams.modality ||
            searchParams.study || searchParams.serviceStatus);

        if (!hasKeyFilter) {
            // No key filter provided — require date range
            if (!searchParams.fromDate || !searchParams.toDate) {
                setError('Please provide at least one of: Patient ID, Modality, Study, Service Status — OR a valid Date Range.');
                return false;
            }
        }
        if (searchParams.fromDate && searchParams.toDate &&
            new Date(searchParams.fromDate) > new Date(searchParams.toDate)) {
            setError('From Date cannot be later than To Date.'); return false;
        }
        return true;
    };

    // ── View Report (with 404 guard) ──────────────────────────────────────────
    const handleViewReport = async (url, rowIdx, download = false) => {
        try {
            const res = await fetch(url, { method: 'HEAD' });
            if (res.status === 404) {
                setReportError(prev => ({ ...prev, [rowIdx]: 'No Report Available' }));
                setTimeout(() => setReportError(prev => { const n = { ...prev }; delete n[rowIdx]; return n; }), 4000);
                return;
            }
            if (!res.ok) {
                setReportError(prev => ({ ...prev, [rowIdx]: 'Report Unavailable' }));
                setTimeout(() => setReportError(prev => { const n = { ...prev }; delete n[rowIdx]; return n; }), 4000);
                return;
            }
        } catch {
            setReportError(prev => ({ ...prev, [rowIdx]: 'Report Unavailable' }));
            setTimeout(() => setReportError(prev => { const n = { ...prev }; delete n[rowIdx]; return n; }), 4000);
            return;
        }
        // File confirmed — open it
        if (download) {
            const a = document.createElement('a');
            a.href = url;
            a.download = `report.pdf`;
            a.click();
        } else {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    const handleSearch = () => { if (validateSearch()) { setSearchExecuted(true); fetchPatients(searchParams, 1); } };
    const handleReset = () => {
        const today = new Date().toISOString().split('T')[0];
        const d = { name: '', id: '', modality: '', study: '', serviceStatus: '', radiologist: '', accessionNo: '', fromDate: today, toDate: today };
        setSearchParams(d);
        setSearchExecuted(false);
        fetchPatients(d, 1, true);
        setError('');
    };

    const today = new Date().toISOString().split('T')[0];
    // Stats are derived from the FULL result set across all pages:
    //   - total  → totalCount returned by DRF (count of all matching records)
    //   - others → per-status counts fetched in parallel alongside the main request
    const stats = {
        total: statusCounts.displayTotal || 0,
        final: statusCounts.final,
        draft: statusCounts.draft,
        newR: statusCounts.newR,
    };

    const TH = ['Sl No', 'Patient ID', 'Patient Name', 'Study Description', 'Modality', 'Date', 'Status', 'Action'];

    return (
        <div className="flex flex-col min-h-screen" style={{ background: '#f1f5f9' }}>
            <Header />

            <main className="flex-1 pb-8 px-3 md:px-5 pt-3" style={{ animation: 'fadeIn 0.4s ease-out' }}>

                {/* ── Stats Row ────────────────────────────────────────── */}
                {!loading && (
                    <div
                        className="sticky z-40 pt-1 pb-3 -mt-1"
                        style={{ top: '86px', background: '#f1f5f9', animation: 'slideUp 0.35s ease-out' }}
                    >
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <StatCard icon={Database} label="Total" value={stats.total} accent="#334155" />
                            <StatCard icon={CheckCircle2} label="Final" value={stats.final} accent="#16a34a" />
                            <StatCard icon={Clock} label="Draft" value={stats.draft} accent="#ca8a04" />
                            <StatCard icon={FilePlus} label="New" value={stats.newR} accent="#2563eb" />
                        </div>
                    </div>
                )}

                {/* ── Main Card ────────────────────────────────────────── */}
                <div className="card-slate overflow-hidden">

                    {/* Filter Panel Toggle */}
                    <div
                        className="flex items-center justify-between px-4 py-2 cursor-pointer select-none"
                        style={{
                            background: '#f8fafc',
                            borderBottom: filtersExpanded ? '1px solid #e2e8f0' : 'none',
                        }}
                        onClick={() => setFiltersExpanded(p => !p)}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                                style={{ background: '#e2e8f0', border: '1px solid #cbd5e1' }}>
                                <Search size={14} style={{ color: '#475569' }} />
                            </div>
                            <span className="text-sm font-bold" style={{ color: '#334155' }}>Search Filters</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                                {filtersExpanded ? 'Collapse' : 'Expand'}
                            </span>
                            {filtersExpanded
                                ? <ChevronUp size={14} style={{ color: '#94a3b8' }} />
                                : <ChevronDown size={14} style={{ color: '#94a3b8' }} />
                            }
                        </div>
                    </div>

                    {/* Filter Body */}
                    {filtersExpanded && (
                        <div
                            className="p-3"
                            style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', animation: 'slideUp 0.2s ease-out' }}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-3">
                                <FilterInput label="Patient Name" type="text" name="name" value={searchParams.name} onChange={handleChange} placeholder="Patient Name" />
                                <FilterInput label="Patient ID" required type="text" name="id" value={searchParams.id} onChange={handleChange} placeholder="Enter MRN" />
                                <FilterSelect label="Modality" name="modality" value={searchParams.modality} onChange={handleChange}>
                                    <option value="">All Modalities</option>
                                    {['CR', 'US', 'CT', 'MR', 'MG', 'ECG', 'NM', 'DX', 'PT', 'ES', 'OT', 'UNKNOWN'].map(m => <option key={m} value={m}>{m}</option>)}
                                </FilterSelect>
                                <FilterInput label="Study" type="text" name="study" value={searchParams.study} onChange={handleChange} placeholder="Study Description" />
                                <FilterInput label="Accession No" type="text" name="accessionNo" value={searchParams.accessionNo} onChange={handleChange} placeholder="Accession No" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                                <FilterSelect label="Service Status" name="serviceStatus" value={searchParams.serviceStatus} onChange={handleChange}>
                                    <option value="">All Statuses</option>
                                    <option value="New">New</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Final">Final</option>
                                </FilterSelect>
                                <FilterSelect label="Radiologist" disabled>
                                    <option value="">Unavailable</option>
                                </FilterSelect>
                                <FilterInput label="From Date" required type="date" name="fromDate" value={searchParams.fromDate} max={today} onChange={handleChange} />
                                <FilterInput label="To Date" required type="date" name="toDate" value={searchParams.toDate} min={searchParams.fromDate} max={today} onChange={handleChange} />
                            </div>

                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <button
                                    onClick={handleSearch}
                                    className="btn-slate flex items-center gap-2"
                                >
                                    <Search size={14} /> Search Records
                                </button>
                                <button
                                    onClick={handleReset}
                                    className="btn-outline flex items-center gap-2"
                                >
                                    <RotateCcw size={14} /> Reset
                                </button>
                                {error && (
                                    <div
                                        className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold"
                                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', animation: 'slideUp 0.2s ease-out' }}
                                    >
                                        <AlertTriangle size={12} /> {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Results info strip */}
                    {searchExecuted && !loading && patients.length > 0 && (
                        <div
                            className="px-4 py-1.5 flex items-center gap-1.5 text-xs"
                            style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', background: '#fff' }}
                        >
                            Showing page <span className="font-bold text-slate-600 mx-0.5">{currentPage}</span> of
                            <span className="font-bold text-slate-600 mx-0.5">{totalPages}</span> —
                            <span className="font-bold text-slate-700 mx-0.5">{totalCount.toLocaleString()}</span> total records
                        </div>
                    )}

                    {/* ── Table & Pagination Area ────────────────────────── */}
                    {searchExecuted && (
                        <>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-sm">
                                    <thead>
                                        <tr style={{ background: '#334155' }}>
                                            {TH.map(th => (
                                                <th
                                                    key={th}
                                                    className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider"
                                                    style={{ color: '#ffffff', whiteSpace: 'nowrap' }}
                                                >
                                                    {th}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            [...Array(8)].map((_, i) => <SkeletonRow key={i} />)
                                        ) : patients.length > 0 ? (
                                            patients.map((row, idx) => (
                                                <tr
                                                    key={idx}
                                                    style={{
                                                        background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                        borderBottom: '1px solid #f1f5f9',
                                                        transition: 'background 0.12s',
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#eff6ff'}
                                                    onMouseLeave={e => { e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'; }}
                                                >
                                                    {/* Sl No */}
                                                    <td className="px-3 py-1.5 text-xs font-medium" style={{ color: '#cbd5e1' }}>
                                                        {(currentPage - 1) * 15 + idx + 1}
                                                    </td>
                                                    {/* MRN */}
                                                    <td className="px-3 py-1.5 font-mono text-xs font-bold" style={{ color: '#2563eb' }}>
                                                        {row.mrn}
                                                    </td>
                                                    {/* Name */}
                                                    <td className="px-3 py-1.5 font-semibold text-sm" style={{ color: '#1e293b' }}>
                                                        {row.name}
                                                    </td>
                                                    {/* Study */}
                                                    <td className="px-3 py-1.5 text-xs" style={{ color: '#64748b', maxWidth: '220px' }}>
                                                        {row.study_description}
                                                    </td>
                                                    {/* Modality */}
                                                    <td className="px-3 py-1.5 text-center">
                                                        <span
                                                            className="px-2 py-1 rounded font-mono text-xs font-bold"
                                                            style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}
                                                        >
                                                            {row.modality}
                                                        </span>
                                                    </td>
                                                    {/* Date */}
                                                    <td className="px-3 py-1.5 text-center text-xs font-medium" style={{ color: '#94a3b8' }}>
                                                        {row.exam_date}
                                                    </td>
                                                    {/* Status */}
                                                    <td className="px-3 py-1.5 text-center">
                                                        <StatusBadge status={row.service_status} />
                                                    </td>
                                                    {/* Action */}
                                                    <td className="px-3 py-1.5">
                                                        {row.report_path ? (
                                                            <div className="flex flex-col items-center gap-1.5">
                                                                <button
                                                                    onClick={() => handleViewReport(
                                                                        `/api/reports/view/?path=${encodeURIComponent(row.report_path)}&token=${localStorage.getItem('token')}`,
                                                                        idx
                                                                    )}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-150"
                                                                    style={{ background: '#2563eb', boxShadow: '0 2px 6px rgba(37,99,235,0.3)', border: 'none', cursor: 'pointer' }}
                                                                    onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
                                                                    onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
                                                                >
                                                                    <Eye size={12} /> View Report
                                                                </button>
                                                                {reportError[idx] && (
                                                                    <span
                                                                        className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                                                                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', animation: 'slideUp 0.2s ease-out', whiteSpace: 'nowrap' }}
                                                                    >
                                                                        <AlertTriangle size={10} /> {reportError[idx]}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs italic" style={{ color: '#cbd5e1' }}>No Report</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={TH.length} className="py-16 text-center">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                                            style={{ background: '#f1f5f9', border: '2px solid #e2e8f0' }}>
                                                            <Search size={24} style={{ color: '#cbd5e1' }} />
                                                        </div>
                                                        <p className="text-sm font-bold" style={{ color: '#94a3b8' }}>No records found</p>
                                                        <p className="text-xs" style={{ color: '#cbd5e1' }}>Try adjusting your search filters</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (() => {
                                // Build the window of page numbers to show
                                const WINDOW = 2; // pages on each side of current
                                const pages = [];
                                const start = Math.max(2, currentPage - WINDOW);
                                const end = Math.min(totalPages - 1, currentPage + WINDOW);

                                pages.push(1);
                                if (start > 2) pages.push('...');
                                for (let p = start; p <= end; p++) pages.push(p);
                                if (end < totalPages - 1) pages.push('...');
                                if (totalPages > 1) pages.push(totalPages);

                                const handleJump = () => {
                                    const n = parseInt(jumpPage, 10);
                                    if (!isNaN(n) && n >= 1 && n <= totalPages && n !== currentPage) {
                                        fetchPatients(searchParams, n);
                                    }
                                    setJumpPage('');
                                };

                                return (
                                    <div
                                        style={{
                                            borderTop: '1px solid #e2e8f0',
                                            background: '#f8fafc',
                                            padding: '10px 20px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: '12px',
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        {/* Left: record / page summary */}
                                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>
                                            <span style={{ fontWeight: 700, color: '#1e293b' }}>{totalCount.toLocaleString()}</span> records
                                            {' · '}
                                            Page{' '}
                                            <span style={{ fontWeight: 700, color: '#334155' }}>{currentPage}</span>
                                            {' / '}
                                            <span style={{ fontWeight: 700, color: '#334155' }}>{totalPages}</span>
                                        </span>

                                        {/* Centre: page number buttons + prev/next */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>

                                            {/* Previous */}
                                            <button
                                                onClick={() => fetchPatients(searchParams, currentPage - 1)}
                                                disabled={currentPage === 1 || loading}
                                                title="Previous page"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    padding: '5px 10px', borderRadius: '7px',
                                                    fontSize: '12px', fontWeight: 700,
                                                    border: '1.5px solid #e2e8f0',
                                                    background: '#fff', color: '#475569',
                                                    cursor: (currentPage === 1 || loading) ? 'not-allowed' : 'pointer',
                                                    opacity: (currentPage === 1 || loading) ? 0.35 : 1,
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { if (currentPage !== 1 && !loading) e.currentTarget.style.background = '#f1f5f9'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                            >
                                                <ChevronLeft size={13} /> Prev
                                            </button>

                                            {/* Page number chips */}
                                            {pages.map((p, i) =>
                                                p === '...' ? (
                                                    <span
                                                        key={`ellipsis-${i}`}
                                                        style={{ padding: '5px 6px', fontSize: '12px', color: '#94a3b8', userSelect: 'none' }}
                                                    >…</span>
                                                ) : (
                                                    <button
                                                        key={p}
                                                        onClick={() => p !== currentPage && fetchPatients(searchParams, p)}
                                                        disabled={loading}
                                                        style={{
                                                            minWidth: '32px', height: '30px',
                                                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                                                            borderRadius: '7px',
                                                            fontSize: '12px', fontWeight: p === currentPage ? 800 : 600,
                                                            border: p === currentPage ? 'none' : '1.5px solid #e2e8f0',
                                                            background: p === currentPage ? '#1e293b' : '#fff',
                                                            color: p === currentPage ? '#fff' : '#475569',
                                                            cursor: (p === currentPage || loading) ? 'default' : 'pointer',
                                                            boxShadow: p === currentPage ? '0 2px 8px rgba(30,41,59,0.25)' : 'none',
                                                            transform: p === currentPage ? 'scale(1.08)' : 'scale(1)',
                                                            transition: 'all 0.15s',
                                                        }}
                                                        onMouseEnter={e => { if (p !== currentPage && !loading) e.currentTarget.style.background = '#f1f5f9'; }}
                                                        onMouseLeave={e => { if (p !== currentPage) e.currentTarget.style.background = '#fff'; }}
                                                    >
                                                        {p}
                                                    </button>
                                                )
                                            )}

                                            {/* Next */}
                                            <button
                                                onClick={() => fetchPatients(searchParams, currentPage + 1)}
                                                disabled={currentPage === totalPages || loading}
                                                title="Next page"
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '4px',
                                                    padding: '5px 10px', borderRadius: '7px',
                                                    fontSize: '12px', fontWeight: 700,
                                                    border: '1.5px solid #e2e8f0',
                                                    background: '#fff', color: '#475569',
                                                    cursor: (currentPage === totalPages || loading) ? 'not-allowed' : 'pointer',
                                                    opacity: (currentPage === totalPages || loading) ? 0.35 : 1,
                                                    transition: 'all 0.15s',
                                                }}
                                                onMouseEnter={e => { if (currentPage !== totalPages && !loading) e.currentTarget.style.background = '#f1f5f9'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                            >
                                                Next <ChevronRight size={13} />
                                            </button>
                                        </div>

                                        {/* Right: Jump-to-page */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>Go to:</span>
                                            <input
                                                type="number"
                                                min={1}
                                                max={totalPages}
                                                value={jumpPage}
                                                onChange={e => setJumpPage(e.target.value)}
                                                onKeyDown={e => e.key === 'Enter' && handleJump()}
                                                placeholder="#"
                                                style={{
                                                    width: '52px', height: '30px',
                                                    border: '1.5px solid #e2e8f0', borderRadius: '7px',
                                                    padding: '0 8px', fontSize: '12px', fontWeight: 600,
                                                    color: '#334155', background: '#fff',
                                                    textAlign: 'center', outline: 'none',
                                                }}
                                                onFocus={e => { e.target.style.borderColor = '#334155'; }}
                                                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; }}
                                            />
                                            <button
                                                onClick={handleJump}
                                                disabled={loading}
                                                style={{
                                                    height: '30px', padding: '0 10px',
                                                    borderRadius: '7px', fontSize: '12px', fontWeight: 700,
                                                    background: '#334155', color: '#fff', border: 'none',
                                                    cursor: loading ? 'not-allowed' : 'pointer',
                                                    opacity: loading ? 0.5 : 1,
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1e293b'; }}
                                                onMouseLeave={e => { e.currentTarget.style.background = '#334155'; }}
                                            >
                                                Go
                                            </button>
                                        </div>
                                    </div>
                                );
                            })()}
                        </>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
