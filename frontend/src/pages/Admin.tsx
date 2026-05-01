import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getApiUrl } from '../api';

export function Admin() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !user.is_admin) {
      navigate('/');
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await fetch(getApiUrl('/api/admin/users'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [user, token, navigate]);

  if (loading) return <div className="text-center mt-20 text-white">Loading admin dashboard...</div>;

  return (
    <div className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="text-4xl mb-8" style={{ fontFamily: 'var(--font-display)' }}>Admin Dashboard</h2>
        
        <div className="liquid-glass rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="p-4 font-medium text-muted-foreground">ID</th>
                <th className="p-4 font-medium text-muted-foreground">Email</th>
                <th className="p-4 font-medium text-muted-foreground">Verified</th>
                <th className="p-4 font-medium text-muted-foreground">Admin</th>
                <th className="p-4 font-medium text-muted-foreground">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="p-4">{u.id}</td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.is_verified ? 'Yes' : 'No'}</td>
                  <td className="p-4">{u.is_admin ? 'Yes' : 'No'}</td>
                  <td className="p-4">{new Date(u.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
