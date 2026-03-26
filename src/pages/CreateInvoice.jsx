import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-hot-toast";
import API_URL from "../api/config";
import {
  Plus,
  Trash2,
  ArrowLeft,
  Save,
  Calculator,
  IndianRupee,
  User,
  Package,
  Loader2,
  FileText,
  Calendar,
} from "lucide-react";

const CreateInvoice = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customerId: location.state?.customerId || "",
    paymentStatus: "Unpaid",
    items: location.state?.serviceType
      ? [
        {
          serviceName: `${location.state.serviceType} Service - ${location.state.description.substring(0, 30)}...`,
          hsnCode: "",
          quantity: 1,
          unitPrice: 0,
          per: "Pcs",
          discount: 0,
          gstPercent: 18,
        },
      ]
      : [
        {
          serviceName: "",
          hsnCode: "",
          quantity: 1,
          unitPrice: 0,
          per: "Pcs",
          discount: 0,
          gstPercent: 18,
        },
      ],
    deliveryNote: "",
    modeTermsOfPayment: "",
    referenceNoAndDate: "",
    otherReferences: "",
    dispatchDocNo: "",
    deliveryNoteDate: "",
    dispatchedThrough: "",
    destination: "",
    termsOfDelivery: "",
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${admin.token}` } };
        const { data } = await axios.get(`${API_URL}/customers`, config);
        setCustomers(data);
      } catch (error) {
        toast.error("Failed to load customers");
      }
    };
    fetchCustomers();
  }, [admin]);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          serviceName: "",
          hsnCode: "",
          quantity: 1,
          unitPrice: 0,
          per: "Pcs",
          discount: 0,
          gstPercent: 18,
        },
      ],
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

  const calculateItemTotal = (item) => {
    const itemBase = item.quantity * item.unitPrice;
    const discount = (itemBase * (item.discount || 0)) / 100;
    const subtotal = itemBase - discount;
    const gst = subtotal * (item.gstPercent / 100);
    return subtotal + gst;
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((acc, item) => {
      const itemBase = item.quantity * item.unitPrice;
      const discount = (itemBase * (item.discount || 0)) / 100;
      return acc + (itemBase - discount);
    }, 0);
  };

  const calculateGst = () => {
    return formData.items.reduce((acc, item) => {
      const itemBase = item.quantity * item.unitPrice;
      const discount = (itemBase * (item.discount || 0)) / 100;
      const itemSubtotal = itemBase - discount;
      return acc + (itemSubtotal * item.gstPercent) / 100;
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customerId) {
      return toast.error("Please select a customer");
    }
    if (formData.items.length === 0) {
      return toast.error("Please add at least one service item");
    }

    for (const item of formData.items) {
      if (!item.serviceName.trim()) {
        return toast.error("Service name cannot be empty");
      }
      if (item.unitPrice <= 0) {
        return toast.error(
          `Please enter a valid price for ${item.serviceName}`,
        );
      }
      if (item.quantity <= 0) {
        return toast.error(
          `Please enter a valid quantity for ${item.serviceName}`,
        );
      }
    }

    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${admin.token}` } };
      await axios.post(`${API_URL}/invoices`, formData, config);
      toast.success("Invoice generated successfully");
      navigate("/admin/invoices");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to generate invoice",
      );
    } finally {
      setLoading(false);
    }
  };

  const subtotal = calculateSubtotal();
  const gst = calculateGst();
  const grandTotal = subtotal + gst;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <FileText size={28} className="text-blue-200" />
              <div>
                <h1 className="text-2xl font-bold">Create New Invoice</h1>
                <p className="text-blue-200 text-sm">
                  Generate a professional tax invoice
                </p>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
            <Calendar size={16} className="text-blue-200" />
            <span className="text-sm font-medium">{today}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer & Payment Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Selection */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <User size={20} className="text-blue-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Customer Information
                </h2>
                <p className="text-sm text-gray-500">
                  Select the customer for this invoice
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Customer <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.customerId}
                onChange={(e) =>
                  setFormData({ ...formData, customerId: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white text-gray-800"
              >
                <option value="">-- Choose a customer --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.mobile})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Payment Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Calculator size={20} className="text-green-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Payment</h2>
                <p className="text-sm text-gray-500">Set payment status</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.paymentStatus}
                onChange={(e) =>
                  setFormData({ ...formData, paymentStatus: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-gray-50 hover:bg-white"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Invoice Grid Details Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-indigo-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Invoice Grid Details
              </h2>
              <p className="text-sm text-gray-500">
                Secondary information for the invoice header
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Delivery Note
                </label>
                <input
                  type="text"
                  value={formData.deliveryNote}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryNote: e.target.value })
                  }
                  placeholder="e.g. DN-001"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Mode/Terms of Payment
                </label>
                <input
                  type="text"
                  value={formData.modeTermsOfPayment}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      modeTermsOfPayment: e.target.value,
                    })
                  }
                  placeholder="e.g. Cash / 30 Days"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Ref No. & Date
                </label>
                <input
                  type="text"
                  value={formData.referenceNoAndDate}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      referenceNoAndDate: e.target.value,
                    })
                  }
                  placeholder="e.g. REF-123 (08-Feb-26)"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Other References
                </label>
                <input
                  type="text"
                  value={formData.otherReferences}
                  onChange={(e) =>
                    setFormData({ ...formData, otherReferences: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dispatch Doc No.
                </label>
                <input
                  type="text"
                  value={formData.dispatchDocNo}
                  onChange={(e) =>
                    setFormData({ ...formData, dispatchDocNo: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Delivery Note Date
                </label>
                <input
                  type="date"
                  value={formData.deliveryNoteDate}
                  onChange={(e) =>
                    setFormData({ ...formData, deliveryNoteDate: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Dispatched through
                </label>
                <input
                  type="text"
                  value={formData.dispatchedThrough}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      dispatchedThrough: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Destination
                </label>
                <input
                  type="text"
                  value={formData.destination}
                  onChange={(e) =>
                    setFormData({ ...formData, destination: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm"
                />
              </div>
            </div>
            <div className="lg:col-span-3">
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Terms of Delivery
              </label>
              <textarea
                value={formData.termsOfDelivery}
                onChange={(e) =>
                  setFormData({ ...formData, termsOfDelivery: e.target.value })
                }
                rows="2"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm resize-none"
                placeholder="Enter any delivery terms or special instructions..."
              ></textarea>
            </div>
          </div>
        </div>

        {/* Invoice Items Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Section Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Package size={20} className="text-purple-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Invoice Items
                </h2>
                <p className="text-sm text-gray-500">
                  Add products or services to the invoice
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddItem}
              className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-900 via-blue-800 to-blue-700 border-b-2 border-blue-900">
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-12">
                    #
                  </th>
                  <th className="text-left px-4 py-4 text-xs font-bold text-white uppercase tracking-wider min-w-[200px]">
                    Description
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-28">
                    HSN/SAC
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-44">
                    Rate (₹)
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-20">
                    Unit
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-20">
                    Qty
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-20">
                    Disc %
                  </th>
                  <th className="text-center px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-24">
                    GST %
                  </th>
                  <th className="text-right px-4 py-4 text-xs font-bold text-white uppercase tracking-wider w-44">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {formData.items.map((item, index) => {
                  const baseAmount = item.quantity * item.unitPrice;
                  const discountAmount =
                    (baseAmount * (item.discount || 0)) / 100;
                  const subtotalAmount = baseAmount - discountAmount;
                  const gstAmount = subtotalAmount * (item.gstPercent / 100);
                  const totalAmount = subtotalAmount + gstAmount;

                  return (
                    <tr
                      key={index}
                      className="hover:bg-blue-50/50 transition-colors group"
                    >
                      {/* Serial Number */}
                      <td className="px-4 py-4">
                        <div className="w-8 h-8 bg-blue-100 group-hover:bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 transition-colors">
                          {index + 1}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="px-4 py-4">
                        <input
                          required
                          type="text"
                          placeholder="Product/Service name"
                          value={item.serviceName}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "serviceName",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm bg-white hover:border-gray-400 transition-colors"
                        />
                      </td>

                      {/* HSN/SAC */}
                      <td className="px-4 py-4">
                        <input
                          type="text"
                          placeholder="HSN Code"
                          value={item.hsnCode}
                          onChange={(e) =>
                            handleItemChange(index, "hsnCode", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center bg-white hover:border-gray-400 transition-colors"
                        />
                      </td>

                      {/* Rate */}
                      <td className="px-4 py-4">
                        <input
                          required
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "unitPrice",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-right font-medium bg-white hover:border-gray-400 transition-colors"
                        />
                      </td>

                      {/* Unit */}
                      <td className="px-4 py-4">
                        <select
                          value={item.per}
                          onChange={(e) =>
                            handleItemChange(index, "per", e.target.value)
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center bg-white hover:border-gray-400 transition-colors"
                        >
                          <option value="Pcs">Pcs</option>
                          <option value="Nos">Nos</option>
                          <option value="Kg">Kg</option>
                          <option value="Mtr">Mtr</option>
                          <option value="Box">Box</option>
                          <option value="Set">Set</option>
                        </select>
                      </td>

                      {/* Quantity */}
                      <td className="px-4 py-4">
                        <input
                          required
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              parseInt(e.target.value) || 1,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center font-medium bg-white hover:border-gray-400 transition-colors"
                        />
                      </td>

                      {/* Discount */}
                      <td className="px-4 py-4">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.discount}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "discount",
                              parseFloat(e.target.value) || 0,
                            )
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center bg-white hover:border-gray-400 transition-colors"
                        />
                      </td>

                      {/* GST */}
                      <td className="px-4 py-4">
                        <select
                          value={item.gstPercent}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "gstPercent",
                              parseInt(e.target.value),
                            )
                          }
                          className="w-full px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm text-center font-medium bg-white hover:border-gray-400 transition-colors"
                        >
                          <option value="0">0%</option>
                          <option value="5">5%</option>
                          <option value="12">12%</option>
                          <option value="18">18%</option>
                          <option value="28">28%</option>
                        </select>
                      </td>

                      {/* Amount - Enhanced with breakdown */}
                      <td className="px-4 py-4">
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 px-4 py-3 rounded-lg">
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-700">
                              ₹{formatCurrency(totalAmount)}
                            </div>
                            <div className="text-xs text-gray-600 mt-1 space-y-0.5">
                              <div>Base: ₹{formatCurrency(baseAmount)}</div>
                              {discountAmount > 0 && (
                                <div className="text-orange-600">
                                  Disc: -₹{formatCurrency(discountAmount)}
                                </div>
                              )}
                              {gstAmount > 0 && (
                                <div className="text-blue-600">
                                  GST: +₹{formatCurrency(gstAmount)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Delete Button */}
                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          disabled={formData.items.length === 1}
                          className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State for Mobile */}
          {formData.items.length === 0 && (
            <div className="p-8 text-center text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-50" />
              <p>No items added yet. Click "Add Item" to begin.</p>
            </div>
          )}
        </div>

        {/* Summary Section */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Notes */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText size={18} className="text-blue-700" />
              </div>
              <h3 className="text-sm font-bold text-gray-900">
                Important Notes
              </h3>
            </div>
            <div className="text-xs text-gray-600 space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>{" "}
                <span>GST is calculated on the discounted amount</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>{" "}
                <span>
                  CGST and SGST are split equally (9% each for 18% GST)
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>{" "}
                <span>All amounts are in Indian Rupees (₹)</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-blue-600 font-bold mt-1">•</span>{" "}
                <span>Amount column shows broken down calculation</span>
              </p>
            </div>
          </div>

          {/* Totals - Enhanced Card */}
          <div className="lg:w-96 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-blue-900 to-blue-700">
              <h3 className="text-white font-bold text-lg flex items-center gap-2">
                <IndianRupee size={20} />
                Invoice Summary
              </h3>
            </div>

            {/* Details */}
            <div className="p-0">
              {/* Subtotal */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <span className="text-gray-700 font-medium">Subtotal</span>
                <span className="font-semibold text-gray-900 text-lg">
                  ₹{formatCurrency(subtotal)}
                </span>
              </div>

              {/* Total Discount Row (if any discount) */}
              {formData.items.some((item) => item.discount > 0) && (
                <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-orange-50">
                  <span className="text-orange-700 font-medium">
                    Total Discount
                  </span>
                  <span className="font-semibold text-orange-700 text-lg">
                    -₹
                    {formatCurrency(
                      formData.items.reduce((acc, item) => {
                        const itemBase = item.quantity * item.unitPrice;
                        return acc + (itemBase * (item.discount || 0)) / 100;
                      }, 0),
                    )}
                  </span>
                </div>
              )}

              {/* Taxable Amount */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-blue-50">
                <span className="text-blue-700 font-medium">
                  Taxable Amount
                </span>
                <span className="font-semibold text-blue-900 text-lg">
                  ₹{formatCurrency(subtotal)}
                </span>
              </div>

              {/* GST Amount */}
              <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                <span className="text-gray-700 font-medium">
                  GST Amount (18%)
                </span>
                <span className="font-semibold text-gray-900 text-lg">
                  ₹{formatCurrency(gst)}
                </span>
              </div>

              {/* CGST/SGST Breakdown */}
              <div className="p-4 bg-gray-50 space-y-2 border-b border-gray-100">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">CGST (9%)</span>
                  <span className="text-gray-700 font-semibold">
                    ₹{formatCurrency(gst / 2)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">SGST (9%)</span>
                  <span className="text-gray-700 font-semibold">
                    ₹{formatCurrency(gst / 2)}
                  </span>
                </div>
              </div>

              {/* Grand Total - Highlighted */}
              <div className="p-6 bg-gradient-to-br from-green-600 to-emerald-600">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold text-lg">
                    Grand Total
                  </span>
                  <span className="text-white font-bold text-3xl flex items-center gap-1">
                    <IndianRupee size={24} />
                    {formatCurrency(grandTotal)}
                  </span>
                </div>
                <p className="text-green-100 text-xs mt-2">
                  inclusive of all taxes
                </p>
              </div>

              {/* Submit Button */}
              <div className="p-5">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-700 to-blue-900 hover:from-blue-800 hover:to-blue-950 text-white py-4 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-700/30 disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:shadow-blue-700/40"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      Generate Invoice
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
