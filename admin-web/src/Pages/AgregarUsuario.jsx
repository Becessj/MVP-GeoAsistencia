// src/pages/AgregarUsuario.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AttendanceTable from "../components/Table/AttendanceTable";
import AgregarUsuarioService from "../services/AgregarUsuarioService";

import "../styles/AgregarUsuario.css";

export default function AgregarUsuario() {
  const navigate = useNavigate();


  const [username, setUsername] = useState("");
  const [nombre, setNombre] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  const loadUsers = async () => {
    setLoadingList(true);
    try {
      const data = await AgregarUsuarioService.listUsers();
      const normalized = (data || []).map((u, idx) => ({
        id: u.id || u.key || u.uid || `local-${idx}-${Date.now()}`,
        name: u.name || u.nombre || u.displayName || "",
        username: u.username || u.email || "",
        role: u.role || "user",
        createdAt: u.createdAt || u.created || null,
        active: typeof u.active === "boolean" ? u.active : true,
      }));
      setUsers(normalized);
    } catch (err) {
      console.error("Error cargando usuarios:", err);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await AgregarUsuarioService.addUser({ username, nombre, role });
      setSuccess("Usuario creado correctamente.");
      setUsername("");
      setNombre("");
      setRole("user");
      await loadUsers();
    } catch (err) {
      setError(err?.message || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (row) => {
    try {
      await AgregarUsuarioService.updateUserStatus(row.id, !row.active);
      setUsers((prev) => prev.map((u) => (u.id === row.id ? { ...u, active: !u.active } : u)));
    } catch (err) {
      console.error("Error actualizando estado:", err);
      alert("No se pudo cambiar el estado");
    }
  };

  const filtered = useMemo(() => {
    if (!query) return users;
    const q = query.toLowerCase();
    return users.filter(
      (u) =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q) ||
        (u.role || "").toLowerCase().includes(q)
    );
  }, [users, query]);

  // columns para AttendanceTable
  const columns = [
    { key: "name", header: "Nombre", width: "30%" },
    { key: "username", header: "Usuario / Correo", width: "25%", ellipsis: true },
    { key: "role", header: "Rol", width: "12%" },
    {
      key: "createdAt",
      header: "Creado",
      width: "18%",
      render: (r) => (r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "-"),
    },
    {
      key: "active",
      header: "Estado",
      width: "10%",
      render: (r) => (
        <span style={{ color: r.active ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
          {r.active ? "ACTIVO" : "NO ACTIVO"}
        </span>
      ),
      align: "center",
    },
  ];

  const actions = (row) => (
    <div style={{ display: "flex", gap: 8 }}>
      <button className="btn ghost" onClick={() => handleToggleActive(row)}>
        {row.active ? "Desactivar" : "Activar"}
      </button>
    </div>
  );

  const toolbarLeft = (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <input
        placeholder="Buscar trabajador"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{ padding: 8, borderRadius: 6, border: "1px solid #e6e9ef", minWidth: 220 }}
      />
    </div>
  );

  const toolbarRight = (
    <div style={{ display: "flex", gap: 8 }}>
      <button
        className="btn primary"
        onClick={() => {
          const el = document.querySelector(".add-user-card");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }}
      >
        Agregar nuevo usuario
      </button>
      <button className="btn ghost" onClick={() => loadUsers()} disabled={loadingList}>
        {loadingList ? "Cargando..." : "Actualizar lista"}
      </button>
    </div>
  );

  // Si no quieres proteger por userData, comenta/borra la siguiente línea:
  // if (!userData) return null;

  return (
    <div className="add-user-page">
      <div className="add-user-card">
        <h2>Agregar usuario</h2>
        <p className="hint">Crea un nuevo usuario para el sistema (frontend).</p>

        <form onSubmit={handleSubmit} className="add-user-form">
          <div className="form-row">
            <label>Nombre completo</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>Usuario (username o correo)</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>

          <div className="form-row">
            <label>Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <div className="actions" style={{ marginBottom: 18 }}>
            <button type="submit" className="btn primary" disabled={loading}>
              {loading ? "Creando..." : "Crear usuario"}
            </button>
            <button type="button" className="btn ghost" onClick={() => navigate("/asistencia")}>
              Cancelar
            </button>
          </div>
        </form>

        <hr style={{ margin: "18px 0" }} />

        <AttendanceTable
          columns={columns}
          rows={filtered}
          loading={loadingList}
          emptyText="Sin usuarios"
          actions={actions}
          toolbarLeft={toolbarLeft}
          toolbarRight={toolbarRight}
          getRowKey={(r) => r.id}
          dense={false}
        />
      </div>
    </div>
  );
}
