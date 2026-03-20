import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Lock, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState(location.state?.message || '');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        if (location.state?.message) {
            setError(location.state.message);
            // Clear location state to prevent message reappearing on refresh
            window.history.replaceState({}, document.title);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            const res = await fetch('/api-token-auth/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await res.json();
            if (res.ok) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('session_id', data.session_id);
                sessionStorage.setItem('isAuthenticated', 'true');
                sessionStorage.setItem('userId', data.user_id);
                sessionStorage.setItem('employeeId', data.username);
                sessionStorage.setItem('isAdmin', data.is_staff);
                const full = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Doctor';
                sessionStorage.setItem('userFullName', full);
                sessionStorage.setItem('userName', full);
                navigate('/dashboard');
            } else {
                setError(data.error || (data.non_field_errors ? data.non_field_errors[0] : 'Invalid credentials. Please try again.'));
            }
        } catch {
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex" style={{ background: '#f1f5f9' }}>

            {/* ── Left Panel — Slate ──────────────────────────────────── */}
            <div
                className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between"
                style={{ background: 'linear-gradient(135deg, #50AFAD 0%, #3d8584 100%)' }}
            >
                {/* Background medical image */}
                <img
                    src="/image/medical_login_bg.png"
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ opacity: 0.6, mixBlendMode: 'luminosity' }}
                />
                {/* Dark overlay gradient for readability */}
                <div
                    className="absolute inset-0"
                    style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.55) 0%, rgba(30,41,59,0.45) 100%)' }}
                />
                {/* Subtle dot grid */}
                <div className="absolute inset-0 dot-grid" style={{ opacity: 0.3 }} />

                {/* Glow orbs */}
                <div className="absolute rounded-full" style={{
                    width: '500px', height: '500px', top: '-20%', left: '-20%',
                    background: 'radial-gradient(circle, rgba(71,85,105,0.3) 0%, transparent 70%)',
                    animation: 'blob 14s ease-in-out infinite',
                }} />
                <div className="absolute rounded-full animation-delay-4000" style={{
                    width: '400px', height: '400px', bottom: '-15%', right: '-10%',
                    background: 'radial-gradient(circle, rgba(100,116,139,0.2) 0%, transparent 70%)',
                    animation: 'blob 16s ease-in-out infinite',
                }} />

                {/* Content */}
                <div className="relative z-10 flex flex-col h-full justify-center px-12">
                    {/* Logo */}
                    <div className="mb-10">
                        <img
                            src="/image/kims_logo.png"
                            alt="KIMS Logo"
                            className="w-[160px] p-3 rounded-xl"
                            style={{ background: 'rgba(255,255,255,0.9)' }}
                        />
                    </div>

                    {/* Badge */}
                    <span
                        className="inline-flex items-center self-start px-3 py-1 rounded-full text-xs font-bold mb-5 uppercase tracking-widest"
                        style={{ background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)', color: '#94a3b8' }}
                    >
                        Radiology Information System
                    </span>

                    <h1 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                        Old Radiology<br />
                        <span style={{ color: '#64748b' }}>Reporting Portal</span>
                    </h1>
                    <p className="text-sm leading-relaxed mb-8" style={{ color: '#475569', maxWidth: '320px' }}>
                        Secure access to archived radiology reports for authorized KIMS clinical staff.
                    </p>

                    {/* Feature pills */}
                    <div className="flex flex-col gap-3">
                        {[
                            { icon: '🔒', text: 'Token-based secure authentication' },
                            { icon: '⚡', text: 'Fast patient record search & filter' },
                            { icon: '📄', text: 'Direct PDF report viewing & download' },
                        ].map(({ icon, text }) => (
                            <div key={text} className="flex items-center gap-3">
                                <span className="text-lg">{icon}</span>
                                <span className="text-xs font-medium" style={{ color: '#64748b' }}>{text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="relative z-10 px-12 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p className="text-xs" style={{ color: '#334155' }}>
                        © 2026 KIMS ICT Cell — For authorized use only
                    </p>
                </div>
            </div>

            {/* ── Right Panel — Form ──────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center p-6" style={{ background: '#f1f5f9' }}>
                <div className="w-full max-w-[400px]" style={{ animation: 'fadeIn 0.5s ease-out' }}>

                    {/* Mobile logo */}
                    <div className="flex justify-center mb-8 lg:hidden">
                        <img src="/image/kims_logo.png" alt="KIMS" className="w-[120px] rounded-lg bg-white p-2 shadow" />
                    </div>

                    {/* Card */}
                    <div
                        className="rounded-2xl overflow-hidden"
                        style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)',
                        }}
                    >
                        {/* Card top accent bar */}
                        <div style={{ height: '4px', background: 'linear-gradient(90deg, #50AFAD, #b5e1e0)' }} />

                        <div className="p-8">
                            {/* Heading */}
                            <div className="mb-7">
                                <h2 className="text-2xl font-extrabold mb-1" style={{ color: '#0f172a' }}>
                                    Sign In
                                </h2>
                                <p className="text-sm" style={{ color: '#94a3b8' }}>
                                    Enter your credentials to access patient reports.
                                </p>
                            </div>

                            {/* Error */}
                            {error && (
                                <div
                                    className="flex items-center gap-2.5 p-3 rounded-xl mb-5 text-sm"
                                    style={{
                                        background: '#fef2f2',
                                        border: '1px solid #fecaca',
                                        color: '#ef4444',
                                        animation: 'slideUp 0.25s ease-out',
                                    }}
                                >
                                    <AlertCircle size={15} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleLogin} className="space-y-5">

                                {/* Username */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#64748b' }}>
                                        Username / Employee ID
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ left: '0.875rem', color: '#94a3b8' }}>
                                            <User size={16} />
                                        </div>
                                        <input
                                            type="text" name="username"
                                            value={formData.username} onChange={handleChange}
                                            placeholder="Enter username"
                                            required
                                            className="input-slate"
                                            style={{ paddingLeft: '2.75rem' }}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{ color: '#64748b' }}>
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ left: '0.875rem', color: '#94a3b8' }}>
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={formData.password} onChange={handleChange}
                                            placeholder="••••••••"
                                            required
                                            className="input-slate"
                                            style={{ paddingLeft: '2.75rem', paddingRight: '3rem' }}
                                        />
                                        <button
                                            type="button"
                                            tabIndex={-1}
                                            onClick={() => setShowPassword(p => !p)}
                                            className="absolute inset-y-0 right-0 flex items-center px-3 transition-colors duration-150"
                                            style={{ color: showPassword ? '#475569' : '#cbd5e1' }}
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-slate w-full justify-center gap-2.5 mt-1"
                                    style={{ padding: '0.8rem 1.25rem', fontSize: '0.9375rem' }}
                                >
                                    {loading ? (
                                        <>
                                            <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Logging in...
                                        </>
                                    ) : (
                                        <>Log In <ArrowRight size={17} /></>
                                    )}
                                </button>
                            </form>

                            <p className="mt-6 text-center text-xs" style={{ color: '#cbd5e1' }}>
                                Need access? Contact the{' '}
                                <span style={{ color: '#475569', fontWeight: 600 }}>KIMS ICT helpdesk</span>.
                            </p>
                        </div>
                    </div>

                    <p className="text-center mt-5 text-xs" style={{ color: '#cbd5e1' }}>
                        © 2026 KIMS ICT Cell — Authorized personnel only
                    </p>
                </div>
            </div>
        </div>
    );
}
