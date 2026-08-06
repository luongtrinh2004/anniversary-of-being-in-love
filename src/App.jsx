import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginInvitation from './pages/LoginInvitation';
import UserAnniversary from './pages/UserAnniversary';
import AdminDashboard from './pages/AdminDashboard';

function ProtectedUserRoute({ children }) {
  const { role, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-aurora-soft text-pink-600 font-bold">Đang tải...</div>;
  }
  if (!role) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedAdminRoute({ children }) {
  const { role, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-900 text-pink-400 font-bold">Đang tải...</div>;
  }
  if (role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-aurora-soft text-slate-900">
        <Routes>
          <Route path="/" element={<LoginInvitation />} />
          <Route
            path="/user"
            element={
              <ProtectedUserRoute>
                <UserAnniversary />
              </ProtectedUserRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </AuthProvider>
  );
}
