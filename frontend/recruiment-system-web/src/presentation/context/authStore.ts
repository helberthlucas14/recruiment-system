import React from 'react';

import type { LoginInput, RegisterInput, User } from '../../domain/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (data: LoginInput) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

