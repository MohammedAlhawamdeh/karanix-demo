'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { login, LoginResponse } from '../lib/api';

interface AuthState {
  guide?: LoginResponse;
  driver?: LoginResponse;
  loading: boolean;
  error?: string;
}

const AuthContext = createContext<AuthState>({ loading: true });

const guideEmail = process.env.NEXT_PUBLIC_GUIDE_EMAIL || 'guide@example.com';
const guidePassword = process.env.NEXT_PUBLIC_GUIDE_PASSWORD || 'guide123';
const driverEmail = process.env.NEXT_PUBLIC_DRIVER_EMAIL || 'driver@example.com';
const driverPassword = process.env.NEXT_PUBLIC_DRIVER_PASSWORD || 'driver123';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AuthState>({ loading: true });

  useEffect(() => {
    const load = async () => {
      try {
        const [guide, driver] = await Promise.all([
          login(guideEmail, guidePassword),
          login(driverEmail, driverPassword)
        ]);

        setState({ guide, driver, loading: false });
      } catch (err) {
        setState({
          loading: false,
          error: err instanceof Error ? err.message : 'Auth failed'
        });
      }
    };
    load();
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
