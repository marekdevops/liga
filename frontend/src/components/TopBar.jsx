import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginModal from './LoginModal';

export default function TopBar() {
  const { isAuthenticated, logout } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  console.log('TopBar: isAuthenticated =', isAuthenticated);

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        zIndex: 1000,
        padding: '15px 20px',
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        backdropFilter: 'blur(10px)',
        borderBottomLeftRadius: '10px',
        border: '1px solid #333'
      }}>
        {isAuthenticated ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <Link 
              to="/admin" 
              style={{
                color: '#4CAF50',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              🛠️ Panel Admin
            </Link>
            <button
              onClick={logout}
              style={{
                background: '#f44336',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Wyloguj
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowLoginModal(true)}
            style={{
              background: 'transparent',
              color: '#ffffff',
              border: '2px solid #2196F3',
              padding: '10px 15px',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#2196F3';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
            }}
          >
            🔑 Logowanie
          </button>
        )}
      </div>

      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </>
  );
}
