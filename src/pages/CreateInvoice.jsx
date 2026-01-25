import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import API_URL from '../api/config';
import {
    Plus,
    Trash2,
    ArrowLeft,
    Save,
    Calculator,
    IndianRupee,
    User,
    Package,
    Loader2
} from 'lucide-react';

const CreateInvoice = () => {
    const { admin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerId: location.state?.customerId || '',
        paymentStatus: 'Unpaid',
        items: location.state?.serviceType
            ? [{ serviceName: `${location.state.serviceType} Service - ${location.state.description.substring(0, 30)}...`, quantity: 1, unitPrice: 0, gstPercent: 18 }]
            : [{ serviceName: '', quantity: 1, unitPrice: 0, gstPercent: 18 }]
    });

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                const { data } = await axios.get(`${API_URL}/customers`, config);
                setCustomers(data);
            } catch (error) {
                toast.error('Failed to load customers');
            }
        };
        fetchCustomers();
    }, [admin]);

    const handleAddItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { serviceName: '', quantity: 1, unitPrice: 0, gstPercent: 18 }]
        });
    };

    const handleRemoveItem = (index) => {
        if (formData.items.length === 1) return;
        const newItems = formData.items.filter((_, i) => i !== index);
        setFormData({ ...formData, items: newItems });
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    };

    const calculateGst = () => {
        return formData.items.reduce((acc, item) => {
            const itemSubtotal = item.quantity * item.unitPrice;
            return acc + (itemSubtotal * item.gstPercent / 100);
        }, 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Frontend Validations
        if (!formData.customerId) {
            return toast.error('Please select a customer');
        }
        if (formData.items.length === 0) {
            return toast.error('Please add at least one service item');
        }

        for (const item of formData.items) {
            if (!item.serviceName.trim()) {
                return toast.error('Service name cannot be empty');
            }
            if (item.unitPrice <= 0) {
                return toast.error(`Please enter a valid price for ${item.serviceName}`);
            }
            if (item.quantity <= 0) {
                return toast.error(`Please enter a valid quantity for ${item.serviceName}`);
            }
        }

        setLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/invoices`, formData, config);
            toast.success('Invoice generated successfully');
            navigate('/admin/invoices');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setLoading(false);
        }
    };

    const subtotal = calculateSubtotal();
    const gst = calculateGst();
    const grandTotal = subtotal + gst;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
                    <p className="text-sm text-gray-500">Generate a professional service invoice</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Customer Selection */}
                    <div className="md:col-span-2 card space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <User size={20} className="text-primary" />
                            Customer Information
                        </h2>
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
                    </div>

                    {/* Payment Status */}
                    <div className="card space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
                            <Calculator size={20} className="text-primary" />
                            Payment Details
                        </h2>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                                value={formData.paymentStatus}
                                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/10 outline-none"
                            >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                                <option value="Partial">Partial</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Invoice Items */}
                <div className="card space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2">
                            <Package size={20} className="text-primary" />
                            Service Items
                        </h2>
                        <button
                            type="button"
                            onClick={handleAddItem}
                            className="text-primary hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1 transition-colors border border-primary/20"
                        >
                            <Plus size={16} /> Add Item
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                                <div className="col-span-12 md:col-span-5">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Service/Product Name</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="e.g. AC Installation Service"
                                        value={item.serviceName}
                                        onChange={(e) => handleItemChange(index, 'serviceName', e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
                                    />
                                </div>
                                <div className="col-span-3 md:col-span-1">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Qty</label>
                                    <input
                                        required
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
                                    />
                                </div>
                                <div className="col-span-5 md:col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">Unit Price</label>
                                    <input
                                        required
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
                                    />
                                </div>
                                <div className="col-span-4 md:col-span-2">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1 ml-1">GST %</label>
                                    <select
                                        value={item.gstPercent}
                                        onChange={(e) => handleItemChange(index, 'gstPercent', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm"
                                    >
                                        <option value="0">0%</option>
                                        <option value="5">5%</option>
                                        <option value="12">12%</option>
                                        <option value="18">18%</option>
                                        <option value="28">28%</option>
                                    </select>
                                </div>
                                <div className="col-span-10 md:col-span-1 flex flex-col justify-end">
                                    <div className="h-10 flex items-center justify-end px-2 font-bold text-gray-700 text-sm">
                                        ₹{(item.quantity * item.unitPrice * (1 + item.gstPercent / 100)).toFixed(0)}
                                    </div>
                                </div>
                                <div className="col-span-2 md:col-span-1 flex items-end justify-end">
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary and Actions */}
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1"></div>
                    <div className="w-full md:w-80 card !p-0 overflow-hidden divide-y divide-gray-50">
                        <div className="p-4 flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-bold">₹{subtotal.toLocaleString()}</span>
                        </div>
                        <div className="p-4 flex justify-between text-sm">
                            <span className="text-gray-500">GST Amount</span>
                            <span className="font-bold">₹{gst.toLocaleString()}</span>
                        </div>
                        <div className="p-4 flex justify-between bg-primary/5">
                            <span className="font-bold text-gray-900">Grand Total</span>
                            <span className="font-bold text-primary flex items-center gap-1 text-lg">
                                <IndianRupee size={16} /> {grandTotal.toLocaleString()}
                            </span>
                        </div>
                        <div className="p-6">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full btn-primary flex items-center justify-center gap-2 py-3 shadow-lg shadow-primary/20 disabled:opacity-70"
                            >
                                {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Generate Invoice
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateInvoice;
