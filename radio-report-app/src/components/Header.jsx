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

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            const session_id = localStorage.getItem('session_id');
            if (token) {
                await fetch('/api/logout/', {
                    method: 'POST',
                    headers: { 
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ session_id })
                });
            }
        } catch (err) {
            console.error("Logout notification failed:", err);
        }
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
        <header className="sticky top-0 z-50 w-full shadow-sm">
            {/* ── Main Nav ──────────────────────────────────────────────── */}
            <nav
                style={{
                    background: '#1e293b',
                    borderBottom: '1px solid #0f172a',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
            >
                <div className="w-full h-14 flex items-center justify-end px-4 relative">

                    {/* Top-left corner logo */}
                    <div
                        className="absolute top-0 left-0 h-14 flex items-center pl-2 cursor-pointer"
                        onClick={() => navigate('/dashboard')}
                        title="Go to Dashboard"
                        style={{ transition: 'opacity 0.2s' }}
                        onMouseEnter={e => {
                            e.currentTarget.querySelector('img').style.transform = 'scale(1.07)';
                            e.currentTarget.querySelector('img').style.boxShadow = '0 0 14px rgba(255,255,255,0.25)';
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.querySelector('img').style.transform = 'scale(1)';
                            e.currentTarget.querySelector('img').style.boxShadow = 'none';
                        }}
                    >
                        <img
                            src="/image/kims_logo.png"
                            alt="KIMS"
                            className="h-9 w-auto rounded"
                            style={{
                                background: 'rgba(255,255,255,0.9)',
                                padding: '2px 6px',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                            }}
                        />
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
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(139,92,246,0.32)';
                                    e.currentTarget.style.border = '1px solid rgba(139,92,246,0.6)';
                                    e.currentTarget.style.color = '#ede9fe';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(139,92,246,0.3)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(139,92,246,0.15)';
                                    e.currentTarget.style.border = '1px solid rgba(139,92,246,0.3)';
                                    e.currentTarget.style.color = '#c4b5fd';
                                    e.currentTarget.style.transform = 'none';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
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
                                    background: dropdownOpen ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)',
                                    border: dropdownOpen ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(255,255,255,0.1)',
                                    transition: 'all 0.2s ease',
                                }}
                                onMouseEnter={e => {
                                    if (!dropdownOpen) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.13)';
                                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
                                        e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.25)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        const avatar = e.currentTarget.querySelector('.user-avatar');
                                        if (avatar) avatar.style.background = '#64748b';
                                    }
                                }}
                                onMouseLeave={e => {
                                    if (!dropdownOpen) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                        e.currentTarget.style.border = '1px solid rgba(255,255,255,0.1)';
                                        e.currentTarget.style.boxShadow = 'none';
                                        e.currentTarget.style.transform = 'none';
                                        const avatar = e.currentTarget.querySelector('.user-avatar');
                                        if (avatar) avatar.style.background = '#475569';
                                    }
                                }}
                            >
                                {/* Avatar */}
                                <div
                                    className="user-avatar w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                                    style={{ background: '#475569', color: '#f1f5f9', transition: 'background 0.2s' }}
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
                <div
                    className="px-5 py-1.5 flex items-center justify-center gap-2"
                    style={{ animation: 'blinkAlert 1.2s infinite' }}
                >
                    <AlertTriangle size={13} style={{ color: '#d97706', flexShrink: 0 }} />
                    <p className="text-xs font-medium" style={{ color: '#92400e' }}>
                        Only Old Radiology Report Available for Viewing (Jan,2022 - March,2025)
                    </p>
                </div>

                <style>
                    {`
                    @keyframes blinkAlert {
                        0% { opacity: 1; }
                        50% { opacity: 0.3; }
                        100% { opacity: 1; }
                    }
                    `}
                </style>
            </div>
        </header>
    );
}
