import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  login as loginRequest,
  logout as logoutRequest,
  refreshToken as refreshTokenRequest,
} from "../services/authService";

import { getProfile } from "../services/userService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    () => localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  // Restore authentication when the application starts
  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("accessToken");

      // No access token means there is no active session
      if (!storedToken) {
        setLoading(false);
        return;
      }

      try {
        // Try using the existing access token
        const response = await getProfile();

        setUser(response.data.user);
      } catch {
        try {
          // Access token may have expired.
          // Try getting a new one using the HTTP-only refresh cookie.
          const response = await refreshTokenRequest();

          const newToken = response.data.token;

          localStorage.setItem("accessToken", newToken);

          setToken(newToken);

          // Get the user after refreshing the token
          const profileResponse = await getProfile();

          setUser(profileResponse.data.user);
        } catch {
          // Refresh token is invalid/expired.
          // Log the user out locally.
          localStorage.removeItem("accessToken");

          setToken(null);
          setUser(null);
        }
      } finally {
        setLoading(false);
      }
    };

    restoreSession();
  }, []);

  // Login
  const login = async (email, password) => {
    setLoading(true);

    try {
      const response = await loginRequest({
        email,
        password,
      });

      const { token, data } = response.data;

      // Save access token
      localStorage.setItem("accessToken", token);

      // Update React state
      setToken(token);
      setUser(data);

      return {
        success: true,
        user: data,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    setLoading(true);

    try {
      await logoutRequest();
    } finally {
      // Remove local authentication state
      localStorage.removeItem("accessToken");

      setToken(null);
      setUser(null);

      setLoading(false);
    }
  };

  // Manually refresh authentication
  const refreshAuth = async () => {
    try {
      const response = await refreshTokenRequest();

      const newToken = response.data.token;

      localStorage.setItem("accessToken", newToken);

      setToken(newToken);

      // Get updated user information
      const profileResponse = await getProfile();

      setUser(profileResponse.data.user);

      return newToken;
    } catch (error) {
      localStorage.removeItem("accessToken");

      setToken(null);
      setUser(null);

      throw error;
    }
  };

  // Merge updated profile fields (name, email, picture) into the logged-in user,
  // so the top bar and other pages reflect changes without a reload
  const updateUser = (changes) => {
    setUser((current) => (current ? { ...current, ...changes } : current));
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token,

    login,
    logout,
    refreshAuth,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook. Kept next to the provider so existing imports keep working;
// the rule only affects hot reload of this file during development.
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};