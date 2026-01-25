import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = () => {
    const { admin } = useAuth();

    return admin ? <Outlet /> : <Navigate to="/admin/login" replace />;
};

export default ProtectedRoute;
