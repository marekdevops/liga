import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('password');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Users management state
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    isAdmin: false,
    canManageLeagues: false
  });

  useEffect(() => {
    if (activeTab === 'users' && user?.isAdmin) {
      fetchUsers();
    }
  }, [activeTab, user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Nowe hasła nie są identyczne');
      setIsLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/me/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passwordData.currentPassword,
          new_password: passwordData.newPassword
        })
      });

      if (response.ok) {
        setMessage('Hasło zostało zmienione pomyślnie');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Błąd podczas zmiany hasła');
      }
    } catch (error) {
      setError('Błąd połączenia');
    }

    setIsLoading(false);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/users/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          username: newUser.username,
          email: newUser.email,
          password: newUser.password,
          is_admin: newUser.isAdmin,
          can_manage_leagues: newUser.canManageLeagues
        })
      });

      if (response.ok) {
        setMessage('Użytkownik został utworzony pomyślnie');
        setNewUser({ username: '', email: '', password: '', isAdmin: false, canManageLeagues: false });
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Błąd podczas tworzenia użytkownika');
      }
    } catch (error) {
      setError('Błąd połączenia');
    }

    setIsLoading(false);
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        setMessage('Użytkownik został zaktualizowany');
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Błąd podczas aktualizacji użytkownika');
      }
    } catch (error) {
      setError('Błąd połączenia');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessage('Użytkownik został usunięty');
        fetchUsers();
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Błąd podczas usuwania użytkownika');
      }
    } catch (error) {
      setError('Błąd połączenia');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', marginBottom: '30px' }}>⚙️ Ustawienia</h1>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        borderBottom: '2px solid #333', 
        marginBottom: '30px',
        gap: '10px'
      }}>
        <button
          onClick={() => setActiveTab('password')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'password' ? '#4CAF50' : 'transparent',
            color: '#fff',
            border: 'none',
            borderRadius: '8px 8px 0 0',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          🔒 Zmiana hasła
        </button>
        {user?.isAdmin && (
          <button
            onClick={() => setActiveTab('users')}
            style={{
              padding: '10px 20px',
              backgroundColor: activeTab === 'users' ? '#4CAF50' : 'transparent',
              color: '#fff',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            👥 Zarządzanie użytkownikami
          </button>
        )}
      </div>

      {/* Messages */}
      {message && (
        <div style={{
          padding: '15px',
          backgroundColor: '#4CAF50',
          color: '#fff',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f44336',
          color: '#fff',
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          {error}
        </div>
      )}

      {/* Password Change Tab */}
      {activeTab === 'password' && (
        <div style={{
          backgroundColor: '#2a2a2a',
          padding: '30px',
          borderRadius: '12px',
          border: '2px solid #333'
        }}>
          <h2 style={{ color: '#fff', marginBottom: '20px' }}>Zmiana hasła</h2>
          <form onSubmit={handlePasswordChange}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                Aktualne hasło:
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #555',
                  backgroundColor: '#1a1a1a',
                  color: '#fff'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                Nowe hasło:
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #555',
                  backgroundColor: '#1a1a1a',
                  color: '#fff'
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                Potwierdź nowe hasło:
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '2px solid #555',
                  backgroundColor: '#1a1a1a',
                  color: '#fff'
                }}
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                backgroundColor: '#4CAF50',
                color: '#fff',
                padding: '12px 30px',
                border: 'none',
                borderRadius: '8px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {isLoading ? 'Zapisywanie...' : 'Zmień hasło'}
            </button>
          </form>
        </div>
      )}

      {/* Users Management Tab */}
      {activeTab === 'users' && user?.isAdmin && (
        <div>
          {/* Create New User */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            border: '2px solid #333',
            marginBottom: '30px'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>Dodaj nowego użytkownika</h2>
            <form onSubmit={handleCreateUser}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                    Nazwa użytkownika:
                  </label>
                  <input
                    type="text"
                    value={newUser.username}
                    onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #555',
                      backgroundColor: '#1a1a1a',
                      color: '#fff'
                    }}
                    required
                  />
                </div>
                <div>
                  <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                    Email:
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #555',
                      backgroundColor: '#1a1a1a',
                      color: '#fff'
                    }}
                    required
                  />
                </div>
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ color: '#fff', display: 'block', marginBottom: '5px' }}>
                  Hasło:
                </label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    border: '2px solid #555',
                    backgroundColor: '#1a1a1a',
                    color: '#fff'
                  }}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newUser.isAdmin}
                    onChange={(e) => setNewUser({...newUser, isAdmin: e.target.checked})}
                  />
                  Administrator
                </label>
                <label style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    checked={newUser.canManageLeagues}
                    onChange={(e) => setNewUser({...newUser, canManageLeagues: e.target.checked})}
                  />
                  Zarządzanie ligami
                </label>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: '#4CAF50',
                  color: '#fff',
                  padding: '12px 30px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {isLoading ? 'Tworzenie...' : 'Utwórz użytkownika'}
              </button>
            </form>
          </div>

          {/* Users List */}
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '30px',
            borderRadius: '12px',
            border: '2px solid #333'
          }}>
            <h2 style={{ color: '#fff', marginBottom: '20px' }}>Lista użytkowników</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #555' }}>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'left' }}>Użytkownik</th>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'left' }}>Email</th>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>Admin</th>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>Zarządzanie ligami</th>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>Aktywny</th>
                    <th style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>Akcje</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((userItem) => (
                    <tr key={userItem.id} style={{ borderBottom: '1px solid #444' }}>
                      <td style={{ color: '#fff', padding: '12px' }}>{userItem.username}</td>
                      <td style={{ color: '#fff', padding: '12px' }}>{userItem.email}</td>
                      <td style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={userItem.is_admin}
                          onChange={(e) => handleUpdateUser(userItem.id, { is_admin: e.target.checked })}
                        />
                      </td>
                      <td style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={userItem.can_manage_leagues}
                          onChange={(e) => handleUpdateUser(userItem.id, { can_manage_leagues: e.target.checked })}
                        />
                      </td>
                      <td style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={userItem.is_active}
                          onChange={(e) => handleUpdateUser(userItem.id, { is_active: e.target.checked })}
                        />
                      </td>
                      <td style={{ color: '#fff', padding: '12px', textAlign: 'center' }}>
                        {userItem.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(userItem.id)}
                            style={{
                              backgroundColor: '#f44336',
                              color: '#fff',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Usuń
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
