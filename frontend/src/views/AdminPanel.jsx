import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

export default function AdminPanel() {
  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '70px'
    }}>
      <TopBar />
      
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #4CAF50 0%, #2E7D32 100%)',
        padding: '40px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '36px',
          margin: '0 0 15px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          🛠️ Panel Administracyjny
        </h1>
        <p style={{
          fontSize: '16px',
          margin: 0,
          opacity: 0.9
        }}>
          Zarządzaj ligami, drużynami, zawodnikami i meczami
        </p>
      </div>

      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        {/* Quick Actions */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <AdminCard
            to="/admin/leagues/new"
            icon="🏆"
            title="Dodaj Ligę"
            description="Utwórz nową ligę piłkarską"
            color="#2196F3"
          />
          <AdminCard
            to="/admin/teams/new"
            icon="👥"
            title="Dodaj Drużynę"
            description="Dodaj nową drużynę do ligi"
            color="#FF9800"
          />
          <AdminCard
            to="/admin/players/new"
            icon="👤"
            title="Dodaj Zawodnika"
            description="Zarejestruj nowego zawodnika"
            color="#9C27B0"
          />
          <AdminCard
            to="/admin/matches/new"
            icon="⚽"
            title="Dodaj Mecz"
            description="Zaplanuj nowy mecz"
            color="#4CAF50"
          />
        </div>

        {/* Public Views Access */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '30px',
          border: '2px solid #333',
          marginBottom: '40px'
        }}>
          <h2 style={{
            color: '#64B5F6',
            marginBottom: '20px',
            fontSize: '24px'
          }}>
            👀 Widoki Publiczne
          </h2>
          <p style={{
            color: '#cccccc',
            marginBottom: '20px'
          }}>
            Sprawdź jak wygląda aplikacja z perspektywy użytkowników:
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '15px'
          }}>
            <PublicViewLink
              to="/league"
              icon="📋"
              title="Lista Lig"
              description="Zobacz wszystkie dostępne ligi"
            />
            <PublicViewLink
              to="/"
              icon="🏠"
              title="Strona Główna"
              description="Widok publiczny aplikacji"
            />
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '30px',
          border: '2px solid #333',
          textAlign: 'center'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '15px' }}>
            📊 Ostatnia Aktywność
          </h3>
          <p style={{ color: '#999', margin: 0 }}>
            Tutaj będą wyświetlane ostatnie zmiany w systemie
          </p>
        </div>
      </div>
    </div>
  );
}

function AdminCard({ to, icon, title, description, color }) {
  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div
        style={{
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          padding: '24px',
          border: '2px solid #333',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          textAlign: 'center'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.borderColor = color;
          e.currentTarget.style.boxShadow = `0 8px 25px ${color}40`;
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = '#333';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{
          fontSize: '48px',
          marginBottom: '15px'
        }}>
          {icon}
        </div>
        <h3 style={{
          margin: '0 0 10px 0',
          color: color,
          fontSize: '18px'
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          color: '#cccccc',
          fontSize: '14px',
          lineHeight: '1.4'
        }}>
          {description}
        </p>
      </div>
    </Link>
  );
}

function PublicViewLink({ to, icon, title, description }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        padding: '15px',
        backgroundColor: '#333',
        borderRadius: '8px',
        border: '1px solid #444',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#404040';
        e.currentTarget.style.borderColor = '#64B5F6';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#333';
        e.currentTarget.style.borderColor = '#444';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <div>
          <div style={{ fontWeight: 'bold', color: '#64B5F6', fontSize: '14px' }}>
            {title}
          </div>
          <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
            {description}
          </div>
        </div>
      </div>
    </Link>
  );
}
