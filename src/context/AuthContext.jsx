import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('anniversary_role'));
  const [token, setToken] = useState(() => localStorage.getItem('anniversary_token'));
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/config');
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch config:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const login = async (code) => {
    try {
      setErrorMsg('');
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setRole(data.role);
        setToken(data.token);
        localStorage.setItem('anniversary_role', data.role);
        localStorage.setItem('anniversary_token', data.token);
        return { success: true, role: data.role, message: data.message };
      } else {
        setErrorMsg(data.message || 'Mật mã chưa đúng!');
        return { success: false, message: data.message || 'Mật mã chưa đúng!' };
      }
    } catch (err) {
      setErrorMsg('Không thể kết nối máy chủ!');
      return { success: false, message: 'Lỗi kết nối máy chủ!' };
    }
  };

  const logout = () => {
    setRole(null);
    setToken(null);
    localStorage.removeItem('anniversary_role');
    localStorage.removeItem('anniversary_token');
  };

  const updateConfig = async (newConfigData) => {
    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfigData)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setConfig(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Cập nhật thất bại' };
    } catch (err) {
      return { success: false, message: 'Lỗi kết nối server khi lưu' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        token,
        config,
        loading,
        errorMsg,
        login,
        logout,
        fetchConfig,
        updateConfig
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
