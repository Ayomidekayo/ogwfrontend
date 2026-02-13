// import React from "react";
// import { Navigate, Outlet } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const ProtectedRoutes = ({ requireRole = [] }) => {
//   const { user } = useAuth();
//   console.log("ProtectedRoutes - Current User:", user);

//   // Still loading user from localStorage
//   if (user === undefined) return <div>Loading...</div>;

//   // Not logged in
//   if (!user) return <Navigate to="/login" replace />;

//   // Role not allowed
//   if (requireRole.length > 0 && !requireRole.includes(user.role)) {
//     console.warn("ProtectedRoutes - Unauthorized role:", user.role);
//     return <Navigate to="/unauthorized" replace />;
//   }

//   // All good
//   return <Outlet />;
// };

// export default ProtectedRoutes;

import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoutes = ({ requireRole = [] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>; // ✅ wait until AuthProvider finishes

  if (!user) return <Navigate to="/login" replace />;

  if (requireRole.length > 0 && !requireRole.includes(user.role)) {
    console.warn("ProtectedRoutes - Unauthorized role:", user.role);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoutes;
