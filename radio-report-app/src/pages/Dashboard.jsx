import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import {
    Search, RotateCcw, Eye, Download,
    ChevronLeft, ChevronRight, AlertTriangle,
    ChevronDown, ChevronUp,
    Database, CheckCircle2, Clock, FilePlus,
} from 'lucide-react';

// ── Skeleton Row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {[...Array(9)].map((_, i) => (
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

// ── Patient Type Badge ────────────────────────────────────────────────────────
function TypeBadge({ type }) {
    if (!type) return <span style={{ color: '#cbd5e1', fontSize: '12px' }}>—</span>;
    const isIP = type === 'IP';
    return (
        <span
            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{
                background: isIP ? '#f3f0ff' : '#ecfdf5',
                border: `1px solid ${isIP ? '#e9d5ff' : '#a7f3d0'}`,
                color: isIP ? '#7c3aed' : '#065f46',
            }}
        >
            {isIP ? '🏥 IP' : '🚶 OP'}
        </span>
    );
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, accent, primary }) {
    return (
        <div
            className="flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
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
    const [searchParams, setSearchParams] = useState({
        name: '', id: '', modality: '', study: '',
        serviceStatus: '', patientType: '', radiologist: '',
        accessionNo: '', fromDate: '', toDate: '',
    });

    useEffect(() => {
        if (!localStorage.getItem('token')) navigate('/login');
    }, [navigate]);

    useEffect(() => { fetchPatients({}, 1); }, []);

    const fetchPatients = async (filters, page = 1) => {
        setLoading(true); setError('');
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams();
            query.append('page', page);
            if (filters.id) {
                query.append('id', filters.id);
            } else {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && key !== 'id') {
                        if (key === 'serviceStatus') {
                            const map = { 'New': '0', 'Draft': '1', 'Final': '2' };
                            query.append('service_status', map[value] || value);
                        } else if (key === 'patientType') query.append('patient_type', value);
                        else query.append(key, value);
                    }
                });
            }
            const res = await fetch(`/api/patients/?${query.toString()}`, {
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
            });
            if (res.status === 401) { localStorage.clear(); navigate('/login'); return; }
            if (!res.ok) throw new Error('fetch failed');
            const data = await res.json();
            setPatients(data.results || []);
            setTotalCount(data.count || 0);
            setTotalPages(Math.ceil((data.count || 0) / 100));
            setCurrentPage(page);
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
        if (searchParams.id) return true;
        if (!searchParams.fromDate || !searchParams.toDate) {
            setError('Please provide either a Patient ID OR a valid Date Range.'); return false;
        }
        if (new Date(searchParams.fromDate) > new Date(searchParams.toDate)) {
            setError('From Date cannot be later than To Date.'); return false;
        }
        return true;
    };

    const handleSearch = () => { if (validateSearch()) fetchPatients(searchParams, 1); };
    const handleReset = () => {
        const today = new Date().toISOString().split('T')[0];
        const d = { name: '', id: '', modality: '', study: '', serviceStatus: '', patientType: '', radiologist: '', accessionNo: '', fromDate: today, toDate: today };
        setSearchParams(d); fetchPatients(d, 1); setError('');
    };

    const today = new Date().toISOString().split('T')[0];
    const stats = {
        total: patients.length,
        final: patients.filter(p => ['Final', '2', '3'].includes(p.service_status)).length,
        draft: patients.filter(p => ['Draft', '1'].includes(p.service_status)).length,
        newR: patients.filter(p => ['New', '0'].includes(p.service_status)).length,
    };

    const TH = ['Sl No', 'Patient ID', 'Patient Name', 'Study Description', 'Modality', 'Type', 'Date', 'Status', 'Action'];

    return (
        <div className="flex flex-col min-h-screen" style={{ background: '#f1f5f9' }}>
            <Header />

            <main className="flex-1 pb-16 px-4 md:px-6 pt-5" style={{ animation: 'fadeIn 0.4s ease-out' }}>

                {/* ── Stats Row ────────────────────────────────────────── */}
                {!loading && patients.length > 0 && (
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5" style={{ animation: 'slideUp 0.35s ease-out' }}>
                        <StatCard icon={Database} label="Showing" value={stats.total} accent="#334155" primary />
                        <StatCard icon={CheckCircle2} label="Final" value={stats.final} accent="#16a34a" />
                        <StatCard icon={Clock} label="Draft" value={stats.draft} accent="#ca8a04" />
                        <StatCard icon={FilePlus} label="New" value={stats.newR} accent="#2563eb" />
                    </div>
                )}

                {/* ── Main Card ────────────────────────────────────────── */}
                <div className="card-slate overflow-hidden">

                    {/* Filter Panel Toggle */}
                    <div
                        className="flex items-center justify-between px-5 py-3 cursor-pointer select-none"
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
                            className="p-5"
                            style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', animation: 'slideUp 0.2s ease-out' }}
                        >
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-4">
                                <FilterInput label="Patient Name" type="text" name="name" value={searchParams.name} onChange={handleChange} placeholder="Patient Name" />
                                <FilterInput label="Patient ID" required type="text" name="id" value={searchParams.id} onChange={handleChange} placeholder="Enter MRN" />
                                <FilterSelect label="Modality" name="modality" value={searchParams.modality} onChange={handleChange}>
                                    <option value="">All Modalities</option>
                                    {['CR', 'US', 'CT', 'MR', 'MG', 'ECG', 'NM', 'DX', 'PT', 'ES', 'OT', 'UNKNOWN'].map(m => <option key={m} value={m}>{m}</option>)}
                                </FilterSelect>
                                <FilterInput label="Study" type="text" name="study" value={searchParams.study} onChange={handleChange} placeholder="Study Description" />
                                <FilterInput label="Accession No" type="text" name="accessionNo" value={searchParams.accessionNo} onChange={handleChange} placeholder="Accession No" />
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                <FilterSelect label="Service Status" name="serviceStatus" value={searchParams.serviceStatus} onChange={handleChange}>
                                    <option value="">All Statuses</option>
                                    <option value="New">New</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Final">Final</option>
                                </FilterSelect>
                                <FilterSelect label="Patient Type" name="patientType" value={searchParams.patientType} onChange={handleChange}>
                                    <option value="">All Types</option>
                                    <option value="OP">OP — Outpatient</option>
                                    <option value="IP">IP — Inpatient</option>
                                </FilterSelect>
                                <FilterSelect label="Radiologist" disabled>
                                    <option value="">Unavailable</option>
                                </FilterSelect>
                                <FilterInput label="From Date" required type="date" name="fromDate" value={searchParams.fromDate} max={today} onChange={handleChange} />
                                <FilterInput label="To Date" required type="date" name="toDate" value={searchParams.toDate} min={searchParams.fromDate} max={today} onChange={handleChange} />
                            </div>

                            <div className="flex items-center gap-3 mt-5 flex-wrap">
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
                    {!loading && patients.length > 0 && (
                        <div
                            className="px-5 py-2 flex items-center gap-1.5 text-xs"
                            style={{ borderBottom: '1px solid #f1f5f9', color: '#94a3b8', background: '#fff' }}
                        >
                            Showing page <span className="font-bold text-slate-600 mx-0.5">{currentPage}</span> of
                            <span className="font-bold text-slate-600 mx-0.5">{totalPages}</span> —
                            <span className="font-bold text-slate-700 mx-0.5">{totalCount.toLocaleString()}</span> total records
                        </div>
                    )}

                    {/* ── Table ──────────────────────────────────────────── */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr style={{ background: '#334155' }}>
                                    {TH.map(th => (
                                        <th
                                            key={th}
                                            className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider"
                                            style={{ color: '#94a3b8', whiteSpace: 'nowrap' }}
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
                                            <td className="px-4 py-3 text-xs font-medium" style={{ color: '#cbd5e1' }}>
                                                {(currentPage - 1) * 100 + idx + 1}
                                            </td>
                                            {/* MRN */}
                                            <td className="px-4 py-3 font-mono text-xs font-bold" style={{ color: '#2563eb' }}>
                                                {row.mrn}
                                            </td>
                                            {/* Name */}
                                            <td className="px-4 py-3 font-semibold text-sm" style={{ color: '#1e293b' }}>
                                                {row.name}
                                            </td>
                                            {/* Study */}
                                            <td className="px-4 py-3 text-xs" style={{ color: '#64748b', maxWidth: '220px' }}>
                                                {row.study_description}
                                            </td>
                                            {/* Modality */}
                                            <td className="px-4 py-3 text-center">
                                                <span
                                                    className="px-2 py-1 rounded font-mono text-xs font-bold"
                                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569' }}
                                                >
                                                    {row.modality}
                                                </span>
                                            </td>
                                            {/* Patient Type */}
                                            <td className="px-4 py-3 text-center">
                                                <TypeBadge type={row.patient_type} />
                                            </td>
                                            {/* Date */}
                                            <td className="px-4 py-3 text-center text-xs font-medium" style={{ color: '#94a3b8' }}>
                                                {row.exam_date}
                                            </td>
                                            {/* Status */}
                                            <td className="px-4 py-3 text-center">
                                                <StatusBadge status={row.service_status} />
                                            </td>
                                            {/* Action */}
                                            <td className="px-4 py-3">
                                                {row.report_path ? (
                                                    <div className="flex items-center gap-2 justify-center">
                                                        <a
                                                            href={`/api/reports/view/?path=${encodeURIComponent(row.report_path)}&token=${localStorage.getItem('token')}`}
                                                            target="_blank" rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all duration-150"
                                                            style={{ background: '#2563eb', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; }}
                                                        >
                                                            <Eye size={12} /> View
                                                        </a>
                                                        <a
                                                            href={`/api/reports/view/?path=${encodeURIComponent(row.report_path)}&token=${localStorage.getItem('token')}`}
                                                            download={`report_${row.mrn}.pdf`}
                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                                                            style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#475569' }}
                                                            onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; }}
                                                        >
                                                            <Download size={12} /> PDF
                                                        </a>
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

                    {/* ── Pagination ──────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div
                            className="flex justify-between items-center px-5 py-3"
                            style={{ borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}
                        >
                            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                                Page <span className="font-bold text-slate-600">{currentPage}</span> of{' '}
                                <span className="font-bold text-slate-600">{totalPages}</span>
                            </span>
                            <div className="flex gap-2">
                                {[
                                    { label: 'Previous', Icon: ChevronLeft, disabled: currentPage === 1, dir: -1 },
                                    { label: 'Next', Icon: ChevronRight, disabled: currentPage === totalPages, dir: 1 },
                                ].map(({ label, Icon, disabled, dir }) => (
                                    <button
                                        key={label}
                                        onClick={() => fetchPatients(searchParams, currentPage + dir)}
                                        disabled={disabled}
                                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#475569' }}
                                        onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = '#f1f5f9'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = '#fff'; }}
                                    >
                                        {dir === -1 && <Icon size={14} />}{label}{dir === 1 && <Icon size={14} />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
}
