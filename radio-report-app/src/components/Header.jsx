import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User as UserIcon, ChevronDown } from 'lucide-react';

export default function Header() {
    const [user, setUser] = useState({ name: '', id: '' });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const name = localStorage.getItem('userFullName') || localStorage.getItem('userName') || 'Doctor';
        const id = localStorage.getItem('employeeId') || '';
        setUser({ name, id });
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userName');
        localStorage.removeItem('userFullName');
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('employeeId');
        navigate('/login');
    };

    return (
        <header>
            <div className="flex justify-between items-center px-6 py-2 bg-green-200/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.1)] relative z-50 border-b border-white/20">
                {/* Left Side: KIMS Logo */}
                <div className="flex items-center">
                    <Link to="/dashboard" className="transform hover:scale-105 transition-transform duration-200 drop-shadow-md">
                        <img src="/image/kims_logo.png" alt="KIMS Logo" className="w-[140px]" />
                    </Link>
                </div>

                {/* Right Side: User Info & Radiology Logo */}
                <div className="flex items-center gap-4">
                    {/* User Details with Dropdown */}
                    <div className="relative" ref={dropdownRef}>
                        <div
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex flex-col items-end mr-3 transform hover:scale-105 transition-transform duration-200 drop-shadow-md cursor-pointer group"
                        >
                            <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0 group-hover:text-gray-700">Welcome</span>
                            <div className="flex items-center gap-1">
                                <span className="text-teal-900 font-extrabold text-base tracking-tight leading-none group-hover:text-teal-700">{user.name}</span>
                                <ChevronDown
                                    size={16}
                                    className={`text-teal-900 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                                />
                            </div>
                        </div>

                        {/* Dropdown Menu */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 z-[100]">
                                <div className="p-3 bg-teal-50 border-b border-teal-100">
                                    <div className="flex items-center gap-2 text-teal-800 font-bold mb-1">
                                        <UserIcon size={16} />
                                        <span>{user.name}</span>
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
                </div>
            </div>

            <div className="text-center font-bold p-1.5 bg-gradient-to-r from-red-100 via-brand-alert-bg to-red-100 text-brand-alert-text animate-blink text-sm shadow-inner tracking-wide border-b border-red-200">
                ⚠ Only Older Reports are Available for Viewing
            </div>
        </header>
    );
}
