import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { bootstrapLocalData, loginUser, preloadWorkspaceData, registerUser, restoreUserSession, signOutUser } from "../services/dataService";
import { removeItem, saveItem } from "../services/storage";

const AuthContext = createContext(null);

// Stores the signed-in user and exposes simple auth actions to the rest of the app.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load demo data first, then restore the last known user session.
    bootstrapLocalData()
      .then(() => restoreUserSession())
      .then((storedUser) => {
        setUser(storedUser);

        if (storedUser) {
          // Warm up the rest of the workspace after the first screen is usable.
          void preloadWorkspaceData(storedUser);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isSubmitting,
      signIn: async (email, password) => {
        setIsSubmitting(true);
        try {
          const nextUser = await loginUser(email, password);
          setUser(nextUser);
          await saveItem("currentUser", nextUser);
          // Preload other screens in the background after a successful login.
          void preloadWorkspaceData(nextUser);
          return nextUser;
        } finally {
          setIsSubmitting(false);
        }
      },
      signUp: async (payload) => {
        setIsSubmitting(true);
        try {
          const nextUser = await registerUser(payload);
          setUser(nextUser);
          await saveItem("currentUser", nextUser);
          void preloadWorkspaceData(nextUser);
          return nextUser;
        } finally {
          setIsSubmitting(false);
        }
      },
      signOut: async () => {
        setIsSubmitting(true);
        try {
          await signOutUser();
          setUser(null);
          await removeItem("currentUser");
        } finally {
          setIsSubmitting(false);
        }
      }
    }),
    [loading, user, isSubmitting]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

