import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, CheckCircle } from 'lucide-react';

export default function Signup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        first_name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Enforce numeric only for User ID (username)
        if (name === 'username' && !/^\d*$/.test(value)) {
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            // Using first_name to store full name for simplicity as backend expects first_name/last_name
            const payload = {
                username: formData.username,
                password: formData.password,
                first_name: formData.first_name,
            };

            const response = await fetch(`http://${window.location.hostname}:8000/api/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (response.ok) {
                // Success
                navigate('/login');
            } else {
                // Error handling
                if (data.username) setError(`User ID: ${data.username[0]}`);
                else if (data.password) setError(`Password: ${data.password[0]}`);
                else setError('Registration failed. Please check your inputs.');
            }
        } catch (err) {
            setError('Failed to connect to server.');
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
                        Join Our <br /> <span className="text-teal-300">Medical Team</span>
                    </h1>
                    <p className="text-lg text-teal-50 max-w-lg leading-relaxed opacity-90">
                        Create your account to access the Radiology Reporting System.
                        Streamline your workflow with AI-assisted tools.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto">
                {/* Decorative background elements */}
                <div className="absolute top-10 right-10 w-64 h-64 bg-teal-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute bottom-10 left-10 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

                <div className="w-full max-w-[420px] relative z-10 py-10">
                    <div className="text-center mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">Create Account</h2>
                        <p className="text-gray-500 text-lg">Enter your details to register</p>
                    </div>

                    <form onSubmit={handleSignup} className="space-y-4">
                        {error && (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium text-center animate-pulse">
                                {error}
                            </div>
                        )}
                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="Dr. John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">User ID</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <User size={20} />
                                </div>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="Enter User ID"
                                    required
                                />
                            </div>
                        </div>



                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <Lock size={19} />
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-teal-600 transition-colors">
                                    <CheckCircle size={19} />
                                </div>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-white border-2 border-gray-100 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all duration-200 font-medium shadow-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl shadow-lg hover:shadow-teal-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-500 font-medium">
                            Already have an account?{' '}
                            <Link to="/login" className="text-teal-600 font-bold hover:text-teal-700 hover:underline transition-colors">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
