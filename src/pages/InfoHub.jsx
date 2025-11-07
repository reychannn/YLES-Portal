// src/pages/InfoHub.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

function InfoHub() {
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... (Data fetching logic is identical, no changes)
    // ...
    const fetchModules = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('modules').select('*').order('day', { ascending: true }).order('start_time', { ascending: true, nullsFirst: false });
      if (error) { setError(error.message); } else { setModules(data); }
      setLoading(false);
    };
    fetchModules();
  }, []);

  const formatTime = (timeStr) => {
    if (!timeStr) return "Time TBD";
    return new Date(timeStr).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  if (loading) return <div className="loading-text">Loading event info...</div>;
  if (error) return <div className="error-message" style={{ margin: '2rem' }}>Error: {error}</div>;

  return (
    // The layout handles the main header
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {modules.map(module => (
        <div key={module.id} className="content-card">
          <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>{module.name} (Day {module.day})</h2>
          
          <p><strong>Time:</strong> {formatTime(module.start_time)}</p>
          <p><strong>Venue:</strong> {module.venue || "Venue TBD"}</p>
          
          {module.description && (
            <p><strong>Details:</strong> {module.description}</p>
          )}
          
          {module.venue_map_url && (
            <a 
              href={module.venue_map_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="btn-primary" // Use the primary button style
              style={{ textDecoration: 'none', width: 'auto', display: 'inline-block' }}
            >
              View Map
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default InfoHub;