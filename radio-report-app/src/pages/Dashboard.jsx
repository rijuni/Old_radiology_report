import React, { useState, useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User as UserIcon, X } from 'lucide-react';

const MOCK_PATIENTS = [
    { name: 'Ramesh Kumar', id: 'MRN123', accession: 'ACC001', modality: 'CT', date: '2024-01-12', status: 'Final', type: 'OP', radiologist: 'Dr. Smith' },
    { name: 'Sita Devi', id: 'MRN124', accession: 'ACC002', modality: 'US', date: '2024-01-13', status: 'Draft', type: 'IP', radiologist: 'Dr. Doe' },
    { name: 'John Doe', id: 'MRN125', accession: 'ACC003', modality: 'MRI', date: '2024-01-14', status: 'New', type: 'OP', radiologist: 'Dr. Smith' },
];

export default function Dashboard() {
    const navigate = useNavigate();
    const userName = localStorage.getItem('userName') || 'Doctor';
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userName');
        navigate('/login');
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [searchParams, setSearchParams] = useState({
        name: '',
        id: '',
        modality: '',
        study: '', // Added Study
        serviceStatus: '',
        patientType: '',
        radiologist: '',
        accessionNo: '',
        fromDate: '',
        toDate: '',
    });

    const [filteredPatients, setFilteredPatients] = useState(MOCK_PATIENTS);
    const [error, setError] = useState('');

    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setSearchParams(prev => ({
            ...prev,
            fromDate: today,
            toDate: today
        }));
    }, []);

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
        const missing = [];
        if (!searchParams.id) missing.push("Patient ID");
        if (!searchParams.fromDate) missing.push("From Date");
        if (!searchParams.toDate) missing.push("To Date");

        if (missing.length > 0) {
            setError("Please enter the mandatory field(s): " + missing.join(", "));
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

        const results = MOCK_PATIENTS.filter(p => {
            if (searchParams.name && !p.name.toLowerCase().includes(searchParams.name.toLowerCase())) return false;
            if (searchParams.id && !p.id.toLowerCase().includes(searchParams.id.toLowerCase())) return false;
            if (searchParams.modality && p.modality !== searchParams.modality) return false;
            if (searchParams.serviceStatus && p.status !== searchParams.serviceStatus) return false;
            if (searchParams.patientType && p.type !== searchParams.patientType) return false;
            if (searchParams.accessionNo && !p.accession.toLowerCase().includes(searchParams.accessionNo.toLowerCase())) return false;
            // Added simple Study filter (mock logic since no study field exists in mock data yet)
            // Ideally we check p.study vs searchParams.study
            // For now, if study is entered, we just don't filter it hard unless mock data has it.

            const pDate = new Date(p.date);
            const fromD = new Date(searchParams.fromDate);
            const toD = new Date(searchParams.toDate);

            if (pDate < fromD || pDate > toD) return false;

            return true;
        });

        setFilteredPatients(results);
    };

    const handleReset = () => {
        const today = new Date().toISOString().split('T')[0];
        setSearchParams({
            name: '',
            id: '',
            modality: '',
            study: '', // Added Study
            serviceStatus: '',
            patientType: '',
            radiologist: '',
            accessionNo: '',
            fromDate: today,
            toDate: today,
        });
        setFilteredPatients(MOCK_PATIENTS);
        setError('');
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="flex flex-col min-h-screen">
            <Header />

            <main className="flex-1 pb-20 px-4">
                {/* Navigation Bar (Between Red Line and Yellow Box) */}
                <div className="py-2 flex justify-start relative z-40" ref={menuRef}>
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-1.5 rounded-md bg-white border border-teal-200 hover:bg-teal-50 text-teal-700 shadow-sm transition-colors"
                        title="Menu"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 bg-teal-50 border-b border-teal-100">
                                <div className="flex items-center gap-2 text-teal-800 font-bold mb-1">
                                    <UserIcon size={16} />
                                    <span>{userName}</span>
                                </div>
                                <p className="text-xs text-teal-600">Logged In</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left px-4 py-2.5 text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors text-sm font-medium"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </div>
                    )}
                </div>

                <section className="bg-brand-search-bg p-5 w-full rounded-lg mb-12 shadow-sm relative">

                    {/* Search Box */}
                    <div className="bg-brand-search-inner p-4 rounded mb-5 border border-blue-200">
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <label className="font-bold whitespace-nowrap">Modality :</label>
                                <select
                                    name="modality"
                                    value={searchParams.modality}
                                    onChange={handleChange}
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
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
                                    className="p-1.5 w-44 border border-gray-300 rounded"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center gap-5 my-4">
                        <button
                            onClick={handleSearch}
                            className="bg-brand-btn text-white px-6 py-2 rounded shadow hover:bg-brand-btn-hover transition-colors font-semibold"
                        >
                            Search
                        </button>
                        <button
                            onClick={handleReset}
                            className="bg-brand-btn text-white px-6 py-2 rounded shadow hover:bg-brand-btn-hover transition-colors font-semibold"
                        >
                            Reset
                        </button>
                    </div>

                    {error && (
                        <p className="text-red-600 font-bold text-center animate-pulse mb-4">{error}</p>
                    )}

                    <div className="overflow-x-auto border rounded shadow-sm">
                        <table className="w-full border-collapse bg-white">
                            <thead>
                                <tr className="bg-brand-th text-white">
                                    <th className="border p-2 text-left">Patient Name</th>
                                    <th className="border p-2 text-left">Patient ID</th>
                                    <th className="border p-2 text-left">Accession No</th>
                                    <th className="border p-2 text-center">Modality</th>
                                    <th className="border p-2 text-center">Date</th>
                                    <th className="border p-2 text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.length > 0 ? (
                                    filteredPatients.map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="border p-2">{row.name}</td>
                                            <td className="border p-2">{row.id}</td>
                                            <td className="border p-2">{row.accession}</td>
                                            <td className="border p-2 text-center">{row.modality}</td>
                                            <td className="border p-2 text-center">{row.date}</td>
                                            <td className="border p-2 text-center">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${row.status === 'Final' ? 'bg-green-100 text-green-700' :
                                                    row.status === 'Draft' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-blue-100 text-blue-700'
                                                    }`}>
                                                    {row.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="p-4 text-center text-gray-500">No records found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                </section>
            </main>

            <Footer />
        </div>
    );
}
