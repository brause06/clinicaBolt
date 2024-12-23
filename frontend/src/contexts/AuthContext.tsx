import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User } from '../types/user';
import { setAuthToken } from '../api/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      const userData: User = JSON.parse(storedUser);
      setUser(userData);
      setToken(storedToken);
      setIsAuthenticated(true);
      setAuthToken(storedToken);
    }
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setToken(newToken);
    setIsAuthenticated(true);
    setAuthToken(newToken);
  };

  const logout = () => {
    // Primero, establecemos el estado de autenticación a falso
    setIsAuthenticated(false);
    setUser(null);
    setToken(null);

    // Luego, redirigimos
    window.location.href = '/';

    // Finalmente, limpiamos el localStorage
    // Esto se ejecutará después de que la página comience a cargar
    setTimeout(() => {
      localStorage.clear();
    }, 0);
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
