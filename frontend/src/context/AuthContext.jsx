import { createContext, useContext, useState } from 'react';
import client from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('rektelier_admin_token'));

  async function login(username, password) {
    const res = await client.post('/auth/login', { username, password });
    localStorage.setItem('rektelier_admin_token', res.data.token);
    setToken(res.data.token);
    return res.data;
  }

  function logout() {
    localStorage.removeItem('rektelier_admin_token');
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}