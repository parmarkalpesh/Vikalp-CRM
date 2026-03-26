import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Plus, Search, Edit2, UserPlus, Phone, MapPin, Loader2, Trash2 } from 'lucide-react';
import API_URL from '../api/config';

const CustomerList = () => {
    const { admin } = useAuth();
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        address: ''
    });

    const fetchCustomers = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/customers`, config);
            setCustomers(data);
        } catch (error) {
            toast.error('Failed to fetch customers');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Deleting a customer will also remove ALL their complaints and invoices. Are you sure?')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.delete(`${API_URL}/customers/${id}`, config);
            toast.success('Customer and all records deleted');
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Delete failed');
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [admin]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validations
        if (!formData.name.trim() || formData.name.length < 3) {
            return toast.error('Full name must be at least 3 characters');
        }
        if (!/^\d{10}$/.test(formData.mobile)) {
            return toast.error('Mobile number must be exactly 10 digits');
        }
        if (!formData.address.trim() || formData.address.length < 5) {
            return toast.error('Address must be at least 5 characters');
        }

        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            if (editingCustomer) {
                await axios.put(`${API_URL}/customers/${editingCustomer._id}`, formData, config);
                toast.success('Customer updated successfully');
            } else {
                await axios.post(`${API_URL}/customers`, formData, config);
                toast.success('Customer added successfully');
            }
            setShowModal(false);
            setEditingCustomer(null);
            setFormData({ name: '', mobile: '', address: '' });
            fetchCustomers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Action failed');
        }
    };

    const openEditModal = (customer) => {
        setEditingCustomer(customer);
        setFormData({
            name: customer.name,
            mobile: customer.mobile,
            address: customer.address
        });
        setShowModal(true);
    };

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
                    <p className="text-sm text-gray-500">Manage all registered service customers</p>
                </div>
                <button
                    onClick={() => {
                        setEditingCustomer(null);
                        setFormData({ name: '', mobile: '', address: '' });
                        setShowModal(true);
                    }}
                    className="btn-primary flex items-center gap-2"
                >
                    <UserPlus size={18} />
                    Add Customer
                </button>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or mobile..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/10 hover:border-gray-300 transition-all text-sm"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50/50">
                            <tr>
                                <th className="px-6 py-4">Customer Name</th>
                                <th className="px-6 py-4">Mobile Number</th>
                                <th className="px-6 py-4">Address</th>
                                <th className="px-6 py-4">Created At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center">
                                        <Loader2 className="animate-spin inline-block text-primary" />
                                    </td>
                                </tr>
                            ) : filteredCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-10 text-center text-gray-400">
                                        No customers found
                                    </td>
                                </tr>
                            ) : (
                                filteredCustomers.map(customer => (
                                    <tr key={customer._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                                        <td className="px-6 py-4 text-gray-600 font-mono">{customer.mobile}</td>
                                        <td className="px-6 py-4 text-gray-500 truncate max-w-xs">{customer.address}</td>
                                        <td className="px-6 py-4 text-gray-400">
                                            {new Date(customer.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => openEditModal(customer)}
                                                className="p-1 px-3 text-blue-600 hover:bg-blue-50 rounded-md transition-colors inline-flex items-center gap-1"
                                            >
                                                <Edit2 size={14} /> Edit
                                            </button>
                                            <button
                                                onClick={() => handleDelete(customer._id)}
                                                className="p-1 px-3 text-red-600 hover:bg-red-50 rounded-md transition-colors inline-flex items-center gap-1"
                                            >
                                                <Trash2 size={14} /> Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-900">
                                {editingCustomer ? 'Update Customer' : 'Add New Customer'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none"
                                    placeholder="e.g. Rahul Sharma"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    required
                                    type="tel"
                                    value={formData.mobile}
                                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none font-mono"
                                    placeholder="e.g. 9876543210"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <textarea
                                    required
                                    rows="3"
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none resize-none"
                                    placeholder="Enter full service address"
                                />
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full btn-primary py-3 font-semibold">
                                    {editingCustomer ? 'Save Changes' : 'Create Customer'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomerList;
