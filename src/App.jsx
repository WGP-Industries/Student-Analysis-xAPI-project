import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

import { login, setLoading, selectIsAdmin } from "./store/features/authSlice";
import api from "./configs/api";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminEnrollments from "./pages/admin/AdminEnrollments";
import AdminStatements from "./pages/admin/AdminStatements";

// Blocks rendering until rehydration is complete.
// Prevents route guards from firing before /api/user/me resolves.
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
};

const ProtectedAdmin = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  const isAdmin = useSelector(selectIsAdmin);
  if (isLoading) return null;
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

// Redirects already-authenticated users away from /login
const PublicRoute = ({ children }) => {
  const { isLoggedIn, isLoading } = useSelector((s) => s.auth);
  const isAdmin = useSelector(selectIsAdmin);
  if (isLoading) return null;
  if (isLoggedIn)
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  return children;
};

const App = () => {
  const dispatch = useDispatch();

  const rehydrateUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      dispatch(setLoading(false));
      return;
    }
    dispatch(setLoading(true));
    try {
      const { data } = await api.get("/api/user/me");
      if (data.user) dispatch(login(data.user));
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
      }
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    rehydrateUser();
  }, []);

  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedAdmin>
              <AdminLayout />
            </ProtectedAdmin>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
          <Route path="statements" element={<AdminStatements />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;
