import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Phone, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';
import API_URL from '../api/config';

const Home = () => {
    const [mobile, setMobile] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLookup = async (e) => {
        e.preventDefault();
        if (mobile.length < 10) {
            return toast.error('Please enter a valid 10-digit mobile number');
        }

        setLoading(true);
        try {
            const { data } = await axios.get(`${API_URL}/customers/lookup/${mobile}`);
            // Store public data in session storage temporarily for view
            sessionStorage.setItem('vikalpCustomerData', JSON.stringify(data));
            navigate('/my-records');
        } catch (error) {
            toast.error(error.response?.data?.message || 'No records found for this mobile number');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-8">
                <div className="space-y-4">
                    <img src="/logo.png" alt="Logo" className="w-20 h-20 mx-auto" />
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Vikalp Electric & Refrigeration</h1>
                    <p className="text-gray-500 font-medium">Customer Service Portal</p>
                </div>

                <div className="card shadow-2xl shadow-primary/5 border-gray-100 p-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Track Your Service</h2>
                    <form onSubmit={handleLookup} className="space-y-6 text-left">
                        <div>
                            <label className="block text-sm font-semibold text-gray-600 mb-2 ml-1">Registered Mobile Number</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <Phone size={18} />
                                </div>
                                <input
                                    type="tel"
                                    maxLength="10"
                                    value={mobile}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                                    className="block w-full pl-12 pr-4 py-4 border-2 border-gray-100 rounded-2xl focus:border-primary focus:ring-0 transition-all text-lg font-mono tracking-widest outline-none"
                                    placeholder="00000 00000"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-4 rounded-2xl hover:bg-blue-800 transition-all transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 shadow-xl shadow-primary/20 disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    Find My Records <ArrowRight size={20} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="flex items-center justify-center gap-6 text-gray-400 text-sm font-medium">
                    <div className="flex items-center gap-1.5">
                        <ShieldCheck size={16} className="text-green-500" />
                        Secure Access
                    </div>
                    <div className="h-4 w-px bg-gray-200"></div>
                    <p>No password required</p>
                </div>
            </div>
        </div>
    );
};

export default Home;
