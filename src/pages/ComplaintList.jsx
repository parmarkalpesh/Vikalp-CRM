import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
    ClipboardList,
    Plus,
    Search,
    CheckCircle2,
    Clock,
    AlertTriangle,
    Loader2,
    Filter,
    FileText
} from 'lucide-react';
import API_URL from '../api/config';

const ComplaintList = () => {
    const { admin } = useAuth();
    const navigate = useNavigate();
    const [complaints, setComplaints] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [statusFilter, setStatusFilter] = useState('All');

    // New Complaint state
    const [formData, setFormData] = useState({
        customerId: '',
        services: [],
        description: ''
    });

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const [compRes, custRes] = await Promise.all([
                axios.get(`${API_URL}/complaints`, config),
                axios.get(`${API_URL}/customers`, config)
            ]);
            setComplaints(compRes.data);
            setCustomers(custRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [admin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.services.length === 0) return toast.error('Please select at least one service');
        if (!formData.description.trim()) return toast.error('Please enter a description');

        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/complaints`, formData, config);
            toast.success('Complaint registered successfully');
            setShowModal(false);
            setFormData({ customerId: '', services: [], description: '' });
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to register');
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.put(`${API_URL}/complaints/${id}`, { status: newStatus }, config);
            toast.success(`Status updated to ${newStatus}`);
            fetchData();
        } catch (error) {
            toast.error('Update failed');
        }
    };

    const filteredComplaints = complaints.filter(c =>
        statusFilter === 'All' ? true : c.status === statusFilter
    );

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed':
                return <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><CheckCircle2 size={12} /> Completed</span>;
            case 'Working':
                return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><Clock size={12} /> In Progress</span>;
            default:
                return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1"><AlertTriangle size={12} /> Pending</span>;
        }
    };

    const toggleService = (type) => {
        const newServices = formData.services.includes(type)
            ? formData.services.filter(s => s !== type)
            : [...formData.services, type];
        setFormData({ ...formData, services: newServices });
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Complaints</h1>
                    <p className="text-sm text-gray-500">Track and manage service requests</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Complaint
                </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Filter size={18} className="text-gray-400 mr-2" />
                {['All', 'Pending', 'Working', 'Completed'].map(status => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${statusFilter === status
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {status}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin inline-block text-primary" /></div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="col-span-full py-20 text-center card text-gray-400">No complaints found in this category</div>
                ) : (
                    filteredComplaints.map(complaint => (
                        <div key={complaint._id} className="card hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-900">{complaint.complaintId}</h3>
                                    <p className="text-xs text-gray-400">{new Date(complaint.createdAt).toLocaleString()}</p>
                                </div>
                                {getStatusBadge(complaint.status)}
                            </div>

                            <div className="space-y-3 mb-6">
                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-gray-50 rounded text-gray-500"><ClipboardList size={16} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Services</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {complaint.services.map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2">
                                    <div className="p-1.5 bg-gray-50 rounded text-gray-500"><Search size={16} /></div>
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold tracking-tight">Customer</p>
                                        <p className="text-sm font-medium text-gray-700">{complaint.customer?.name} ({complaint.mobile})</p>
                                    </div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600 border border-gray-100">
                                    {complaint.description}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                {complaint.status !== 'Working' && complaint.status !== 'Completed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(complaint._id, 'Working')}
                                        className="flex-1 py-2 rounded-lg border border-blue-200 text-blue-600' hover:bg-blue-50 text-xs font-semibold"
                                    >
                                        Start Work
                                    </button>
                                )}
                                {complaint.status !== 'Completed' && (
                                    <button
                                        onClick={() => handleStatusUpdate(complaint._id, 'Completed')}
                                        className="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-xs font-semibold"
                                    >
                                        Complete
                                    </button>
                                )}
                                {complaint.status === 'Completed' && (
                                    <div className="w-full space-y-2">
                                        <p className="w-full text-center text-xs text-green-600 font-medium py-2 bg-green-50 rounded-lg border border-green-100">
                                            Job Finished Successfully
                                        </p>
                                        <button
                                            onClick={() => navigate('/admin/invoices/create', {
                                                state: {
                                                    customerId: complaint.customer?._id,
                                                    serviceType: complaint.services.join(', '),
                                                    description: complaint.description
                                                }
                                            })}
                                            className="w-full py-2.5 rounded-lg bg-amber-500 text-white hover:bg-amber-600 text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-200 transition-all"
                                        >
                                            <FileText size={14} /> Generate Invoice
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* New Complaint Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">Register Complaint</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
                                <select
                                    required
                                    value={formData.customerId}
                                    onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none"
                                >
                                    <option value="">Choose a customer...</option>
                                    {customers.map(c => (
                                        <option key={c._id} value={c._id}>{c.name} ({c.mobile})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['AC', 'Fridge', 'CCTV', 'Other'].map(type => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => toggleService(type)}
                                            className={`py-2 rounded-lg border text-sm font-bold transition-all ${formData.services.includes(type)
                                                ? 'bg-blue-50 border-primary text-primary shadow-sm'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                                <textarea
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                                    placeholder="Detail the issue reported by the customer..."
                                />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full btn-primary py-3 font-semibold">
                                    Register Complaint
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComplaintList;
