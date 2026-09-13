import React, { useEffect, useState } from 'react';
import { adminService } from '../services/adminService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await adminService.getAllUsers();
        setUsers(data || []);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <LoadingSpinner text="Fetching registered platform users..." />;

  return (
    <div className="container" style={{ padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link to="/admin" style={{ color: 'var(--text-muted)' }}><ArrowLeft size={20} /></Link>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff' }}>User Accounts</h1>
      </div>

      <div style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px' }}>User ID</th>
                <th style={{ padding: '12px 16px' }}>Full Name</th>
                <th style={{ padding: '12px 16px' }}>Email Address</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Assigned Roles</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px 16px', fontFamily: 'var(--font-family-mono)' }}>#{u.id}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#fff' }}>{u.fullName}</td>
                  <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '12px 16px' }}>{u.phone || 'N/A'}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {u.roles?.map((r) => (
                        <span key={r} className={`badge ${r === 'ROLE_ADMIN' ? 'badge-volt' : 'badge-info'}`}>
                          {r.replace('ROLE_', '')}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
