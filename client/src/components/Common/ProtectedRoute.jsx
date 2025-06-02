import React from "react";
import { Navigate } from "react-router-dom";
import { getCurrentUser } from "../../services/auth";

function ProtectedRoute({ children, allowedRoles }) {
  const user = getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
