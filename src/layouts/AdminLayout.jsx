import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users,
    ClipboardList,
    FileText,
    LogOut,
    LayoutDashboard,
    Menu,
    X
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
    const { logout, admin } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
        { name: 'Customers', icon: <Users size={20} />, path: '/admin/customers' },
        { name: 'Complaints', icon: <ClipboardList size={20} />, path: '/admin/complaints' },
        { name: 'Invoices', icon: <FileText size={20} />, path: '/admin/invoices' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 w-64 bg-primary text-white z-30 transform transition-transform duration-300
        lg:relative lg:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="p-6">
                    <h1 className="text-xl font-bold flex items-center gap-2">
                        <span className="bg-white text-primary p-1 rounded">VE</span>
                        Vikalp CRM
                    </h1>
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            onClick={() => setIsSidebarOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors"
                        >
                            {item.icon}
                            {item.name}
                        </Link>
                    ))}

                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition-colors text-red-200 mt-10"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Navbar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 text-gray-600"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex items-center gap-4 ml-auto">
                        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                            Welcome, {admin?.name}
                        </span>
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-primary font-bold">
                            {admin?.name?.charAt(0)}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8 flex-1 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
