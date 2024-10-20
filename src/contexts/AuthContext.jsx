import { signInWithEmailAndPassword } from "firebase/auth";
import { createContext, useContext, useEffect } from "react";
import { create } from "zustand";
import { fireAuth } from "../firebase";

const useAuthStore = create((set) => ({
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
  useEffect(() => {
    const unsubscribe = useAuthStore.getState().listenToAuthState();
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={useAuthStore}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const store = useContext(AuthContext);
  if (!store) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return {
    user: store((state) => state.user),
    loading: store((state) => state.loading),
    error: store((state) => state.error),
    signInWithEmail: store((state) => state.signInWithEmail),
    signOut: store((state) => state.signOut),
  };
};
