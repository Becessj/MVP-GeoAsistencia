// src/components/Layout/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function ProtectedRoute({ children }) {
  const { userData, loading } = useAuth();

  if (loading) return <div>Cargando...</div>; // opcional: puedes mostrar un spinner

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
