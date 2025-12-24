// src/components/common/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

function AdminLayout() {
  const { profile } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  // --- PERMISSION CHECKS ---
  
  // 1. Teams Tab: Visible to EVERYONE (Admin, FnR, DC, AND Events)
  //    - FnR/DC need it for Fines.
  //    - Events need it for Module Grading.
  const showTeamsTab = ['admin', 'fnr', 'dc', 'events'].includes(profile?.role);

  // 2. Modules Tab: Restricted to Admin and Events only
  const showModulesTab = ['admin', 'events'].includes(profile?.role);

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h2>Admin Panel</h2>
        
        {/* Display Role for clarity */}
        <div style={{ padding: '0 0 1rem 0', color: '#666', fontSize: '0.8rem' }}>
          Role: {profile?.role?.toUpperCase()}
        </div>

        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          
          {/* Conditionally Render "Manage Teams" */}
          {showTeamsTab && (
            <li><Link to="/admin/teams">Manage Teams</Link></li>
          )}

          {/* Conditionally Render "Manage Modules" */}
          {showModulesTab && (
            <li><Link to="/admin/modules">Manage Modules</Link></li>
          )}
        </ul>
        
        <button onClick={handleSignOut} className="btn-secondary" style={{ marginTop: 'auto' }}>
          Sign Out
        </button>
      </nav>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;