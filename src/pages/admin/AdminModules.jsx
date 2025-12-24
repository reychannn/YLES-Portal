// src/pages/admin/AdminModules.jsx
import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Navigate } from 'react-router-dom'; // Import Navigate
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';

const defaultModuleState = { id: null, name: '', day: 1, start_time: '', venue: '', venue_map_url: '', description: '' };

function AdminModules() {
  const { profile } = useAuth(); // Get profile
  
  // --- STATE ---
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState(defaultModuleState);

  // --- ACCESS CONTROL ---
  // If the profile is loaded but they are NOT 'admin' or 'events', kick them out.
  // We use profile?.role to check. If profile is null (still loading), we wait.
  // Note: 'loading' here is local component state, not auth loading. 
  // Ideally, useAuth should provide an 'authLoading' state to prevent premature redirects,
  // but assuming the parent route handles auth loading, we check role here.
  if (profile && !['admin', 'events'].includes(profile.role)) {
    return <Navigate to="/admin" replace />;
  }

  // --- Data Fetching ---
  const fetchModules = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('modules').select('*').order('day', { ascending: true }).order('start_time', { ascending: true });
    if (error) { setError(error.message); } else { setModules(data); }
    setLoading(false);
  };

  useEffect(() => { fetchModules(); }, []);

  // --- Handlers ---
  const openCreateModal = () => { setCurrentModule(defaultModuleState); setIsModalOpen(true); };
  
  const openEditModal = (module) => {
    const formattedTime = module.start_time ? new Date(new Date(module.start_time).getTime() - (new Date().getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : '';
    setCurrentModule({ ...module, start_time: formattedTime });
    setIsModalOpen(true);
  };
  
  const closeModal = () => { setIsModalOpen(false); };
  
  const handleChange = (e) => { const { name, value } = e.target; setCurrentModule(prev => ({ ...prev, [name]: value })); };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const moduleToSubmit = { ...currentModule, start_time: currentModule.start_time ? new Date(currentModule.start_time).toISOString() : null };
    if (currentModule.id) {
      const { error } = await supabase.from('modules').update(moduleToSubmit).eq('id', currentModule.id);
      if (error) setError(error.message);
    } else {
      const { id, ...newModule } = moduleToSubmit;
      const { error } = await supabase.from('modules').insert(newModule);
      if (error) setError(error.message);
    }
    closeModal(); fetchModules();
  };
  
  const handleDelete = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module?')) {
      const { error } = await supabase.from('modules').delete().eq('id', moduleId);
      if (error) { setError(error.message); } else { fetchModules(); }
    }
  };

  if (loading) return <div>Loading modules...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Manage Modules</h1>
        <button onClick={openCreateModal} className="btn-primary" style={{ background: '#28a745' }}>
          + Create New Module
        </button>
      </div>
      
      {error && <div className="error-message">Error: {error}</div>}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Day</th>
            <th>Time</th>
            <th>Venue</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {modules.map(module => (
            <tr key={module.id}>
              <td>{module.name}</td>
              <td>{module.day}</td>
              <td>{module.start_time ? new Date(module.start_time).toLocaleString() : 'TBD'}</td>
              <td>{module.venue}</td>
              <td>
                <button onClick={() => openEditModal(module)} className="btn-secondary" style={{ padding: '5px 10px', marginRight: '5px' }}>Edit</button>
                <button onClick={() => handleDelete(module.id)} className="btn-secondary" style={{ padding: '5px 10px' }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal form */}
      <Modal open={isModalOpen} onClose={closeModal} center>
        <form onSubmit={handleSubmit} style={{ width: '500px' }}>
          <h2>{currentModule.id ? 'Edit Module' : 'Create New Module'}</h2>
          
          <div className="form-group">
            <label>Module Name:</label>
            <input type="text" name="name" value={currentModule.name} onChange={handleChange} required className="form-input" />
          </div>
          
          <div className="form-group">
            <label>Day:</label>
            <input type="number" name="day" min="1" max="3" value={currentModule.day} onChange={handleChange} required className="form-input" />
          </div>

          <div className="form-group">
            <label>Start Time:</label>
            <input type="datetime-local" name="start_time" value={currentModule.start_time} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label>Venue:</label>
            <input type="text" name="venue" value={currentModule.venue} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label>Venue Map URL:</label>
            <input type="text" name="venue_map_url" value={currentModule.venue_map_url} onChange={handleChange} className="form-input" />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea name="description" value={currentModule.description} onChange={handleChange} className="form-input" style={{ height: '80px' }} />
          </div>

          <button type="submit" className="btn-primary">
            {currentModule.id ? 'Save Changes' : 'Create Module'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default AdminModules;