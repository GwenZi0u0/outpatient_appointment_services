import { create } from "zustand";
import { createContext, useContext, useEffect, useMemo } from "react";
import { fireAuth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const createAuthStore = () =>
  create((set) => ({
    user: null,
    loading: true,
    error: null,

    signInWithEmail: async (email, password) => {
      try {
        const result = await signInWithEmailAndPassword(
          fireAuth,
          email,
          password
        );
        set({ user: result.user, error: null, loading: false });
      } catch (error) {
        set({ error: error.message, loading: false });
        console.error("Error signing in:", error);
      }
    },

    signOut: async () => {
      try {
        await fireAuth.signOut();
        set({ user: null, error: null });
      } catch (error) {
        set({ error: error.message });
        console.error("Error signing out:", error);
      }
    },

    listenToAuthState: () => {
      const unsubscribe = fireAuth.onAuthStateChanged((user) => {
        set({ user, loading: false });
      });
      return unsubscribe;
    },
  }));

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const store = useMemo(() => createAuthStore(), []);

  useEffect(() => {
    const unsubscribe = store.getState().listenToAuthState();
    return () => unsubscribe();
  }, [store]);

  return <AuthContext.Provider value={store}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return store();
};
