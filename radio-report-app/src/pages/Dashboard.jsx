import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';



export default function Dashboard() {
    const navigate = useNavigate();
    const [patients, setPatients] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCount, setTotalCount] = useState(0);

    // Auth check
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const [searchParams, setSearchParams] = useState({
        name: '',
        id: '', // MRN
        modality: '',
        study: '', // Added Study
        serviceStatus: '',
        patientType: '',
        radiologist: '',
        accessionNo: '',
        fromDate: '',
        toDate: '',
    });

    const [error, setError] = useState('');

    useEffect(() => {
        // on Load: fetch first page of patients
        fetchPatients({}, 1);
    }, []);

    const fetchPatients = async (filters, page = 1) => {
        setLoading(true);
        setError('');
        try {
            const token = localStorage.getItem('token');
            const query = new URLSearchParams();
            query.append('page', page);

            if (filters.id) {
                // If ID is provided, prioritize it and ignore date constraints to find history.
                query.append('id', filters.id);
            } else {
                // If no ID, apply all other filters including dates
                Object.entries(filters).forEach(([key, value]) => {
                    if (value && key !== 'id') { // Skip ID as it's empty
                        if (key === 'serviceStatus') query.append('service_status', value);
                        else if (key === 'patientType') query.append('patient_type', value);
                        else query.append(key, value);
                    }
                });
            }

            const response = await fetch(`http://127.0.0.1:8000/api/patients/?${query.toString()}`, {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                handleLogout();
                return;
            }

            if (!response.ok) throw new Error('Failed to fetch data');

            const data = await response.json();
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
                const newData = { ...prev, [name]: value };
                if (newData.toDate && newData.toDate < value) {
                    newData.toDate = value;
                }
                return newData;
            });
        } else {
            setSearchParams(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateSearch = () => {
        // Rule: If Patient ID is present, we can search.
        // If no ID, we MUST have both From Date and To Date.

        if (searchParams.id) {
            return true;
        }

        if (!searchParams.fromDate || !searchParams.toDate) {
            setError("Please provide either a Patient ID OR a valid Date Range.");
            return false;
        }

        const fromD = new Date(searchParams.fromDate);
        const toD = new Date(searchParams.toDate);

        if (fromD > toD) {
            setError("From Date cannot be later than To Date.");
            return false;
        }
        return true;
    };

    const handleSearch = () => {
        if (!validateSearch()) return;
        fetchPatients(searchParams, 1);
    };

    const handleReset = () => {
        const today = new Date().toISOString().split('T')[0];
        const defaults = {
            name: '',
            id: '',
            modality: '',
            study: '',
            serviceStatus: '',
            patientType: '',
            radiologist: '',
            accessionNo: '',
            fromDate: today,
            toDate: today,
        };
        setSearchParams(defaults);
        fetchPatients(defaults, 1);
        setError('');
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pb-20 px-4">
                <section className="bg-white/80 backdrop-blur-md p-8 w-full rounded-3xl mb-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] relative border border-white/60 mt-6">

                    {/* Search Box with 3D inset look */}
                    <div className="bg-gradient-to-b from-slate-50 to-slate-100 p-2 rounded-2xl mb-8 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] border border-slate-200/60">
                        {/* Row 1 */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Patient Name :</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={searchParams.name}
                                    onChange={handleChange}
                                    placeholder="Patient Name"
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap flex items-center gap-1">
                                    Patient ID :<span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="id"
                                    value={searchParams.id}
                                    onChange={handleChange}
                                    placeholder="Enter MRN"
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Modality :</label>
                                <select
                                    name="modality"
                                    value={searchParams.modality}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                >
                                    <option value="">All</option>
                                    <option value="CR">CR</option>
                                    <option value="US">US</option>
                                    <option value="CT">CT</option>
                                    <option value="MR">MR</option>
                                    <option value="MG">MG</option>
                                    <option value="ECG">ECG</option>
                                    <option value="NM">NM</option>
                                    <option value="DX">DX</option>
                                    <option value="PT">PT</option>
                                </select>
                            </div>

                            {/* New Study Field */}
                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Study :</label>
                                <input
                                    type="text"
                                    name="study"
                                    value={searchParams.study}
                                    onChange={handleChange}
                                    placeholder="Study Description"
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>
                        </div>

                        {/* Row 2 */}
                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Service Status :</label>
                                <select
                                    name="serviceStatus"
                                    value={searchParams.serviceStatus}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                >
                                    <option value="">Select</option>
                                    <option value="New">New</option>
                                    <option value="Draft">Draft</option>
                                    <option value="Final">Final</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Patient Type :</label>
                                <select
                                    name="patientType"
                                    value={searchParams.patientType}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                >
                                    <option value="">Select</option>
                                    <option value="OP">OP</option>
                                    <option value="IP">IP</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Radiologist :</label>
                                <select
                                    name="radiologist"
                                    value={searchParams.radiologist}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                >
                                    <option value="">Select</option>
                                    <option value="Dr. Smith">Dr. Smith</option>
                                    <option value="Dr. Doe">Dr. Doe</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 3 */}
                        <div className="flex flex-wrap gap-4">
                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Accession No :</label>
                                <input
                                    type="text"
                                    name="accessionNo"
                                    value={searchParams.accessionNo}
                                    onChange={handleChange}
                                    placeholder="Accession No"
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap flex items-center gap-1">
                                    From Date <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="fromDate"
                                    value={searchParams.fromDate}
                                    max={today}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap flex items-center gap-1">
                                    To Date <span className="text-red-500 font-bold">*</span>
                                </label>
                                <input
                                    type="date"
                                    name="toDate"
                                    value={searchParams.toDate}
                                    min={searchParams.fromDate}
                                    max={today}
                                    onChange={handleChange}
                                    className="p-2.5 w-44 border border-slate-200 rounded-xl shadow-[0_4px_10px_rgba(0,0,0,0.03)] focus:shadow-[0_0_0_4px_rgba(13,148,136,0.1)] focus:border-teal-500 transition-all outline-none bg-white font-medium text-slate-700"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-8 my-3">
                        <button
                            onClick={handleSearch}
                            className="bg-gradient-to-r from-teal-600 to-teal-500 text-white px-10 py-3 rounded-xl shadow-[0_8px_10px_-6px_rgba(13,148,136,0.4)] hover:shadow-[0_12px_25px_-8px_rgba(13,148,136,0.5)] hover:-translate-y-0.5 active:translate-y-0 active:shadow-none transition-all duration-200 font-bold tracking-wide text-sm border-t border-white/20"
                        >
                            Search
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-white text-slate-600 px-10 py-3 rounded-xl shadow-[0_4px_15px_-3px_rgba(0,0,0,0.07)] hover:bg-slate-50 hover:text-slate-800 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 font-bold tracking-wide text-sm border border-slate-200"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-600 font-bold text-center animate-pulse mb-4">{error}</p>
                    )}

                    <div className="overflow-hidden rounded-2xl shadow-xl border border-slate-100 bg-white">
                        <table className="w-full border-collapse bg-white">
                            <thead>
                                <tr className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white shadow-md">
                                    <th className="border p-2 text-left">Sl No</th>
                                    <th className="border p-2 text-left">Patient ID</th>
                                    <th className="p-3 text-left font-bold tracking-wide">Patient Name</th>
                                    <th className="border p-2 text-left">Study Description</th>
                                    <th className="border p-2 text-center">Modality</th>
                                    <th className="border p-2 text-center">Date</th>
                                    <th className="border p-2 text-center">Status</th>
                                    <th className="border p-2 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="p-8 text-center text-gray-500 font-medium animate-pulse">
                                            Loading patient records...
                                        </td>
                                    </tr>
                                ) : patients.length > 0 ? (
                                    patients.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border p-2">{(currentPage - 1) * 100 + idx + 1}</td>
                                            <td className="border p-2">{row.mrn}</td>
                                            <td className="border p-2">{row.name}</td>
                                            <td className="border p-2">{row.study_description}</td>
                                            <td className="border p-2 text-center">{row.modality}</td>
                                            <td className="border p-2 text-center">{row.exam_date}</td>
                                            <td className="border p-2 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.service_status === 'Final' ? 'bg-green-100 text-green-700' :
                                                    row.service_status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {row.service_status}
                                                </span>
                                            </td>
                                            <td className="border p-2 text-center">
                                                {row.report_url ? (
                                                    <a
                                                        href={row.report_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-teal-500 text-white rounded-lg shadow hover:shadow-lg hover:-translate-y-0.5 transition-all text-xs font-bold w-[130px] justify-center"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        Download Report
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-400 text-sm font-semibold italic">No Reports</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="p-4 text-center text-gray-500">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-6 px-4">
                            <div className="text-sm text-gray-600">
                                Showing page {currentPage} of {totalPages} ({totalCount.toLocaleString()} total records)
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchPatients(searchParams, currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => fetchPatients(searchParams, currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-teal-600 text-white rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-teal-700 transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                </section>
            </main>

            <Footer />
        </div>
    );
}
