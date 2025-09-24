// src/pages/AsistenciaLocal.jsx
import { useEffect, useMemo, useState } from "react";
import AttendanceTable from "../components/Table/AttendanceTable";
import { fetchLocalAttendance } from "../services/localAttendanceService";
import "../styles/asistencia.css";

import * as XLSX from "xlsx";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MESES = [
  { v: 0,  t: "Todos" },
  { v: 1,  t: "Enero" }, { v: 2,  t: "Febrero" }, { v: 3,  t: "Marzo" },
  { v: 4,  t: "Abril" }, { v: 5,  t: "Mayo" }, { v: 6,  t: "Junio" },
  { v: 7,  t: "Julio" }, { v: 8,  t: "Agosto" }, { v: 9,  t: "Septiembre" },
  { v: 10, t: "Octubre" }, { v: 11, t: "Noviembre" }, { v: 12, t: "Diciembre" },
];

// Convierte un Date a "dd-mm-yyyy" (para comparar con r.fecha)
function toKey(dateObj) {
  const d = new Date(dateObj);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

function buildSheetDataLocal(rowsArray) {
  return rowsArray.map((r) => ({
    Usuario: r.usuario || "",
    Fecha: r.fecha || "",
    Entrada: r.entrada ?? "No registrado",
    Salida: r.salida ?? "No registrado",
   // "Oficina (In)": r.oficinaEntrada ?? "-",
    //"Oficina (Out)": r.oficinaSalida ?? "-",
    //Observaciones: r.observaciones || "-",
  }));
}

function exportLocalToExcel({ mode, month, day, mesLabel, rows }) {
  const ws = XLSX.utils.json_to_sheet(buildSheetDataLocal(rows));
  ws["!cols"] = [
    { wch: 22 }, // Usuario
    { wch: 12 }, // Fecha
    { wch: 12 }, // Entrada
    { wch: 12 }, // Salida
    //{ wch: 16 }, // Oficina (In)
    //{ wch: 16 }, // Oficina (Out)
    //{ wch: 40 }, // Observaciones
  ];

  const wb = XLSX.utils.book_new();

  if (mode === "day") {
    const dayKey = toKey(day);
    XLSX.utils.book_append_sheet(wb, ws, dayKey.substring(0,31));
    XLSX.writeFile(wb, `asistencia_local_${dayKey}.xlsx`);
  } else {
    const sheetName = month === 0 ? "Todos" : mesLabel;
    XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0,31));
    XLSX.writeFile(wb, `asistencia_local_${sheetName}.xlsx`);
  }
}

export default function AsistenciaLocal() {
  // mode: 'month' | 'day'
  // Cambié valor por defecto a 'day' para mostrar día primero
  const [mode, setMode] = useState("day");
  const [day, setDay] = useState(new Date()); // día actual
  const [month, setMonth] = useState(new Date().getMonth() + 1); // mes actual (será actualizado si cambias day)
  const [rows, setRows] = useState([]);
  const [allRowsForMonth, setAllRowsForMonth] = useState([]); // cache para filtrar por día
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mesLabel = useMemo(
    () => MESES.find((x) => x.v === Number(month))?.t ?? "Mes",
    [month]
  );

  // Carga base: por mes (incluso en modo día, pedimos el mes del día seleccionado y filtramos)
  const load = async (m) => {
    setLoading(true);
    setError("");
    try {
      const monthParam = m === 0 ? null : m;
      const data = await fetchLocalAttendance({ month: monthParam });
      setAllRowsForMonth(data);
      // Si estamos en modo día, filtramos; si no, mostramos todo el mes
      if (mode === "day") {
        const key = toKey(day);
        setRows(data.filter((r) => (r.fecha || "") === key));
      } else {
        setRows(data);
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar asistencia local.");
      setRows([]);
      setAllRowsForMonth([]);
    } finally {
      setLoading(false);
    }
  };

  // Carga inicial / cuando cambia el modo
  useEffect(() => {
    if (mode === "day") {
      const m = new Date(day).getMonth() + 1;
      setMonth(m);
      load(m);
    } else {
      load(month);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // Si cambia el mes en modo mes -> recargar
  useEffect(() => {
    if (mode === "month") {
      load(month);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  // Si cambia el día en modo día -> recargar (mínimo el filtro)
  useEffect(() => {
    if (mode === "day") {
      const m = new Date(day).getMonth() + 1;
      // Si cambió también el mes del día, volvemos a pedir datos para ese mes
      if (m !== month) {
        setMonth(m);
        load(m);
      } else {
        const key = toKey(day);
        setRows(allRowsForMonth.filter((r) => (r.fecha || "") === key));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [day]);

  const columnsLocal = [
    { key: "usuario", header: "Usuario" },
    { key: "fecha", header: "Fecha" },
    { key: "entrada", header: "Entrada", render: (r) => r.entrada ?? "No registrado" },
    { key: "salida", header: "Salida", render: (r) => r.salida ?? "No registrado" },
    //{ key: "oficinaEntrada", header: "Oficina (In)", render: (r) => r.oficinaEntrada ?? "-" },
    //{ key: "oficinaSalida", header: "Oficina (Out)", render: (r) => r.oficinaSalida ?? "-" },
    //{ key: "observaciones", header: "Observaciones", render: (r) => r.observaciones || "-" },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Control de Asistencia – Oficina</h1>

      {error && <div style={{ padding: 12, color: "#a00f0f" }}>{error}</div>}

      <AttendanceTable
        columns={columnsLocal}
        rows={rows}
        loading={loading}
        emptyText={mode === "day" ? "Sin registros para el día" : "Sin registros"}
        toolbarLeft={
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            {/* Toggle Día / Mes con "Por día" primero */}
            <div className="btn-group" style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                className={`btn ${mode === "day" ? "primary" : ""}`}
                onClick={() => setMode("day")}
              >
                Por día
              </button>
              <button
                type="button"
                className={`btn ${mode === "month" ? "primary" : ""}`}
                onClick={() => setMode("month")}
              >
                Por mes
              </button>
            </div>

            {/* Selector según modo: si modo day -> DatePicker, si modo month -> select */}
            {mode === "day" ? (
              <div className="select" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="select__icon">📅</span>
                <DatePicker
                  selected={day}
                  onChange={(d) => setDay(d)}
                  dateFormat="dd-MM-yyyy"
                  placeholderText="Selecciona un día"
                />
                <span className="select__label">{toKey(day)}</span>
              </div>
            ) : (
              <div className="select">
                <span className="select__icon">📅</span>
                <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                  {MESES.map((m) => (
                    <option key={m.v} value={m.v}>{m.t}</option>
                  ))}
                </select>
                <span className="select__label">{mesLabel}</span>
              </div>
            )}
          </div>
        }
        onExport={() =>
          exportLocalToExcel({
            mode,
            month,
            day,
            mesLabel,
            rows,
          })
        }
        getRowKey={(r, i) => r.id ?? `${r.usuario}-${r.fecha}-${i}`}
      />
    </div>
  );
}
