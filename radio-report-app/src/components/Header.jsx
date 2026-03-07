import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, Shield, User, AlertTriangle } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const userFullName = localStorage.getItem('userFullName') || 'User';
    const employeeId = localStorage.getItem('employeeId') || '';
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    const initials = userFullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target))
                setDropdownOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <header>
            {/* ── Main Nav ──────────────────────────────────────────────── */}
            <nav
                style={{
                    background: '#1e293b',
                    borderBottom: '1px solid #0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
            >
                <div className="max-w-screen-xl mx-auto px-5 h-14 flex items-center justify-between">

                    {/* Left — Logo + App name */}
                    <div className="flex items-center gap-3">
                        <img
                            src="/image/kims_logo.png"
                            alt="KIMS"
                            className="h-8 w-auto rounded"
                            style={{ background: 'rgba(255,255,255,0.9)', padding: '2px 6px' }}
                        />
                        <div className="hidden sm:block">
                            <p className="text-xs font-bold text-white leading-none tracking-wide">KIMS ICT</p>
                            <p className="text-xs font-medium leading-none mt-0.5" style={{ color: '#94a3b8' }}>
                                Old Radiology Reports
                            </p>
                        </div>
                    </div>

                    {/* Right — Admin + User dropdown */}
                    <div className="flex items-center gap-3">

                        {/* Admin panel link */}
                        {isAdmin && (
                            <button
                                onClick={() => navigate('/admin-panel')}
                                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
                                style={{
                                    background: 'rgba(139,92,246,0.15)',
                                    border: '1px solid rgba(139,92,246,0.3)',
                                    color: '#c4b5fd',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = 'rgba(139,92,246,0.25)'}
                                onMouseLeave={e => e.currentTarget.style.background = 'rgba(139,92,246,0.15)'}
                            >
                                <Shield size={13} /> Admin Panel
                            </button>
                        )}

                        {/* User dropdown */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setDropdownOpen(p => !p)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200"
                                style={{
                                    background: dropdownOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                }}
                                onMouseEnter={e => { if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
                                onMouseLeave={e => { if (!dropdownOpen) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            >
                                {/* Avatar */}
                                <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{ background: '#475569', color: '#f1f5f9' }}
                                >
                                    {initials}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-xs font-semibold text-white leading-none">{userFullName}</p>
                                    <p className="text-xs leading-none mt-0.5" style={{ color: '#64748b' }}>{employeeId}</p>
                                </div>
                                <ChevronDown
                                    size={14}
                                    style={{
                                        color: '#64748b',
                                        transform: dropdownOpen ? 'rotate(180deg)' : 'none',
                                        transition: 'transform 0.2s',
                                    }}
                                />
                            </button>

                            {/* Dropdown menu */}
                            {dropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-52 rounded-xl overflow-hidden z-50"
                                    style={{
                                        background: '#ffffff',
                                        border: '1px solid #e2e8f0',
                                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                                        animation: 'slideUp 0.15s ease-out',
                                    }}
                                >
                                    {/* User info header */}
                                    <div className="px-4 py-3" style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                                        <p className="text-sm font-semibold" style={{ color: '#1e293b' }}>{userFullName}</p>
                                        <p className="text-xs mt-0.5" style={{ color: '#94a3b8' }}>{employeeId}</p>
                                        {isAdmin && (
                                            <span
                                                className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded text-xs font-semibold"
                                                style={{ background: '#f3f0ff', color: '#7c3aed', border: '1px solid #e9d5ff' }}
                                            >
                                                <Shield size={10} /> Administrator
                                            </span>
                                        )}
                                    </div>

                                    {isAdmin && (
                                        <button
                                            onClick={() => { navigate('/admin-panel'); setDropdownOpen(false); }}
                                            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
                                            style={{ color: '#7c3aed' }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#faf5ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <Shield size={14} /> Admin Panel
                                        </button>
                                    )}

                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors"
                                        style={{ color: '#ef4444', borderTop: '1px solid #f1f5f9' }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#fef2f2'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <LogOut size={14} /> Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Alert Banner ──────────────────────────────────────────── */}
            <div
                style={{
                    background: '#fefce8',
                    borderBottom: '1px solid #fde68a',
                }}
            >
                <div className="max-w-screen-xl mx-auto px-5 py-1.5 flex items-center gap-2">
                    <AlertTriangle size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                    <p className="text-xs font-medium" style={{ color: '#92400e' }}>
                        This system is for authorized KIMS personnel only. All access is logged and monitored.
                    </p>
                </div>
            </div>
        </header>
    );
}
