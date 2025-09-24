// src/components/Table/AttendanceTable.jsx
import React from "react";
import "../../styles/table.css"; // Estilos propios de la tabla

export default function AttendanceTable({
  columns = [],
  rows = [],
  loading = false,
  emptyText = "Sin registros",
  actions,
  onExport,
  toolbarLeft,
  toolbarRight,
  getRowKey,
  dense = false,
}) {
  const keyGetter = getRowKey || ((row, i) => row.id ?? i);

  return (
    <div className="att-card card">
      {(toolbarLeft || toolbarRight || onExport) && (
        <div className="att-toolbar toolbar" style={{ gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {toolbarLeft}
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {toolbarRight}
            {onExport && (
              <button className="btn primary" onClick={onExport}>
                Generar reporte
              </button>
            )}
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto" }}>
        <table className={`att-table table ${dense ? "table--dense" : ""}`}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{
                    width: c.width,
                    textAlign: c.align || "left",
                    whiteSpace: "nowrap",
                  }}
                >
                  {c.header}
                </th>
              ))}
              {actions && <th style={{ width: 40 }} />}
            </tr>
          </thead>

          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} style={{ textAlign: "center" }}>
                  Cargando...
                </td>
              </tr>
            )}

            {!loading && rows.length === 0 && (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="empty">
                  {emptyText}
                </td>
              </tr>
            )}

            {!loading &&
              rows.map((row, idx) => (
                <tr key={keyGetter(row, idx)}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      style={{ textAlign: c.align || "left" }}
                      className={c.ellipsis ? "ellipsis" : undefined}
                      title={c.ellipsis ? (row[c.key] ?? "") : undefined}
                    >
                      {c.render ? c.render(row) : row[c.key]}
                    </td>
                  ))}
                  {actions && <td className="actions">{actions(row)}</td>}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
