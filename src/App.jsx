import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Admin
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import CustomerList from './pages/CustomerList';
import ComplaintList from './pages/ComplaintList';
import InvoiceList from './pages/InvoiceList';
import CreateInvoice from './pages/CreateInvoice';

// Pages - Customer
import Home from './pages/Home';
import CustomerData from './pages/CustomerData';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/lookup" element={<Home />} />
          <Route path="/my-records" element={<CustomerData />} />

          {/* Admin Auth */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Protected Admin Routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/customers" element={<CustomerList />} />
              <Route path="/admin/complaints" element={<ComplaintList />} />
              <Route path="/admin/invoices" element={<InvoiceList />} />
              <Route path="/admin/invoices/create" element={<CreateInvoice />} />
            </Route>
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
