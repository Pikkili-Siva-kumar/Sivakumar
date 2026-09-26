import { createContext } from 'react';

export const AuthContext = createContext(null);
export const TOKEN_STORAGE_KEY = 'auth_token';

export default AuthContext;
