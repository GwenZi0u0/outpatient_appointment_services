import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function ProtectedLayout() {
  const { user, loading, signOut } = useAuth((state) => ({
    user: state.user,
    loading: state.loading,
  }));

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    return (
      <>
        <div>
          <header>
            <button onClick={signOut}>Sign Out</button>
          </header>
          <main></main>
        </div>
        <Outlet />
      </>
    );
  }

  return <Navigate to="/login" replace />;
}
