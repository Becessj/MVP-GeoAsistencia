// src/components/Layout/Sidebar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import "./sidebar.css"; // opcional: estilos (puedes usar asistencia.css)

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__role">ADMINISTRADOR</div>
      <nav className="sidebar__nav">
        <NavLink to="/asistencia" end className={({ isActive }) => isActive ? "navbtn active" : "navbtn"}>
          Asistencia Local
        </NavLink>

        <NavLink to="/asistencia-local" className={({ isActive }) => isActive ? "navbtn active" : "navbtn"}>
          Asistencia De Campo
        </NavLink>

        <NavLink to="/agregar-usuario" className={({ isActive }) => isActive ? "navbtn active" : "navbtn"}>
          Agregar Usuario
        </NavLink>

        <NavLink to="/login" className="navbtn danger">
          Salir
        </NavLink>
      </nav>
    </aside>
  );
}
