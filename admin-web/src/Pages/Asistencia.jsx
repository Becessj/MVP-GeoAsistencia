// src/pages/Asistencia.jsx
import { useEffect, useMemo, useState } from "react";
import AttendanceTable from "../components/Table/AttendanceTable";
import { fetchAsistenciaByMonth, fmtFechaCorta } from "../services/asistenciaService";
//import "../styles/asistencia.css";
import "../components/Layout/Sidebar"
import * as XLSX from "xlsx";

const MESES = [
  { v: 0,  t: "Todos" },
  { v: 1,  t: "Enero" }, { v: 2,  t: "Febrero" }, { v: 3,  t: "Marzo" },
  { v: 4,  t: "Abril" }, { v: 5,  t: "Mayo" }, { v: 6,  t: "Junio" },
  { v: 7,  t: "Julio" }, { v: 8,  t: "Agosto" }, { v: 9,  t: "Septiembre" },
  { v: 10, t: "Octubre" }, { v: 11, t: "Noviembre" }, { v: 12, t: "Diciembre" },
];

// Helpers Excel
function formatDateForExcel(dateLike) {
  if (!dateLike) return "";
  const d = dateLike instanceof Date ? dateLike : new Date(dateLike);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear();
  return `${dd}-${mm}-${yy}`;
}

function buildSheetData(rowsArray) {
  return rowsArray.map((r) => ({
    Usuario: r.usuario || "",
    Salida: r.salida || "",
    Responsable: r.responsable || "",
    Mes: r.mes ? (MESES[r.mes]?.t || r.mes) : "",
    Desde: formatDateForExcel(r.desde),
    Hasta: formatDateForExcel(r.hasta),
    "Tipo permiso": r.tipoPermiso || "",
    Justificación: r.justificacion || "",
  }));
}

function exportMonthToExcel(selectedMonth, rowsToExport, mesLabel) {
  const ws = XLSX.utils.json_to_sheet(buildSheetData(rowsToExport));
  const wb = XLSX.utils.book_new();
  const sheetName = selectedMonth === 0 ? "Todos" : mesLabel;
  XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0,31));
  XLSX.writeFile(wb, `asistencia_${sheetName}.xlsx`);
}

export default function Asistencia() {
  const [month, setMonth] = useState(new Date().getMonth() + 1); // inicia en mes actual
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const mesLabel = useMemo(
    () => MESES.find((x) => x.v === Number(month))?.t ?? "Mes",
    [month]
  );

// Cargar data cada vez que cambia el mes
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const monthParam = Number(month) === 0 ? null : Number(month);
        const data = await fetchAsistenciaByMonth(monthParam);
        setRows(data);
      } catch (e) {
        console.error(e);
        setError("No se pudieron cargar los datos.");
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [month]);

// Definición de columnas para la tabla
  const columns = [
    { key: "usuario", header: "Usuario", render: (r) => (
      <div className="usercell"><span className="avatar" />{r.usuario}</div>
    )},
    { key: "salida", header: "Salida" },
    { key: "responsable", header: "Responsable" },
    { key: "mes", header: "Mes", render: (r) => (r.mes ? (MESES[r.mes]?.t ?? "") : "") },
    { key: "desde", header: "Desde", render: (r) => fmtFechaCorta(r.desde) },
    { key: "hasta", header: "Hasta", render: (r) => fmtFechaCorta(r.hasta) },
    { key: "tipoPermiso", header: "Tipo permiso" },
    { key: "justificacion", header: "Justificación", ellipsis: true },
  ];

  return (
    <div className="page">
      <h1 className="page-title">Control de Asistencia – Campo</h1>

      {error && <div style={{ padding: 12, color: "#a00f0f" }}>{error}</div>}

      <AttendanceTable
        columns={columns}
        rows={rows}
        loading={loading}
        emptyText="Sin registros"
        toolbarLeft={
          <div className="select">
            <span role="img" aria-label="calendar">📅</span>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {MESES.map((m) => (
                <option key={m.v} value={m.v}>{m.t}</option>
              ))}
            </select>
            <span className="select__label">{mesLabel}</span>
          </div>
        }
        onExport={() => exportMonthToExcel(month, rows, mesLabel)}
        getRowKey={(r, i) => r.id ?? `${r.usuario}-${i}`}
      />
    </div>
  );
}
