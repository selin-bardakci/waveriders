'use client';

import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';

interface AuthContextType {
  user: any;
  setUser: (user: any) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (status: boolean) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8081/api/users/profile', {
            headers: { Authorization: Bearer ${token} },
          });
          setUser(response.data);
          setIsLoggedIn(true);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setUser(null);
          setIsLoggedIn(false);
          localStorage.removeItem('token'); // Hatalı token durumunda temizle
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
      setIsLoading(false); // Yükleme tamamlandı
    };

    fetchUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
