// src/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Layout from "./components/Layout/Layout";
// páginas (asegúrate que existan en src/pages)
import Asistencia from "./Pages/Asistencia.jsx";
import AsistenciaLocal from "./Pages/AsistenciaLocal.jsx";
import AgregarUsuario from "./Pages/AgregarUsuario.jsx";
import Login from "./Pages/Login.jsx";

export default function App() {
  return (
    <Routes>
      {/* redirige '/' a /login para que el login sea la primera página */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ruta de login (fuera del layout) */}
      <Route path="/login" element={<Login />} />

      {/* Rutas que usan el layout (sidebar + header) */}
      <Route element={<Layout />}>
        {/* Modificacion temporal) */}
        <Route path="/asistencia" element={<AsistenciaLocal />} />
        <Route path="/asistencia-local" element={<Asistencia />} />
        <Route path="/agregar-usuario" element={<AgregarUsuario />} />
      </Route>

      {/* catch-all: si ponen otra ruta, los envío al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
