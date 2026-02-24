import React, { useState, useEffect } from 'react';
import { User, Shield, Key, Plus, RefreshCw, X, ChevronLeft, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AdminPanel() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Create User State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newUser, setNewUser] = useState({
        username: '', password: '', first_name: '', last_name: '', is_staff: false
    });
    const [createError, setCreateError] = useState('');

    // Reset Password State
    const [showResetModal, setShowResetModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [resetError, setResetError] = useState('');

    const token = localStorage.getItem('token');

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/users/', {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setError('Failed to fetch users');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setCreateError('');
        try {
            const response = await fetch('/api/users/', {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newUser)
            });
            if (response.ok) {
                setShowCreateModal(false);
                setNewUser({ username: '', password: '', first_name: '', last_name: '', is_staff: false });
                fetchUsers();
            } else {
                const data = await response.json();
                setCreateError(data.username ? `Username: ${data.username[0]}` : 'Failed to create user');
            }
        } catch (err) {
            setCreateError('Network error');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setResetError('');
        try {
            const response = await fetch(`/api/users/${selectedUser.id}/set_password/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: newPassword })
            });
            if (response.ok) {
                setShowResetModal(false);
                setSelectedUser(null);
                setNewPassword('');
                alert('Password reset successfully');
            } else {
                setResetError('Failed to reset password');
            }
        } catch (err) {
            setResetError('Network error');
        }
    };

    const handleDeleteUser = async (userId, username) => {
        if (!window.confirm(`Are you sure you want to completely remove the user "${username}"?`)) {
            return;
        }
        try {
            const response = await fetch(`/api/users/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${token}`
                }
            });
            if (response.ok) {
                fetchUsers();
            } else {
                setError('Failed to delete user');
            }
        } catch (err) {
            setError('Network error');
        }
    };

    if (loading && users.length === 0) return <div className="p-8 text-center bg-slate-50 min-h-screen">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-2 bg-white rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Shield className="text-teal-600" size={32} />
                                Admin User Management
                            </h1>
                            <p className="text-gray-500 mt-2">Manage all staff and radiologist accounts in the system.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors shadow-sm"
                    >
                        <Plus size={20} />
                        Create New Account
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">User ID</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Full Name</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Role</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600">Status</th>
                                <th className="px-6 py-4 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {user.first_name} {user.last_name}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_staff ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700">
                                                <Shield size={14} /> Admin
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                                <User size={14} /> Standard
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_active ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Active
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
                                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Inactive
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowResetModal(true);
                                                }}
                                                className="text-teal-600 hover:text-teal-800 font-medium text-sm flex items-center gap-1.5 transition-colors"
                                            >
                                                <Key size={16} /> Reset
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user.id, user.username)}
                                                className="text-red-500 hover:text-red-700 font-medium text-sm flex items-center gap-1.5 transition-colors"
                                            >
                                                <Trash2 size={16} /> Remove
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <div className="p-8 text-center text-gray-500 font-medium">No users found.</div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900">Create New Account</h3>
                            <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateUser} className="p-6 space-y-4">
                            {createError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">{createError}</div>}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                                        value={newUser.first_name}
                                        onChange={e => setNewUser({ ...newUser, first_name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                                        value={newUser.last_name}
                                        onChange={e => setNewUser({ ...newUser, last_name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">User ID / Username</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                                    value={newUser.username}
                                    onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temporary Password</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all outline-none"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <input
                                    type="checkbox" id="isAdmin"
                                    className="w-5 h-5 rounded text-teal-600 focus:ring-teal-500 border-gray-300"
                                    checked={newUser.is_staff}
                                    onChange={e => setNewUser({ ...newUser, is_staff: e.target.checked })}
                                />
                                <label htmlFor="isAdmin" className="text-sm font-medium text-gray-700">Grant Admin Privileges</label>
                            </div>

                            <div className="pt-6">
                                <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors">
                                    Create Member
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {showResetModal && selectedUser && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-red-50/50">
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Key size={20} className="text-red-500" /> Reset Password
                            </h3>
                            <button
                                onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword(''); setResetError(''); }}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleResetPassword} className="p-6">
                            <p className="text-sm text-gray-600 mb-6">
                                You are setting a new password for <span className="font-bold text-gray-900">{selectedUser.first_name} ({selectedUser.username})</span>.
                            </p>

                            {resetError && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg mb-4">{resetError}</div>}

                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Password</label>
                                <input
                                    type="text" required
                                    placeholder="Enter new password"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => { setShowResetModal(false); setSelectedUser(null); setNewPassword(''); setResetError(''); }}
                                    className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors"
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
