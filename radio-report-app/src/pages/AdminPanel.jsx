import React, { useState, useEffect, useCallback } from 'react';
import { User, Shield, Key, Plus, X, ChevronLeft, Trash2, AlertCircle, CheckCircle, Clock, Globe, List, RotateCw, Lock, Unlock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);

    const ok = type === 'success';
    return (
        <div
            className="fixed top-5 right-5 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-xl"
            style={{
                background: '#fff',
                border: `1.5px solid ${ok ? '#86efac' : '#fca5a5'}`,
                minWidth: '280px',
                animation: 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
                boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
            }}
        >
            <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: ok ? '#dcfce7' : '#fee2e2' }}
            >
                {ok
                    ? <CheckCircle size={17} style={{ color: '#16a34a' }} />
                    : <AlertCircle size={17} style={{ color: '#ef4444' }} />
                }
            </div>
            <p className="text-sm font-semibold flex-1" style={{ color: ok ? '#15803d' : '#dc2626' }}>
                {message}
            </p>
            <button onClick={onClose} style={{ color: '#cbd5e1' }} onMouseEnter={e => e.currentTarget.style.color = '#64748b'} onMouseLeave={e => e.currentTarget.style.color = '#cbd5e1'}>
                <X size={15} />
            </button>
        </div>
    );
}

