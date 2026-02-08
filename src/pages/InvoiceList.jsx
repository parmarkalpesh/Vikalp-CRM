import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import API_URL from "../api/config";
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
  Trash2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import InvoicePDF from "../components/InvoicePDF";
import { toast } from "react-hot-toast";

const InvoiceList = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const invoiceRef = useRef();

  const fetchInvoices = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${admin.token}` } };
      const { data } = await axios.get(
        `${API_URL}/invoices`,
        config,
      );
      setInvoices(data);
    } catch (error) {
      toast.error("Failed to fetch invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [admin]);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customer?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.mobile.includes(searchTerm),
  );

  // Server-side PDF download (recommended)
  const downloadServerPDF = async (invoice) => {
    if (!invoice) return;

    setDownloadingId(invoice._id);
    try {
      const config = { headers: { Authorization: `Bearer ${admin.token}` } };
      const response = await axios.get(
        `${API_URL}/invoices/${invoice._id}/download-pdf`,
        { ...config, responseType: "blob" },
      );

      // Create a blob and download
      const blob = new Blob([response.data], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = `Invoice_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(link.href);

      toast.success("Downloaded Successfully");
    } catch (error) {
      console.error("Server PDF Download Error:", error);
      toast.error("Failed to download PDF. Trying client-side generation...");
      // Fallback to client-side generation
      downloadClientPDF(invoice);
    } finally {
      setDownloadingId(null);
    }
  };

  // Client-side PDF download (fallback)
  const downloadClientPDF = async (invoice) => {
    if (!invoice) return;

    setSelectedInvoice(invoice);
    toast.loading("Preparing PDF...", { id: "pdf-gen" });

    setTimeout(async () => {
      try {
        const element = invoiceRef.current;
        if (!element) {
          throw new Error("Invoice view not initialized. Please try again.");
        }

        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: false,
          allowTaint: true,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
        toast.success("Downloaded Successfully", { id: "pdf-gen" });
      } catch (error) {
        console.error("Client PDF Generation Error:", error);
        toast.error(error.message || "Failed to generate PDF", {
          id: "pdf-gen",
        });
      }
    }, 800);
  };

  const handleDelete = async (invoiceId) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;

    try {
      const config = { headers: { Authorization: `Bearer ${admin.token}` } };
      await axios.delete(`${API_URL}/invoices/${invoiceId}`, config);
      toast.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete invoice");
    }
  };

  return (
    <div className="space-y-6">
      <InvoicePDF ref={invoiceRef} invoice={selectedInvoice} />
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Service Invoices</h1>
          <p className="text-sm text-gray-500">
            View and manage customer billing records
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/invoices/create")}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Create Invoice
        </button>
      </div>

      <div className="card !p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
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
            <thead className="text-xs font-bold text-white uppercase tracking-wider bg-gradient-to-r from-blue-900 to-blue-700 border-b-2 border-blue-900">
              <tr>
                <th className="px-6 py-4">Invoice #</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Items</th>
                <th className="px-6 py-4">Subtotal</th>
                <th className="px-6 py-4">GST</th>
                <th className="px-6 py-4 bg-green-700">Total Amount</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-6 py-10 text-center">
                    <Loader2 className="animate-spin inline-block text-primary" />
                  </td>
                </tr>
              ) : filteredInvoices.length === 0 ? (
                <tr>
                  <td
                    colSpan="9"
                    className="px-6 py-10 text-center text-gray-400"
                  >
                    No invoices found
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice) => {
                  const subtotal =
                    invoice.items?.reduce(
                      (acc, item) => acc + (item.lineTotal || 0),
                      0,
                    ) || 0;
                  const gstTotal = invoice.gstTotal || 0;
                  const itemCount = invoice.items?.length || 0;
                  return (
                    <tr
                      key={invoice._id}
                      className="hover:bg-blue-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-blue-700">
                        {invoice.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">
                          {invoice.customer?.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {invoice.mobile}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                          {itemCount} {itemCount === 1 ? "item" : "items"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-700 font-semibold">
                          ₹
                          {subtotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-orange-700 font-semibold">
                          ₹
                          {gstTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 bg-green-50">
                        <div className="flex items-center gap-1 font-bold text-green-700 text-lg">
                          <IndianRupee size={16} />
                          {invoice.grandTotal.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${invoice.paymentStatus === "Paid"
                            ? "bg-green-100 text-green-700"
                            : invoice.paymentStatus === "Partial"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {invoice.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {new Date(invoice.invoiceDate).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => downloadServerPDF(invoice)}
                            disabled={downloadingId === invoice._id}
                            title="Download PDF"
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all disabled:opacity-50"
                          >
                            {downloadingId === invoice._id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Download size={18} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDelete(invoice._id)}
                            title="Delete Invoice"
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InvoiceList;
