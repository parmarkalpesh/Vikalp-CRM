import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Lock, Mail, Loader2 } from 'lucide-react';

const AdminLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, admin, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (admin) {
            navigate('/admin/dashboard');
        }
    }, [admin, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            return toast.error('Please fill in all fields');
        }

        const { success, message } = await login(email, password);
        if (success) {
            toast.success('Login successful');
            navigate('/admin/dashboard');
        } else {
            toast.error(message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-2xl mb-4 shadow-lg">
                        <span className="text-2xl font-bold">VE</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
                    <p className="text-gray-500 mt-2">Vikalp Electronics & Refrigeration</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="admin@vikalp.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-semibold py-2 rounded-lg hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;
