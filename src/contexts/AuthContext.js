import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bootstrapLocalData, loginUser, preloadWorkspaceData, registerUser, restoreUserSession, signOutUser } from "../services/dataService";
import { removeItem, saveItem } from "../services/storage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrapLocalData()
      .then(() => restoreUserSession())
      .then((storedUser) => {
        setUser(storedUser);

        if (storedUser) {
          void preloadWorkspaceData(storedUser);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      signIn: async (email, password) => {
        const nextUser = await loginUser(email, password);
        setUser(nextUser);
        await saveItem("currentUser", nextUser);
        void preloadWorkspaceData(nextUser);
        return nextUser;
      },
      signUp: async (payload) => {
        const nextUser = await registerUser(payload);
        setUser(nextUser);
        await saveItem("currentUser", nextUser);
        void preloadWorkspaceData(nextUser);
        return nextUser;
      },
      signOut: async () => {
        await signOutUser();
        setUser(null);
        await removeItem("currentUser");
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
