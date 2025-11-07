// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

// ... (Keep the StatusBadge component here)
const StatusBadge = ({ status }) => {
  let color = '#6c757d';
  if (status === 'completed') color = '#28a745';
  if (status === 'eliminated') color = '#dc3545';
  return (
    <span style={{
      padding: '4px 8px', background: color, color: 'white',
      borderRadius: '4px', fontSize: '0.9em', textTransform: 'uppercase'
    }}>
      {status}
    </span>
  );
};

function Dashboard() {
  const { profile } = useAuth();
  const [modules, setModules] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ... (The data fetching logic is identical, no changes needed)
        // ...
        const { data: modulesData, error: modulesError } = await supabase.from('modules').select('*').order('day', { ascending: true }).order('name', { ascending: true });
        if (modulesError) throw modulesError;
        const { data: progressData, error: progressError } = await supabase.from('team_progress').select('*').eq('team_id', profile.id);
        if (progressError) throw progressError;
        const { data: finesData, error: finesError } = await supabase.from('fines').select('*').eq('team_id', profile.id).order('created_at', { ascending: false });
        if (finesError) throw finesError;
        setFines(finesData);
        const progressMap = progressData.reduce((acc, p) => { acc[p.module_id] = p.status; return acc; }, {});
        const combinedModules = modulesData.map(module => ({ ...module, status: progressMap[module.id] || 'upcoming' }));
        setModules(combinedModules);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profile]);

  if (loading || !profile) {
    return <div className="loading-text">Loading dashboard...</div>;
  }
  if (error) {
    return <div className="error-message" style={{ margin: '2rem' }}>Error: {error}</div>;
  }

  return (
    // The layout handles the header, we just provide the content
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
      
      <section>
        <h2>Your Progress</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modules.map(module => (
            <div key={module.id} className="content-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>{module.name} (Day {module.day})</h3>
                <StatusBadge status={module.status} />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2>Fine Tracker</h2>
        <div className="content-card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginTop: 0 }}>Balance Summary</h3>
          <div>Initial Deposit: <strong>${profile.security_deposit_initial}</strong></div>
          <div>Total Fines: <strong>-${profile.security_deposit_initial - profile.current_balance}</strong></div>
          <hr style={{ borderColor: 'var(--border-color)' }} />
          <div style={{ fontSize: '1.2em' }}>Remaining Balance: 
            <strong style={{ color: profile.current_balance > 0 ? '#28a745' : '#dc3545' }}> ${profile.current_balance}</strong>
          </div>
        </div>

        <h3>Fine History</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {fines.length > 0 ? (
            fines.map(fine => (
              <div key={fine.id} className="content-card" style={{ padding: '0.75rem 1rem' }}>
                <strong>-${fine.amount}</strong>: {fine.reason}
              </div>
            ))
          ) : (
            <p>No fines yet!</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;