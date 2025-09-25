// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    setLoading(true);
    try {
      // No hacemos ninguna validación ni guardado.
      // Simplemente navegamos a la página de asistencia.
      navigate("/asistencia", { replace: true });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    alert("Integrar login con Google (opcional).");
  };

  return (
    <div className="auth-page">
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <h1>Control de asistencia en GPA</h1>
          <div className="role">Administrador</div>
          <div className="hint">Presiona "Iniciar sesión" para continuar</div>

          <form className="auth-form" onSubmit={handleSubmit}>
            {/* Inputs decorativos */}
            <input
              type="email"
              placeholder="correo@dominio.com (opcional)"
              aria-label="usuario"
            />

            <input
              type="password"
              placeholder="contraseña (opcional)"
              aria-label="contraseña"
            />

            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </button>

            <div className="divider">o continuar con</div>

            <button
              type="button"
              className="google-btn"
              onClick={handleGoogle}
              disabled={loading}
            >
              <span className="g-icon">G</span>
              Google
            </button>

            <div className="auth-legal">
              Al hacer clic en Continuar aceptas nuestros <br />
              <strong>Términos de servicio</strong> y la <strong>Política de privacidad</strong>
            </div>

            <div style={{ marginTop: 12 }}>
              <Link to="/register" style={{ color: "rgba(255,255,255,0.9)", textDecoration: "underline" }}>
                Crear cuenta
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
