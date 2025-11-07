// src/components/common/DelegateLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

function DelegateLayout() {
  const { profile } = useAuth();
  const location = useLocation(); // To highlight the active link

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="delegate-layout">
      <header className="dashboard-header">
        <h1 className="dashboard-title">
          {profile ? profile.team_name : 'YLES'}
        </h1>
        <nav className="dashboard-nav">
          <Link 
            to="/" 
            style={{ color: location.pathname === '/' ? 'var(--text-color)' : 'var(--text-color-secondary)' }}
          >
            Dashboard
          </Link>
          <Link 
            to="/info-hub"
            style={{ color: location.pathname === '/info-hub' ? 'var(--text-color)' : 'var(--text-color-secondary)' }}
          >
            Info Hub
          </Link>
          <button onClick={handleSignOut} className="btn-secondary">
            Sign Out
          </button>
        </nav>
      </header>

      {/* This renders the current page (Dashboard or InfoHub) */}
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DelegateLayout;