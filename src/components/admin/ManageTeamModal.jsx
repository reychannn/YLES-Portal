// src/components/admin/ManageTeamModal.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

function ManageTeamModal({ team, modules }) {
  const { profile: adminProfile } = useAuth();

  // --- Component State ---
  const [progress, setProgress] = useState({});
  const [fines, setFines] = useState([]); // <-- NEW: To store the list of fines
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
      // 1. Fetch Progress
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

      // 2. Fetch Fines
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

  // Fetch data when the modal opens (team prop changes)
  useEffect(() => {
    fetchData();
  }, [team.id]);

  // --- Module Progress Handlers ---
  const handleProgressChange = async (moduleId, newStatus) => {
    setMessage(null); setError(null);
    setProgress(prev => ({ ...prev, [moduleId]: newStatus }));

    const { error } = await supabase
      .from('team_progress')
      .upsert(
        { team_id: team.id, module_id: moduleId, status: newStatus },
        { onConflict: 'team_id, module_id' }
      );
    if (error) setError('Error updating progress: ' + error.message);
    else setMessage('Progress updated!');
  };

  // --- Fine Handlers (All New/Updated) ---

  const handleAddFine = async (e) => {
    e.preventDefault();
    setMessage(null); setError(null);

    if (fineAmount <= 0 || !fineReason) {
      setError('Please enter a valid amount and reason.');
      return;
    }

    // 1. Insert the new fine
    const { error: insertError } = await supabase
      .from('fines')
      .insert({
        team_id: team.id,
        amount: fineAmount,
        reason: fineReason,
        admin_issuer_id: adminProfile.id,
      });

    if (insertError) {
      setError('Error adding fine: ' + insertError.message);
      return;
    }

    // 2. Call our new SQL function to recalculate the balance
    const { error: rpcError } = await supabase.rpc('recalculate_balance', {
      p_team_id: team.id
    });

    if (rpcError) {
      setError('Fine added, but failed to update balance: ' + rpcError.message);
    } else {
      setMessage('Fine added successfully! Balance updated.');
    }
    
    // 3. Reset form and refresh fine list
    setFineAmount(0);
    setFineReason('');
    fetchData(); // Refresh the data in the modal
  };

  /**
   * NEW: Handle deleting a single fine
   */
  const handleDeleteFine = async (fineId) => {
    setMessage(null); setError(null);
    
    // 1. Delete the fine
    const { error: deleteError } = await supabase
      .from('fines')
      .delete()
      .eq('id', fineId);
    
    if (deleteError) {
      setError('Error deleting fine: ' + deleteError.message);
      return;
    }

    // 2. Recalculate the balance
    const { error: rpcError } = await supabase.rpc('recalculate_balance', {
      p_team_id: team.id
    });

    if (rpcError) {
      setError('Fine deleted, but failed to update balance: ' + rpcError.message);
    } else {
      setMessage('Fine removed successfully! Balance updated.');
    }

    // 3. Refresh the fine list
    fetchData();
  };

  /**
   * NEW: Handle wiping all fines
   */
  const handleWipeAllFines = async () => {
    if (!window.confirm('Are you sure you want to delete ALL fines for this team? This cannot be undone.')) {
      return;
    }
    
    setMessage(null); setError(null);
    
    // 1. Delete all fines for this team
    const { error: deleteError } = await supabase
      .from('fines')
      .delete()
      .eq('team_id', team.id);
    
    if (deleteError) {
      setError('Error wiping fines: ' + deleteError.message);
      return;
    }

    // 2. Recalculate the balance
    const { error: rpcError } = await supabase.rpc('recalculate_balance', {
      p_team_id: team.id
    });

    if (rpcError) {
      setError('Fines wiped, but failed to update balance: ' + rpcError.message);
    } else {
      setMessage('All fines removed. Balance restored to initial deposit.');
    }
    
    // 3. Refresh the fine list
    fetchData();
  };

  // --- Render ---
  if (loading) return <div>Loading details...</div>;

  return (
    <div style={{ width: '450px', maxHeight: '80vh', overflowY: 'auto', padding: '10px' }}>
      <h2>Manage: {team.team_name}</h2>
      <p>Current Balance: <strong>${team.current_balance}</strong> (from initial ${team.security_deposit_initial})</p>
      
      {message && <p style={{ color: 'green', background: '#f0fff0', padding: '8px', border: '1px solid green', borderRadius: '4px' }}>{message}</p>}
      {error && <p style={{ color: 'red', background: '#fff0f0', padding: '8px', border: '1px solid red', borderRadius: '4px' }}>{error}</p>}

      <hr style={{ margin: '1rem 0', borderColor: 'var(--border-color)' }} />

      {/* --- Module Progress Section (No change) --- */}
      <h3>Module Progress</h3>
      {/* ... (This section is identical to before) ... */}
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

      {/* --- Add Fine Section (No change) --- */}
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

      {/* --- NEW: Fine History & Removal Section --- */}
      <h3>Fine History</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {fines.length > 0 ? (
          fines.map(fine => (
            <div key={fine.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a2a', padding: '8px 12px', borderRadius: '4px' }}>
              <div>
                <strong>-${fine.amount}</strong>: {fine.reason}
              </div>
              <button 
                onClick={() => handleDeleteFine(fine.id)}
                className="btn-secondary" style={{ padding: '3px 8px', fontSize: '0.8em' }}
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p>No fines recorded for this team.</p>
        )}
      </div>

      {fines.length > 0 && (
        <button 
          onClick={handleWipeAllFines}
          className="btn-primary" 
          style={{ width: '100%', marginTop: '1rem' }}
        >
          Wipe All Fines ({fines.length})
        </button>
      )}
    </div>
  );
}

export default ManageTeamModal;

