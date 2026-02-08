import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    ClipboardList,
    FileText,
    Download,
    User,
    Phone,
    MapPin,
    IndianRupee,
    CheckCircle2,
    Clock,
    AlertTriangle,
    ExternalLink,
    Loader2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import InvoicePDF from '../components/InvoicePDF';
import { toast } from 'react-hot-toast';

const CustomerData = () => {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [activeTab, setActiveTab] = useState('complaints');
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [downloadingId, setDownloadingId] = useState(null);
    const invoiceRef = useRef();

    useEffect(() => {
        const savedData = sessionStorage.getItem('vikalpCustomerData');
        if (!savedData) {
            navigate('/');
            return;
        }
        setData(JSON.parse(savedData));
    }, [navigate]);

    if (!data) return null;

    const { customer, complaints, invoices } = data;

    // Client-side PDF download (for customers - no auth needed for session data)
    const downloadPDF = async (invoice) => {
        if (!invoice) return;

        setDownloadingId(invoice._id);
        setSelectedInvoice(invoice);
        toast.loading('Preparing Secure PDF...', { id: 'pdf-gen' });

        setTimeout(async () => {
            try {
                const element = invoiceRef.current;
                if (!element) {
                    throw new Error('Invoice preview failed to load. Please try again.');
                }

                const canvas = await html2canvas(element, {
                    scale: 2,
                    useCORS: true,
                    logging: false
                });

                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
                toast.success('Invoice Downloaded', { id: 'pdf-gen' });
            } catch (error) {
                console.error('Customer PDF Error:', error);
                toast.error('Failed to generate PDF. Refresh and try again.', { id: 'pdf-gen' });
            } finally {
                setDownloadingId(null);
            }
        }, 800);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Completed': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-[10px] font-bold">COMPLETED</span>;
            case 'Working': return <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold">IN PROGRESS</span>;
            default: return <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[10px] font-bold">PENDING</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <InvoicePDF ref={invoiceRef} invoice={selectedInvoice} />
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="text-center">
                        <h1 className="text-lg font-black text-primary">Vikalp Electronics</h1>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Customer Portal</p>
                    </div>
                    <div className="w-9"></div> {/* Balancer */}
                </div>
            </header>

            <main className="flex-1 p-4 lg:p-8">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Profile Card */}
                    <div className="card bg-primary text-white border-none shadow-xl shadow-primary/20 overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <User size={120} />
                        </div>
                        <div className="relative z-10">
                            <h2 className="text-2xl font-bold">{customer.name}</h2>
                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-blue-100">
                                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                                    <Phone size={14} /> {customer.mobile}
                                </div>
                                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full">
                                    <MapPin size={14} /> {customer.address}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex p-1 bg-gray-200 rounded-xl">
                        <button
                            onClick={() => setActiveTab('complaints')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'complaints' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <ClipboardList size={18} /> Complaints ({complaints.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('invoices')}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === 'invoices' ? 'bg-white text-primary shadow-sm' : 'text-gray-500'
                                }`}
                        >
                            <FileText size={18} /> Invoices ({invoices.length})
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-4 pb-10">
                        {activeTab === 'complaints' ? (
                            complaints.length === 0 ? (
                                <div className="text-center py-20 card text-gray-400">No complaint records found</div>
                            ) : (
                                complaints.map(complaint => (
                                    <div key={complaint._id} className="card hover:shadow-md transition-shadow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-xs text-blue-600 font-bold mb-1">{complaint.complaintId}</p>
                                                <h3 className="font-bold text-gray-800">{complaint.serviceType} Service</h3>
                                                <p className="text-xs text-gray-400 mt-1">{new Date(complaint.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            {getStatusBadge(complaint.status)}
                                        </div>
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
                                            {complaint.description}
                                        </div>
                                    </div>
                                ))
                            )
                        ) : (
                            invoices.length === 0 ? (
                                <div className="text-center py-20 card text-gray-400">No invoice records found</div>
                            ) : (
                                invoices.map(invoice => (
                                    <div key={invoice._id} className="card flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-800">{invoice.invoiceNumber}</h3>
                                                <p className="text-xs text-gray-400">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
                                                <div className="mt-1 flex items-center gap-1 font-black text-gray-900">
                                                    <IndianRupee size={12} /> {invoice.grandTotal.toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadPDF(invoice)}
                                            disabled={downloadingId === invoice._id}
                                            className="p-3 bg-primary text-white rounded-xl hover:bg-blue-800 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                                        >
                                            {downloadingId === invoice._id ? (
                                                <Loader2 size={20} className="animate-spin" />
                                            ) : (
                                                <Download size={20} />
                                            )}
                                        </button>
                                    </div>
                                ))
                            )
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CustomerData;
