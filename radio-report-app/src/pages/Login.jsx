import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('http://127.0.0.1:8000/api-token-auth/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('isAuthenticated', 'true');
                localStorage.setItem('userId', data.user_id); // PK
                localStorage.setItem('employeeId', data.username); // User ID / Employee ID

                const fullName = `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'Doctor';
                localStorage.setItem('userFullName', fullName);
                localStorage.setItem('userName', fullName); // Keeping legacy support if any component uses userName for display name

                navigate('/dashboard');
            } else {
                setError(data.non_field_errors ? data.non_field_errors[0] : 'Invalid credentials');
            }
        } catch (err) {
            setError('Failed to connect to server. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50 font-sans">
            {/* Left Side - Image */}
            <div className="hidden lg:flex lg:w-1/2 relative bg-gray-900 overflow-hidden">
                <img
                    src="/image/medical_login_bg.png"
                    alt="Radiology Department"
                    className="absolute inset-0 w-full h-full object-cover scale-105 transition-transform duration-[20s] hover:scale-110"
                />
                <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full bg-gradient-to-r from-teal-900/90 to-blue-900/50">
                    <div className="mb-8">
                        <img src="/image/kims_logo.png" alt="KIMS Logo" className="w-[200px] bg-white_90 p-3 rounded-xl bg-white/90 shadow-lg backdrop-blur-sm" />
                    </div>
                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                        Old Radiology <br /> <span className="text-teal-300">Reporting System</span>
                    </h1>
                    <p className="text-lg text-teal-50 max-w-lg leading-relaxed opacity-90">
                        Secure, high-speed access to patient diagnostic reports.
                        Designed for modern healthcare professionals.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="w-full max-w-[420px] relative z-10">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 text-lg">Please enter your details to sign in</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center animate-pulse">
                                {error}
                            </div>
                        )}

                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Username / ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="Enter your Username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <Lock size={20} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 group ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <span>Signing In...</span>
                            ) : (
                                <>
                                    <span>Sign In</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-10 text-center">
                        <p className="text-gray-500 font-medium">
                            Don't have an account?{' '}
                            <Link to="/signup" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
