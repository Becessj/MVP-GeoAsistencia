// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/auth.css"; // o index.css
import { AuthProvider } from "./contexts/AuthContext"; // si lo tienes

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider> {/* si no usas AuthProvider, elimina esta línea y su cierre */}
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
