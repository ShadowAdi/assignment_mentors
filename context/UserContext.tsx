"use client";
import { GetUser, verifyToken } from "@/app/_actions/UserAction";
import { UserRole } from "@/lib/types";
import { User } from "@prisma/client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface UserContextType {
  user: User | null|undefined;
  setUser: (user: User | null|undefined) => void;
  isLoading: boolean;
  authenticated: boolean;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const userContext = createContext<UserContextType | undefined>(undefined);

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null|undefined>(null);
  const [authenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const GetVerifyToken = async (token: string) => {
    const { isAuthenticated, decodedToken, message } = await verifyToken(token);
    return { isAuthenticated, decodedToken, message };
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        setUser(null);
        return;
      }

      // Await the result of GetVerifyToken to get the values
      const { isAuthenticated, decodedToken, message } = await GetVerifyToken(
        token
      );
      let getUserById;
      if (decodedToken?.userId) {
        getUserById = await GetUser(decodedToken?.userId);
      }
      switch (message) {
        case "TOKEN_NOT_FOUND":
        case "TOKEN_NOT_PRESENT":
        case "ERROR_IN_TOKEN":
          setIsAuthenticated(isAuthenticated);
          setIsLoading(false);
          setUser(null);
          break;

        case "TOKEN_FOUND":
          setIsAuthenticated(isAuthenticated);
          setIsLoading(false);
          setUser(getUserById);
          break;

        default:
          setIsAuthenticated(isAuthenticated);
          setIsLoading(false);
          setUser(null);
          break;
      }
    };

    fetchUser();
  }, []);

  return (
    <userContext.Provider
      value={{
        user,
        setUser,
        isLoading,
        authenticated,
        setIsAuthenticated,
        setIsLoading,
      }}
    >
      {children}
    </userContext.Provider>
  );
};

export const useContextHook = () => {
  const context = useContext(userContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserContextProvider");
  }
  return context;
};