// ── Modal Input ───────────────────────────────────────────────────────────────
function ModalInput({ label, ...props }) {
    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#64748b' }}>
                {label}
            </label>
            <input
                {...props}
                className="input-slate"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
            />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminPanel() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [view, setView] = useState('users'); // 'users' or 'sessions'
    const [sessions, setSessions] = useState([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const [toast, setToast] = useState(null);
    const showToast = useCallback((msg, type = 'success') => setToast({ msg, type }), []);
    const hideToast = useCallback(() => setToast(null), []);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', password: '', first_name: '', last_name: '', is_staff: false });
    const [createError, setCreateError] = useState('');

    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetError, setResetError] = useState('');

    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const r = await fetch('/api/users/', { headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } });
            if (r.ok) setUsers(await r.json());
            else setError('Failed to fetch users');
        } catch { setError('Network error'); }
        finally { setLoading(false); }
    };

    const fetchSessions = async () => {
        setSessionsLoading(true);
        try {
            const r = await fetch('/api/sessions/', { headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' } });
            if (r.ok) setSessions(await r.json());
            else showToast('Failed to fetch session logs', 'error');
        } catch { showToast('Network error while fetching sessions', 'error'); }
        finally { setSessionsLoading(false); }
    };

    useEffect(() => { 
        if (view === 'users') {
            fetchUsers();
            return;
        }

        // Initial fetch for sessions
        fetchSessions();

        // Auto-refresh sessions every 30 seconds
        const interval = setInterval(fetchSessions, 30000);
        return () => clearInterval(interval);
    }, [view]);

    const handleCreateUser = async (e) => {
        e.preventDefault(); setCreateError('');
        try {
            const r = await fetch('/api/users/', {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser),
            });
            if (r.ok) {
                setShowCreateModal(false);
                setNewUser({ username: '', password: '', first_name: '', last_name: '', is_staff: false });
                fetchUsers();
            } else {
                const d = await r.json();
                setCreateError(d.username ? `Username: ${d.username[0]}` : 'Failed to create user');
            }
        } catch { setCreateError('Network error'); }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault(); setResetError('');
        try {
            const r = await fetch(`/api/users/${selectedUser.id}/set_password/`, {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword }),
            });
            if (r.ok) {
                setShowResetModal(false); setSelectedUser(null); setNewPassword('');
                showToast(`Password for ${selectedUser.first_name} reset successfully!`);
            } else setResetError('Failed to reset password');
        } catch { setResetError('Network error'); }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Remove user "${username}"? This cannot be undone.`)) return;
        try {
            const r = await fetch(`/api/users/${userId}/`, { method: 'DELETE', headers: { 'Authorization': `Token ${token}` } });
            if (r.ok) fetchUsers();
            else setError('Failed to delete user');
        } catch { setError('Network error'); }
    };

    const handleToggleStatus = async (user) => {
        const action = user.is_active ? 'Block' : 'Unblock';
        if (!window.confirm(`${action} user "${user.username}"?`)) return;
        
        try {
            const r = await fetch(`/api/users/${user.id}/toggle_status/`, {
                method: 'POST',
                headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' }
            });
            if (r.ok) {
                showToast(`User ${user.username} ${user.is_active ? 'blocked' : 'unblocked'} successfully`);
                fetchUsers();
            } else showToast('Failed to update user status', 'error');
        } catch { showToast('Network error', 'error'); }
    };

    if (loading && users.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: '#f1f5f9' }}>
                <div className="flex flex-col items-center gap-3">
                    <svg className="animate-spin w-9 h-9" style={{ color: '#475569' }} fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Loading users…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4 md:px-8" style={{ background: '#f1f5f9', animation: 'fadeIn 0.4s ease-out' }}>
            {toast && <Toast message={toast.msg} type={toast.type} onClose={hideToast} />}

            <div className="max-w-5xl mx-auto">

                {/* Page Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-150"
                            style={{ background: '#fff', border: '1.5px solid #e2e8f0', color: '#64748b' }}
                            onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                            onMouseLeave={e => e.currentTarget.style.background = '#fff'}
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <div>
                            <h1 className="text-xl font-extrabold flex items-center gap-2.5" style={{ color: '#0f172a' }}>
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: '#f3f0ff', border: '1px solid #e9d5ff' }}
                                >
                                    <Shield size={16} style={{ color: '#7c3aed' }} />
                                </div>
                                Admin User Management
                            </h1>
                            <p className="text-xs mt-1" style={{ color: '#94a3b8' }}>
                                Manage staff and monitor system usage logs.
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Refresh Button for Sessions */}
                        {view === 'sessions' && (
                            <button
                                onClick={fetchSessions}
                                disabled={sessionsLoading}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={{ 
                                    background: '#fff', 
                                    border: '1.5px solid #e2e8f0', 
                                    color: '#64748b',
                                    opacity: sessionsLoading ? 0.7 : 1
                                }}
                                onMouseEnter={e => !sessionsLoading && (e.currentTarget.style.background = '#f8fafc')}
                                onMouseLeave={e => !sessionsLoading && (e.currentTarget.style.background = '#fff')}
                            >
                                <RotateCw size={14} className={sessionsLoading ? 'animate-spin' : ''} />
                                {sessionsLoading ? 'Refreshing...' : 'Refresh'}
                            </button>
                        )}

                        {/* Tab Switcher */}
                        <div className="flex p-1 rounded-xl bg-white border border-slate-200 mr-2 shadow-sm">
                            <button
                                onClick={() => setView('users')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: view === 'users' ? '#1e293b' : 'transparent',
                                    color: view === 'users' ? '#fff' : '#64748b',
                                }}
                            >
                                <User size={14} /> Users
                            </button>
                            <button
                                onClick={() => setView('sessions')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                style={{
                                    background: view === 'sessions' ? '#1e293b' : 'transparent',
                                    color: view === 'sessions' ? '#fff' : '#64748b',
                                }}
                            >
                                <Clock size={14} /> Sessions
                            </button>
                        </div>

                        {view === 'users' && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-white transition-all duration-150"
                                style={{ background: '#1e293b', boxShadow: '0 2px 8px rgba(30,41,59,0.25)' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                            >
                                <Plus size={15} /> Create Account
                            </button>
                        )}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-center gap-2.5 p-3.5 rounded-xl mb-5 text-sm"
                        style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', animation: 'slideUp 0.2s ease-out' }}>
                        <AlertCircle size={15} className="shrink-0" /> {error}
                    </div>
                )}

                {/* Content Table */}
                <div
                    className="rounded-2xl overflow-hidden"
                    style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
                >
                    {view === 'users' ? (
                        <table className="w-full text-sm">
                            <thead>
                                <tr style={{ background: '#334155', borderBottom: '1px solid #475569' }}>
                                    {['User ID', 'Full Name', 'Role', 'Status', 'Actions'].map((h, i) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                                            style={{ color: '#94a3b8', textAlign: i === 4 ? 'right' : 'left' }}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, idx) => (
                                    <tr
                                        key={user.id}
                                        style={{
                                            background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                            borderBottom: '1px solid #f1f5f9',
                                            transition: 'background 0.12s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                                        onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                    >
                                        <td className="px-5 py-3.5 font-mono text-xs font-bold" style={{ color: '#2563eb' }}>
                                            {user.username}
                                        </td>
                                        <td className="px-5 py-3.5 font-semibold" style={{ color: '#1e293b' }}>
                                            {user.first_name} {user.last_name}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {user.is_staff ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                                                    style={{ background: '#f3f0ff', border: '1px solid #e9d5ff', color: '#7c3aed' }}>
                                                    <Shield size={11} /> Admin
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                                                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#64748b' }}>
                                                    <User size={11} /> Standard
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            {user.is_active ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                    style={{ background: '#dcfce7', border: '1px solid #86efac', color: '#15803d' }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                                                    style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626' }}>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Blocked
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                                                    style={{ 
                                                        background: user.is_active ? '#fff7ed' : '#f0fdf4', 
                                                        border: `1.5px solid ${user.is_active ? '#ffedd5' : '#dcfce7'}`, 
                                                        color: user.is_active ? '#9a3412' : '#166534' 
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = user.is_active ? '#ffedd5' : '#dcfce7'}
                                                    onMouseLeave={e => e.currentTarget.style.background = user.is_active ? '#fff7ed' : '#f0fdf4'}
                                                >
                                                    {user.is_active ? <Lock size={11} /> : <Unlock size={11} />}
                                                    {user.is_active ? 'Block' : 'Unblock'}
                                                </button>
                                                <button
                                                    onClick={() => { setSelectedUser(user); setShowResetModal(true); }}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                                                    style={{ background: '#eff6ff', border: '1.5px solid #bfdbfe', color: '#2563eb' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                                                >
                                                    <Key size={11} /> Reset
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteUser(user.id, user.username)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150"
                                                    style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#ef4444' }}
                                                    onMouseEnter={e => e.currentTarget.style.background = '#fee2e2'}
                                                    onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                                                >
                                                    <Trash2 size={11} /> Remove
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr style={{ background: '#334155', borderBottom: '1px solid #475569' }}>
                                        {['User', 'IP Address', 'Login Time', 'Logout Time', 'Duration'].map((h, i) => (
                                            <th
                                                key={h}
                                                className="px-5 py-3.5 text-xs font-bold uppercase tracking-wider"
                                                style={{ color: '#94a3b8', textAlign: 'left' }}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {sessionsLoading ? (
                                        [...Array(5)].map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                {[...Array(5)].map((_, j) => (
                                                    <td key={j} className="px-5 py-4"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
                                                ))}
                                            </tr>
                                        ))
                                    ) : sessions.map((session, idx) => (
                                        <tr
                                            key={session.id}
                                            style={{
                                                background: idx % 2 === 0 ? '#ffffff' : '#f8fafc',
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'background 0.12s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9ff'}
                                            onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? '#ffffff' : '#f8fafc'}
                                        >
                                            <td className="px-5 py-3.5">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-800">{session.full_name}</span>
                                                    <span className="text-xs font-mono text-blue-600">{session.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 font-mono text-xs text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Globe size={11} className="text-slate-400" />
                                                    {session.ip_address || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-600">
                                                {new Date(session.login_time).toLocaleString()}
                                            </td>
                                            <td className="px-5 py-3.5 text-xs text-slate-600">
                                                {session.logout_time ? new Date(session.logout_time).toLocaleString() : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-green-50 text-green-700 font-bold border border-green-100">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                        Online
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-5 py-3.5">
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold"
                                                    style={{ 
                                                        background: session.duration_str === 'Active' ? '#f1f5f9' : '#fff', 
                                                        border: '1px solid #e2e8f0',
                                                        color: session.duration_str === 'Active' ? '#64748b' : '#334155' 
                                                    }}>
                                                    <Clock size={11} />
                                                    {session.duration_str}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {((view === 'users' && users.length === 0 && !loading) || (view === 'sessions' && sessions.length === 0 && !sessionsLoading)) && (
                        <div className="py-16 text-center">
                            {view === 'users' ? <User size={32} className="mx-auto mb-2" style={{ color: '#e2e8f0' }} /> : <List size={32} className="mx-auto mb-2" style={{ color: '#e2e8f0' }} />}
                            <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>No results found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Create User Modal ──────────────────────────────────────── */}
            {showCreateModal && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
                    style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div
                        className="w-full max-w-md rounded-2xl overflow-hidden"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideUp 0.25s ease-out' }}
                    >
                        {/* Modal top bar */}
                        <div style={{ height: '3px', background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                <Plus size={16} style={{ color: '#7c3aed' }} /> Create New Account
                            </h3>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: '#94a3b8' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }}>
                                    <AlertCircle size={13} className="shrink-0" /> {createError}
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <ModalInput label="First Name" type="text" required value={newUser.first_name} onChange={e => setNewUser({ ...newUser, first_name: e.target.value })} />
                                <ModalInput label="Last Name" type="text" value={newUser.last_name} onChange={e => setNewUser({ ...newUser, last_name: e.target.value })} />
                            </div>
                            <ModalInput label="Username / Employee ID" type="text" required value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                            <ModalInput label="Temporary Password" type="password" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />

                            {/* Admin toggle */}
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div
                                    className="relative w-10 h-5 rounded-full transition-all duration-200 shrink-0 cursor-pointer"
                                    style={{ background: newUser.is_staff ? '#7c3aed' : '#e2e8f0', boxShadow: newUser.is_staff ? '0 0 10px rgba(124,58,237,0.35)' : 'none' }}
                                    onClick={() => setNewUser({ ...newUser, is_staff: !newUser.is_staff })}
                                >
                                    <div
                                        className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200"
                                        style={{ transform: newUser.is_staff ? 'translateX(20px)' : 'none' }}
                                    />
                                </div>
                                <span className="text-sm font-semibold" style={{ color: newUser.is_staff ? '#7c3aed' : '#94a3b8' }}>
                                    Grant Admin Privileges
                                </span>
                            </label>

                            <button
                                type="submit"
                                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150"
                                style={{ background: '#1e293b', boxShadow: '0 2px 8px rgba(30,41,59,0.2)' }}
                                onMouseEnter={e => e.currentTarget.style.background = '#0f172a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#1e293b'}
                            >
                                Create Account
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ── Reset Password Modal ───────────────────────────────────── */}
            {showResetModal && selectedUser && (
                <div className="fixed inset-0 flex items-center justify-center p-4 z-50"
                    style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', animation: 'fadeIn 0.2s ease-out' }}>
                    <div
                        className="w-full max-w-sm rounded-2xl overflow-hidden"
                        style={{ background: '#fff', border: '1px solid #e2e8f0', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', animation: 'slideUp 0.25s ease-out' }}
                    >
                        <div style={{ height: '3px', background: 'linear-gradient(90deg, #ef4444, #f87171)' }} />
                        <div className="px-6 py-4 flex justify-between items-center" style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <h3 className="text-base font-extrabold flex items-center gap-2" style={{ color: '#0f172a' }}>
                                <Key size={15} style={{ color: '#ef4444' }} /> Reset Password
                            </h3>
                            <button
                                onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword(''); setResetError(''); }}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: '#94a3b8' }}
                                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#334155'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <p className="text-sm" style={{ color: '#64748b' }}>
                                Setting a new password for{' '}
                                <span className="font-bold" style={{ color: '#1e293b' }}>
                                    {selectedUser.first_name} ({selectedUser.username})
                                </span>
                            </p>
                            {resetError && (
                                <div className="flex items-center gap-2 p-3 rounded-xl text-xs font-semibold"
                                    style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444' }}>
                                    <AlertCircle size={13} /> {resetError}
                                </div>
                            )}
                            <ModalInput label="New Password" type="text" required placeholder="Enter new password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />

                            <div className="flex gap-3 pt-1">
                                <button
                                    type="button"
                                    onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword(''); setResetError(''); }}
                                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
                                    style={{ background: '#f1f5f9', border: '1.5px solid #e2e8f0', color: '#64748b' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-150"
                                    style={{ background: '#ef4444', boxShadow: '0 2px 8px rgba(239,68,68,0.25)' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#dc2626'}
                                    onMouseLeave={e => e.currentTarget.style.background = '#ef4444'}
                                >
                                    Reset Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
