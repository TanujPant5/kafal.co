import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const getAuthHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('kafal_admin_token')}` },
});

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    axios.get(`${API}/categories`).then(r => { setCategories(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      const { data } = await axios.post(`${API}/admin/categories`, { name: newName.trim() }, getAuthHeaders());
      setCategories(prev => [data, ...prev]);
      setNewName('');
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
    finally { setAdding(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try { await axios.delete(`${API}/admin/categories/${id}`, getAuthHeaders()); setCategories(prev => prev.filter(c => c._id !== id)); }
    catch { alert('Failed to delete'); }
  };

  return (
    <div>
      <h1 className="admin-page-title">Categories</h1>
      <form onSubmit={handleAdd} className="admin-card" style={{ display:'flex', gap:'12px', alignItems:'flex-end' }}>
        <div style={{ flex:1 }}>
          <label className="input-label">New category</label>
          <input type="text" className="input-field" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={adding} style={{ whiteSpace:'nowrap' }}>
          <Plus size={16} />{adding ? 'Adding...' : 'Add'}
        </button>
      </form>
      {loading ? <div className="loading"><div className="spinner"></div>Loading...</div> : categories.length === 0 ? (
        <div className="admin-card" style={{ textAlign:'center', color:'var(--muted)' }}>No categories yet.</div>
      ) : (
        <div className="admin-card" style={{ padding:0 }}>
          {categories.map(cat => (
            <div key={cat._id} className="category-list-item">
              <div><span style={{ fontWeight:'500' }}>{cat.name}</span><span style={{ color:'var(--muted)', fontSize:'0.8rem', marginLeft:'8px' }}>{cat.slug}</span></div>
              <button className="btn btn-danger btn-small" onClick={() => handleDelete(cat._id)}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;
