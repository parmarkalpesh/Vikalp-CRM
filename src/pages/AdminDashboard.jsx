import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    ClipboardList,
    FileText,
    TrendingUp,
    Clock,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import API_URL from '../api/config';

const StatCard = ({ title, value, icon, color, subValue, path }) => {
    const navigate = useNavigate();
    return (
        <div
            onClick={() => path && navigate(path)}
            className={`card cursor-pointer hover:shadow-xl hover:border-blue-200 transition-all duration-300 transform hover:-translate-y-1 ${path ? 'active:scale-95' : ''} border border-gray-100 bg-white shadow-sm ring-1 ring-black/5`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <h3 className="text-2xl font-bold mt-1">{value}</h3>
                    {subValue && (
                        <p className="text-xs text-gray-400 mt-1">{subValue}</p>
                    )}
                </div>
                <div className={`p-3 rounded-lg bg-${color}-50 text-${color}-600`}>
                    {icon}
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { admin } = useAuth();
    const [stats, setStats] = useState({
        customers: 0,
        complaints: 0,
        invoices: 0,
        pendingComplaints: 0,
        totalRevenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = {
                    headers: { Authorization: `Bearer ${admin.token}` }
                };

                const [custRes, compRes, invRes] = await Promise.all([
                    axios.get(`${API_URL}/customers`, config),
                    axios.get(`${API_URL}/complaints`, config),
                    axios.get(`${API_URL}/invoices`, config)
                ]);

                const pendingCount = compRes.data.filter(c => c.status !== 'Completed').length;
                const totalRev = invRes.data.reduce((acc, inv) => acc + inv.grandTotal, 0);

                setStats({
                    customers: custRes.data.length,
                    complaints: compRes.data.length,
                    invoices: invRes.data.length,
                    pendingComplaints: pendingCount,
                    totalRevenue: totalRev
                });
            } catch (error) {
                console.error('Error fetching dashboard stats', error);
            } finally {
                setLoading(false);
            }
        };

        if (admin) fetchStats();
    }, [admin]);

    if (loading) return <div>Loading dashboard...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                <p className="text-gray-500">Welcome back, {admin.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Customers"
                    value={stats.customers}
                    icon={<Users size={24} />}
                    color="blue"
                    path="/admin/customers"
                />
                <StatCard
                    title="Total Invoices"
                    value={stats.invoices}
                    icon={<FileText size={24} />}
                    color="amber"
                    subValue={`Revenue: ₹${stats.totalRevenue.toLocaleString()}`}
                    path="/admin/invoices"
                />
                <StatCard
                    title="Complaints"
                    value={stats.complaints}
                    icon={<ClipboardList size={24} />}
                    color="green"
                    subValue={`${stats.pendingComplaints} Pending`}
                    path="/admin/complaints"
                />
            </div>


        </div>
    );
};

export default AdminDashboard;
