import React from "react";
import "./header.css";

export default function Header({ title = "REGISTRO Y CONTROL DE ASISTENCIA" }) {
  return (
    <header className="header">
      <div className="header__left"></div>

      <div className="header__center">
        <h1 className="header__title">{title}</h1>
      </div>

      <div className="header__right">
        <div className="userbox">
          <div className="userbox__name">Oscar</div>
          <div className="userbox__role">Administrador</div>
          <div className="userbox__avatar" />
        </div>
      </div>
    </header>
  );
}
