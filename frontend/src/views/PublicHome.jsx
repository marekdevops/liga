import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';

export default function PublicHome() {
  const [leagues, setLeagues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await fetch('/api/league/');
        const data = await response.json();
        setLeagues(data);
      } catch (error) {
        console.error('Błąd pobierania lig:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

  if (loading) {
    return (
      <div style={{
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚽</div>
          <div>Ładowanie lig...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '70px' // miejsce na TopBar
    }}>
      <TopBar />
      
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #2196F3 0%, #1976D2 100%)',
        padding: '60px 20px',
        textAlign: 'center',
        marginBottom: '40px'
      }}>
        <h1 style={{
          fontSize: '48px',
          margin: '0 0 20px 0',
          textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
        }}>
          ⚽ Liga Piłkarska
        </h1>
        <p style={{
          fontSize: '20px',
          margin: 0,
          opacity: 0.9,
          maxWidth: '600px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          Śledź wyniki, tabele i statystyki swoich ulubionych lig piłkarskich
        </p>
      </div>

      {/* Leagues Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <h2 style={{
          textAlign: 'center',
          marginBottom: '40px',
          fontSize: '32px',
          color: '#4CAF50'
        }}>
          🏆 Dostępne Ligi
        </h2>

        {leagues.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            backgroundColor: '#2a2a2a',
            borderRadius: '12px',
            border: '2px dashed #555'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
            <h3 style={{ color: '#cccccc', marginBottom: '10px' }}>Brak dostępnych lig</h3>
            <p style={{ color: '#999', margin: 0 }}>
              Obecnie nie ma żadnych aktywnych lig do wyświetlenia.
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '60px'
          }}>
            {leagues.map((league) => (
              <Link
                key={league.id}
                to={`/league/${league.id}`}
                style={{
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <div style={{
                  backgroundColor: '#2a2a2a',
                  borderRadius: '12px',
                  padding: '24px',
                  border: '2px solid #333',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = '#4CAF50';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#333';
                  e.currentTarget.style.boxShadow = 'none';
                }}>
                  <div style={{
                    fontSize: '32px',
                    textAlign: 'center',
                    marginBottom: '15px'
                  }}>
                    🏆
                  </div>
                  <h3 style={{
                    textAlign: 'center',
                    margin: '0 0 15px 0',
                    fontSize: '20px',
                    color: '#4CAF50'
                  }}>
                    {league.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    fontSize: '14px',
                    color: '#cccccc'
                  }}>
                    <span>📊 Tabela</span>
                    <span>⚽ Mecze</span>
                    <span>👥 Drużyny</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Footer Info */}
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          marginBottom: '40px'
        }}>
          <h3 style={{ color: '#4CAF50', marginBottom: '20px' }}>
            📱 Co możesz sprawdzić?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>📊</div>
              <strong>Tabele ligowe</strong>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                Aktualne pozycje drużyn, punkty, bramki
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>⚽</div>
              <strong>Terminarz meczów</strong>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                Rozegrane i nadchodzące spotkania
              </p>
            </div>
            <div>
              <div style={{ fontSize: '24px', marginBottom: '10px' }}>🏅</div>
              <strong>Statystyki graczy</strong>
              <p style={{ margin: '5px 0 0 0', color: '#999', fontSize: '14px' }}>
                Top strzelcy i asystenci ligi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
