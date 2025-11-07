// src/pages/admin/AdminDashboard.jsx
import { useAuth } from '../../context/AuthContext';

function AdminDashboard() {
  const { profile } = useAuth();

  return (
    <div>
      {/* The layout provides the nav and sign-out button */}
      <h1>Dashboard</h1>
      <p>Welcome, Admin ({profile ? profile.team_name : ''})!</p>
      <p>Select an option from the sidebar to get started.</p>
    </div>
  );
}
export default AdminDashboard;