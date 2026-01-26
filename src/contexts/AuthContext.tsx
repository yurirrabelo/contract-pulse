import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { saveToStorage, loadFromStorage, removeFromStorage } from '@/lib/storage';
import { seedUsers } from '@/data/seedData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'auth_user';
const USERS_KEY = 'users';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize users if not present
    const storedUsers = loadFromStorage<User[]>(USERS_KEY, []);
    if (storedUsers.length === 0) {
      saveToStorage(USERS_KEY, seedUsers);
    }

    // Check for existing session
    const storedUser = loadFromStorage<User | null>(STORAGE_KEY, null);
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = loadFromStorage<User[]>(USERS_KEY, seedUsers);
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (foundUser) {
      // In a real app, we'd verify the password hash
      // For demo, any password works for existing users
      setUser(foundUser);
      saveToStorage(STORAGE_KEY, foundUser);
      return true;
    }

    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    removeFromStorage(STORAGE_KEY);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const users = loadFromStorage<User[]>(USERS_KEY, seedUsers);
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    };

    const updatedUsers = [...users, newUser];
    saveToStorage(USERS_KEY, updatedUsers);
    setUser(newUser);
    saveToStorage(STORAGE_KEY, newUser);

    return true;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
