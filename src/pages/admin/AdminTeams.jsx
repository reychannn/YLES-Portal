// src/pages/admin/AdminTeams.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import ManageTeamModal from '../../components/admin/ManageTeamModal';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

function AdminTeams() {
  const [teams, setTeams] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // ... (fetchData logic is identical, no changes)
  // ...
  const fetchData = async () => {
    setLoading(true); setError(null);
    const { data: teamsData, error: teamsError } = await supabase.from('profiles').select('*').eq('role', 'delegate').order('team_name', { ascending: true });
    if (teamsError) { setError(teamsError.message); setLoading(false); return; }
    setTeams(teamsData);
    const { data: modulesData, error: modulesError } = await supabase.from('modules').select('*').order('day', { ascending: true }).order('name', { ascending: true });
    if (modulesError) { setError(modulesError.message); setLoading(false); return; }
    setModules(modulesData);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);
  const openModal = (team) => { setSelectedTeam(team); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setSelectedTeam(null); fetchData(); };

  if (loading) return <div>Loading teams...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div>
      <h1>Manage Team Progress & Fines</h1>
      <p style={{ color: 'var(--text-color-secondary)' }}>
        Click "Manage" on a team to update their progress or add a fine.
      </p>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Team Name</th>
            <th>Balance</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => (
            <tr key={team.id}>
              <td>{team.team_name}</td>
              <td>${team.current_balance}</td>
              <td style={{ textAlign: 'center' }}>
                <button onClick={() => openModal(team)} className="btn-secondary" style={{ padding: '5px 10px' }}>
                  Manage
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedTeam && (
        <Modal open={isModalOpen} onClose={closeModal} center>
          <ManageTeamModal 
            team={selectedTeam} 
            modules={modules} 
          />
        </Modal>
      )}
    </div>
  );
}

export default AdminTeams;