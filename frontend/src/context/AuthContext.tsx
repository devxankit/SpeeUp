import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAuthToken, removeAuthToken } from "../services/api/config";

interface User {
  id: string;
  [key: string]: any;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state synchronously from localStorage to prevent redirect issues
  const initializeAuth = () => {
    const storedToken = getAuthToken();
    const storedUser = localStorage.getItem("userData");

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return {
          token: storedToken,
          user: userData,
          isAuthenticated: true,
        };
      } catch (error) {
        // Invalid stored data, clear it
        removeAuthToken();
      }
    }
    return {
      token: null,
      user: null,
      isAuthenticated: false,
    };
  };

  const initialAuth = initializeAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(
    initialAuth.isAuthenticated
  );
  const [user, setUser] = useState<User | null>(initialAuth.user);
  const [token, setToken] = useState<string | null>(initialAuth.token);

  // Re-check on mount to handle any edge cases
  useEffect(() => {
    const storedToken = getAuthToken();
    const storedUser = localStorage.getItem("userData");

    if (storedToken && storedUser && !isAuthenticated) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        // Invalid stored data, clear it
        removeAuthToken();
      }
    } else if (!storedToken && isAuthenticated) {
      // Token was removed, clear auth state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  }, [isAuthenticated]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    removeAuthToken();
  };

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem("userData", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        login,
        logout,
        updateUser,
      }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
