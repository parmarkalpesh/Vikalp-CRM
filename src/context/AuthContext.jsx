import { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

import API_URL from '../api/config';

export const AuthProvider = ({ children }) => {
    const [admin, setAdmin] = useState(
        JSON.parse(localStorage.getItem('vikalpAdmin')) || null
    );
    const [loading, setLoading] = useState(false);

    const login = async (email, password) => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/auth/login`, {
                email,
                password,
            });
            setAdmin(data);
            localStorage.setItem('vikalpAdmin', JSON.stringify(data));
            return { success: true };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Login failed',
            };
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setAdmin(null);
        localStorage.removeItem('vikalpAdmin');
    };

    return (
        <AuthContext.Provider value={{ admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
