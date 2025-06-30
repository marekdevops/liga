import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Sprawdź czy użytkownik jest zalogowany (localStorage)
    const token = localStorage.getItem('authToken');
    console.log('AuthContext: Checking token:', token);
    if (token) {
      console.log('AuthContext: Token found, setting authenticated to true');
      setIsAuthenticated(true);
    } else {
      console.log('AuthContext: No token found, setting authenticated to false');
    }
    setIsLoading(false);
  }, []);

  const login = (username, password) => {
    console.log('AuthContext: Attempting login with:', username, password);
    // Prosta autoryzacja - w rzeczywistej aplikacji byłoby to zapytanie do API
    if (username === 'admin' && password === 'admin123') {
      console.log('AuthContext: Login successful');
      localStorage.setItem('authToken', 'fake-jwt-token');
      setIsAuthenticated(true);
      return true;
    }
    console.log('AuthContext: Login failed');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
