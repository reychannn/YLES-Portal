// src/components/common/AdminLayout.jsx
import { Outlet, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';

function AdminLayout() {

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="admin-layout">
      <nav className="admin-sidebar">
        <h2>Admin Panel</h2>
        <ul>
          <li><Link to="/admin">Dashboard</Link></li>
          <li><Link to="/admin/teams">Manage Teams</Link></li>
          <li><Link to="/admin/modules">Manage Modules</Link></li>
        </ul>
        
        <button onClick={handleSignOut} className="btn-secondary">
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