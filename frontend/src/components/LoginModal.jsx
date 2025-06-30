import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginModal({ onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      onClose();
    } else {
      setError('Nieprawidłowe dane logowania');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000
    }}>
      <div style={{
        backgroundColor: '#2a2a2a',
        padding: '30px',
        borderRadius: '12px',
        border: '2px solid #333',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        minWidth: '350px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h2 style={{ color: '#ffffff', margin: 0 }}>🔑 Logowanie Administratora</h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              color: '#999',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ color: '#cccccc', display: 'block', marginBottom: '5px' }}>
              Nazwa użytkownika:
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #555',
                backgroundColor: '#333',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ color: '#cccccc', display: 'block', marginBottom: '5px' }}>
              Hasło:
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid #555',
                backgroundColor: '#333',
                color: '#ffffff',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          {error && (
            <div style={{
              color: '#f44336',
              marginBottom: '15px',
              padding: '10px',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              borderRadius: '6px',
              border: '1px solid #f44336',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <div style={{
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            border: '1px solid #2196F3',
            borderRadius: '6px',
            padding: '10px',
            marginBottom: '20px',
            fontSize: '12px',
            color: '#64B5F6'
          }}>
            💡 Demo: username: <strong>admin</strong>, hasło: <strong>admin123</strong>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Zaloguj się
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Anuluj
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
