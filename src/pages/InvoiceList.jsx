import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText,
    Plus,
    Search,
    Download,
    Printer,
    Eye,
    Loader2,
    Calendar,
    IndianRupee,
    Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import API_URL from '../api/config';

const InvoiceList = () => {
    const { admin } = useAuth();
    const navigate = useNavigate();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [downloadingId, setDownloadingId] = useState(null);

    const fetchInvoices = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/invoices`, config);
            setInvoices(data);
        } catch (error) {
            toast.error('Failed to fetch invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [admin]);

    const filteredInvoices = invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.mobile.includes(searchTerm)
    );

    // Server-side PDF download (recommended)
    const downloadServerPDF = async (invoice) => {
        if (!invoice) return;

        setDownloadingId(invoice._id);
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const response = await axios.get(
                `${API_URL}/invoices/${invoice._id}/download-pdf`,
                { ...config, responseType: 'blob' }
            );

            // Create a blob and download
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `Invoice_${invoice.invoiceNumber}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);

            toast.success('Downloaded Successfully');
        } catch (error) {
            console.error('Server PDF Download Error:', error);
            toast.error('Failed to download PDF');
        } finally {
            setDownloadingId(null);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this invoice? This action cannot be undone.')) return;

        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.delete(`${API_URL}/invoices/${id}`, config);
            toast.success('Invoice deleted successfully');
            fetchInvoices();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete invoice');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Service Invoices</h1>
                    <p className="text-sm text-gray-500">View and manage customer billing records</p>
                </div>
                <button
                    onClick={() => navigate('/admin/invoices/create')}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus size={18} />
                    Create Invoice
                </button>
            </div>

            <div className="card !p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by invoice #, name or mobile..."
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
                                <th className="px-6 py-4">Invoice #</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Total Amount</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center">
                                        <Loader2 className="animate-spin inline-block text-primary" />
                                    </td>
                                </tr>
                            ) : filteredInvoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400">
                                        No invoices found
                                    </td>
                                </tr>
                            ) : (
                                filteredInvoices.map(invoice => (
                                    <tr key={invoice._id} className="hover:bg-gray-50/80 transition-colors">
                                        <td className="px-6 py-4 font-bold text-primary">{invoice.invoiceNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{invoice.customer?.name}</div>
                                            <div className="text-xs text-gray-400">{invoice.mobile}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1 font-bold text-gray-900">
                                                <IndianRupee size={14} className="text-gray-400" />
                                                {invoice.grandTotal.toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${invoice.paymentStatus === 'Paid'
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-amber-100 text-amber-700'
                                                }`}>
                                                {invoice.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(invoice.invoiceDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button
                                                onClick={() => downloadServerPDF(invoice)}
                                                disabled={downloadingId === invoice._id}
                                                className="p-1 px-3 text-primary hover:bg-blue-50 rounded-md transition-colors inline-flex items-center gap-1 disabled:opacity-50"
                                            >
                                                {downloadingId === invoice._id ? (
                                                    <Loader2 size={14} className="animate-spin" />
                                                ) : (
                                                    <Download size={14} />
                                                )}
                                                Download
                                            </button>
                                            <button
                                                onClick={() => handleDelete(invoice._id)}
                                                className="p-1 px-3 text-red-500 hover:bg-red-50 rounded-md transition-colors inline-flex items-center gap-1"
                                            >
                                                <Trash2 size={14} />
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InvoiceList;
