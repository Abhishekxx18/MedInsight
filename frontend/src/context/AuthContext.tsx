import api from "@/lib/api";
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import type { AxiosError } from "axios";
import axios from "axios";
import { createContext, useContext, useState, useEffect } from "react";
import { useNotification } from "./Notification";

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  provider: "google" | "email";
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { showNotification } = useNotification();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/sign-in", {
        email,
        password,
      });

      setUser(data.user_data);
      localStorage.setItem("user", JSON.stringify(data.user_data));
      localStorage.setItem("token", data.token);
    } catch (error) {
      const message =
        ((error as AxiosError).response?.data as { error: string })?.error ||
        (error as AxiosError).message;

      showNotification(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    picture: string = "",
    provider: "google" | "email" = "email"
  ) => {
    setIsLoading(true);
    try {
      const { data } = await api.post("/api/sign-up", {
        name,
        email,
        password,
        provider,
        avatar: picture,
      });

      setUser(data.user_data);
      localStorage.setItem("user", JSON.stringify(data.user_data));
      localStorage.setItem("token", data.token);
    } catch (error) {
      const message =
        ((error as AxiosError).response?.data as { error: string })?.error ||
        (error as AxiosError).message;

      if (message == "Email already registered" && provider == "google") {
        try {
          return await login(email, password);
        } catch (error) {
          const loginError =
            ((error as AxiosError).response?.data as { error: string })
              ?.error || (error as AxiosError).message;

          showNotification(loginError, "error");
        }
      }
      const registrationError =
        ((error as AxiosError).response?.data as { error: string })?.error ||
        (error as AxiosError).message;

      showNotification(registrationError, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      if (tokenResponse.token_type === "Bearer") {
        const { data } = await axios.get(
          `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`,
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
              Accept: "application/json",
            },
          }
        );
        const { email, name, picture, id } = data;
        await register(email, id, name, picture, "google");
      } else {
        throw new Error("Invalid token type");
      }
    },
  });

  const logout = async () => {
    try {
      await api.post("/api/sign-out");
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (user?.provider == "google") {
        googleLogout();
      }
    } catch (error) {
      const message =
        ((error as AxiosError).response?.data as { error: string })?.error ||
        (error as AxiosError).message;
      showNotification(message, "error");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        loginWithGoogle,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
