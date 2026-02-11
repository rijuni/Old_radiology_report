import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    const [user, setUser] = useState({ name: '', id: '' });

    useEffect(() => {
        const name = localStorage.getItem('userFullName') || 'Doctor';
        const id = localStorage.getItem('employeeId') || '';
        setUser({ name, id });
    }, []);

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
                    {/* User Details */}
                    {/* User Details */}
                    <div className="flex flex-col items-end mr-3 transform hover:scale-105 transition-transform duration-200 drop-shadow-md cursor-default">
                        <span className="text-gray-500 text-[10px] font-medium uppercase tracking-wider mb-0">Welcome</span>
                        <span className="text-teal-900 font-extrabold text-base tracking-tight leading-none">{user.name}</span>
                    </div>

                    {/* Radiology Logo */}
                    <img src="/image/radiology_logo.png" alt="Radiology" className="w-[80px] h-auto object-contain hidden md:block opacity-90 drop-shadow-sm transform hover:scale-105 transition-transform duration-200" />
                </div>
            </div>

            <div className="text-center font-bold p-1.5 bg-gradient-to-r from-red-100 via-brand-alert-bg to-red-100 text-brand-alert-text animate-blink text-sm shadow-inner tracking-wide border-b border-red-200">
                ⚠ Only Older Reports are Available for Viewing
            </div>
        </header>
    );
}
