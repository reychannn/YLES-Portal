// src/components/routing/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function AdminRoute({ children }) {
  const { profile } = useAuth();

  // If the user is logged in AND their role is 'admin', show the page.
  if (profile && profile.role === 'admin') {
    return children;
  }

  // Otherwise, redirect them to the main dashboard.
  return <Navigate to="/" replace />;
}

export default AdminRoute;