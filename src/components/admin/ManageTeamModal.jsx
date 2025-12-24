// src/components/admin/ManageTeamModal.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

function ManageTeamModal({ team, modules }) {
  const { profile } = useAuth();
  const role = profile?.role;

  // --- PERMISSIONS CONFIGURATION ---
  
  // 1. Who can see/edit Modules? (Admin & Events ONLY)
  //    (Hidden for FnR and DC)
  const showModules = ['admin', 'events'].includes(role);

  // 2. Who can see/add Fines? (Admin, FnR, DC ONLY)
  //    (Hidden for Events)
  const showFines = ['admin', 'fnr', 'dc'].includes(role);

  // 3. Who can DELETE fines? (Admin & FnR ONLY)
  //    (DC can see fines but cannot delete them)
  const canDeleteFine = ['admin', 'fnr'].includes(role);

  // --- Component State ---
  const [progress, setProgress] = useState({});
  const [fines, setFines] = useState([]);
  const [fineAmount, setFineAmount] = useState(0);
  const [fineReason, setFineReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // --- Data Fetching ---
  const fetchData = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);
    try {
      // Fetch Progress
      const { data: progressData, error: progressError } = await supabase
        .from('team_progress')
        .select('*')
        .eq('team_id', team.id);
      if (progressError) throw progressError;

      const progressMap = progressData.reduce((acc, p) => {
        acc[p.module_id] = p.status;
        return acc;
      }, {});
      setProgress(progressMap);

      // Fetch Fines
      const { data: finesData, error: finesError } = await supabase
        .from('fines')
        .select('*')
        .eq('team_id', team.id)
        .order('created_at', { ascending: false });
      if (finesError) throw finesError;

      setFines(finesData);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [team.id]);

  // --- Handlers (Identical to before) ---
  const handleProgressChange = async (moduleId, newStatus) => {
    setMessage(null); setError(null);
    setProgress(prev => ({ ...prev, [moduleId]: newStatus }));
    const { error } = await supabase.from('team_progress').upsert({ team_id: team.id, module_id: moduleId, status: newStatus }, { onConflict: 'team_id, module_id' });
    if (error) setError('Error: ' + error.message);
    else setMessage('Progress updated!');
  };

  const handleAddFine = async (e) => {
    e.preventDefault();
    setMessage(null); setError(null);
    if (fineAmount <= 0 || !fineReason) { setError('Invalid input.'); return; }

    const { error: insertError } = await supabase.from('fines').insert({ team_id: team.id, amount: fineAmount, reason: fineReason, admin_issuer_id: profile.id });
    if (insertError) { setError(insertError.message); return; }

    const { error: rpcError } = await supabase.rpc('recalculate_balance', { p_team_id: team.id });
    if (rpcError) setError(rpcError.message);
    else setMessage('Fine added!');
    
    setFineAmount(0); setFineReason(''); fetchData(); 
  };

  const handleDeleteFine = async (fineId) => {
    if (!canDeleteFine) return;
    setMessage(null); setError(null);
    
    const { error: deleteError } = await supabase.from('fines').delete().eq('id', fineId);
    if (deleteError) { setError(deleteError.message); return; }

    const { error: rpcError } = await supabase.rpc('recalculate_balance', { p_team_id: team.id });
    if (rpcError) setError(rpcError.message);
    else setMessage('Fine removed!');

    fetchData();
  };

  const handleWipeAllFines = async () => {
    if (!canDeleteFine) return;
    if (!window.confirm('Delete ALL fines?')) return;
    setMessage(null); setError(null);
    
    const { error: deleteError } = await supabase.from('fines').delete().eq('team_id', team.id);
    if (deleteError) { setError(deleteError.message); return; }

    const { error: rpcError } = await supabase.rpc('recalculate_balance', { p_team_id: team.id });
    if (rpcError) setError(rpcError.message);
    else setMessage('All fines wiped!');
    
    fetchData();
  };

  if (loading) return <div>Loading details...</div>;

  return (
    <div style={{ width: '500px', maxHeight: '80vh', overflowY: 'auto', padding: '10px' }}>
      <h2>Manage: {team.team_name}</h2>
      
      {message && <p className="bg-green-100 text-green-800 p-2 rounded border border-green-300">{message}</p>}
      {error && <p className="bg-red-100 text-red-800 p-2 rounded border border-red-300">{error}</p>}
      
      {/* 1. BALANCE SECTION (Visible to Admin, FnR, DC only) */}
      {showFines && (
        <>
          <p>Current Balance: <strong>${team.current_balance}</strong> (Initial: ${team.security_deposit_initial})</p>
          <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />
        </>
      )}

      {/* 2. MODULES SECTION (Visible to Admin & Events only) */}
      {showModules && (
        <>
          <h3>Module Progress</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {modules.map(module => {
              const currentStatus = progress[module.id] || 'upcoming';
              return (
                <div key={module.id} style={{ padding: '10px', background: '#2a2a2a', borderRadius: '4px' }}>
                  <strong>{module.name}</strong> 
                  <br/>
                  Status: <strong>{currentStatus.toUpperCase()}</strong>
                  <div style={{ display: 'flex', gap: '5px', marginTop: '8px' }}>
                    <button onClick={() => handleProgressChange(module.id, 'completed')} disabled={currentStatus === 'completed'} className="btn-secondary" style={{padding: '5px 8px', background: '#28a745'}}>Pass</button>
                    <button onClick={() => handleProgressChange(module.id, 'eliminated')} disabled={currentStatus === 'eliminated'} className="btn-secondary" style={{padding: '5px 8px'}}>Fail</button>
                    <button onClick={() => handleProgressChange(module.id, 'upcoming')} disabled={currentStatus === 'upcoming'} className="btn-secondary" style={{padding: '5px 8px', background: '#6c757d'}}>Reset</button>
                  </div>
                </div>
              );
            })}
          </div>
          <hr style={{ margin: '2rem 0 1rem 0', borderColor: 'var(--border-color)' }} />
        </>
      )}

      {/* 3. FINES SECTION (Visible to Admin, FnR, DC only) */}
      {showFines && (
        <>
          <h3>Add Fine</h3>
          <form onSubmit={handleAddFine}>
            <div className="form-group">
              <label>Amount:</label>
              <input type="number" value={fineAmount} onChange={(e) => setFineAmount(parseFloat(e.target.value))} className="form-input" />
            </div>
            <div className="form-group">
              <label>Reason:</label>
              <input type="text" value={fineReason} onChange={(e) => setFineReason(e.target.value)} className="form-input" />
            </div>
            <button type="submit" className="btn-primary">Add Fine</button>
          </form>

          <hr style={{ margin: '2rem 0 1rem 0', borderColor: 'var(--border-color)' }} />

          <h3>Fine History</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {fines.length > 0 ? (
              fines.map(fine => (
                <div key={fine.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a', padding: '8px 12px', borderRadius: '4px' }}>
                  <div>
                    <strong>-${fine.amount}</strong>: {fine.reason}
                  </div>
                  
                  {/* Delete button only for Admin/FnR */}
                  {canDeleteFine && (
                    <button 
                      onClick={() => handleDeleteFine(fine.id)}
                      className="btn-secondary" 
                      style={{ padding: '3px 8px', fontSize: '0.8em', color: '#ff6b6b' }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))
            ) : (
              <p>No fines recorded.</p>
            )}
          </div>

          {fines.length > 0 && canDeleteFine && (
            <button 
              onClick={handleWipeAllFines}
              className="btn-primary" 
              style={{ width: '100%', marginTop: '1rem', background: '#e03131' }}
            >
              Wipe All Fines ({fines.length})
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default ManageTeamModal;