// src/services/AgregarUsuarioService.js
import { ref, get, child, push, set } from "firebase/database";
import { db as rtdb } from "../firebase";

const MOCK_KEY = "mock_users_v1";

/* ---------- Helpers mock (fallback) ---------- */
async function mockAddUser(payload) {
  const raw = localStorage.getItem(MOCK_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  const id = "local-" + Date.now();
  const user = {
    id,
    username: payload.username,
    name: payload.nombre,
    role: payload.role,
    createdAt: new Date().toISOString(),
    active: true,
  };
  arr.push(user);
  localStorage.setItem(MOCK_KEY, JSON.stringify(arr));
  return user;
}

async function mockListUsers() {
  const raw = localStorage.getItem(MOCK_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function mockUpdateUserStatus(id, active) {
  const raw = localStorage.getItem(MOCK_KEY);
  const arr = raw ? JSON.parse(raw) : [];
  const idx = arr.findIndex((u) => u.id === id);
  if (idx === -1) throw new Error("Usuario no encontrado (mock)");
  arr[idx].active = !!active;
  localStorage.setItem(MOCK_KEY, JSON.stringify(arr));
  return arr[idx];
}

/* ---------- Firebase RTDB implementations (modular) ---------- */
async function addUserToFirebase(payload) {
  if (!rtdb) throw new Error("RTDB no inicializado (rtdb es null)");
  const usersRef = ref(rtdb, "users");
  const newRef = push(usersRef);
  const userData = {
    username: payload.username,
    name: payload.nombre,
    role: payload.role,
    createdAt: new Date().toISOString(),
    active: true,
  };
  await set(newRef, userData);
  return { id: newRef.key, ...userData };
}

async function listUsersFromFirebase() {
  if (!rtdb) throw new Error("RTDB no inicializado (rtdb es null)");
  const rootRef = ref(rtdb);
  const snapshot = await get(child(rootRef, "users"));
  console.debug("AgregarUsuarioService: snapshot for /users -> exists:", snapshot.exists());
  if (!snapshot.exists()) {
    // imprime lo que sí hay para ayudarte a depurar
    const allSnap = await get(rootRef);
    console.debug("AgregarUsuarioService: snapshot root ->", allSnap.exists() ? allSnap.val() : null);
    return [];
  }
  const data = snapshot.val(); // objeto { key: { ... } }
  // convertir a array y normalizar distintos formatos de usuario
  return Object.keys(data).map((k) => {
    const u = data[k] || {};
    return {
      id: k,
      name: u.name || u.Name || u.displayName || u.nombre || "",
      username:
        u.username ||
        u.email ||
        u.Email ||
        u.UUID ||
        (u.UID ? String(u.UID) : "") ||
        "",
      role: u.role || u.rol || "user",
      createdAt: u.createdAt || u.created || null,
      active: typeof u.active === "boolean" ? u.active : true,
      raw: u,
    };
  });
}

async function updateUserStatusFirebase(id, active) {
  if (!rtdb) throw new Error("RTDB no inicializado (rtdb es null)");
  const activeRef = ref(rtdb, `users/${id}/active`);
  await set(activeRef, !!active);
  return { id, active: !!active };
}

/* ---------- API pública ---------- */
const AgregarUsuarioService = {
  async addUser(payload) {
    if (!payload || !payload.username || !payload.nombre) {
      throw new Error("username y nombre son requeridos");
    }
    const p = {
      username: String(payload.username).trim(),
      nombre: String(payload.nombre).trim(),
      role: payload.role ? String(payload.role).trim() : "user",
    };

    try {
      if (rtdb) {
        return await addUserToFirebase(p);
      }
    } catch (err) {
      console.warn("AgregarUsuarioService.addUser: fallo Firebase, usando mock:", err?.message || err);
    }
    return await mockAddUser(p);
  },

  async listUsers() {
    try {
      if (rtdb) {
        const arr = await listUsersFromFirebase();
        console.debug("AgregarUsuarioService.listUsers -> count:", arr.length);
        return arr;
      }
    } catch (err) {
      console.warn("AgregarUsuarioService.listUsers: fallo Firebase, usando mock:", err?.message || err);
    }
    return await mockListUsers();
  },

  async updateUserStatus(id, active) {
    try {
      if (rtdb) {
        return await updateUserStatusFirebase(id, active);
      }
    } catch (err) {
      console.warn("AgregarUsuarioService.updateUserStatus: fallo Firebase, usando mock:", err?.message || err);
    }
    return await mockUpdateUserStatus(id, active);
  },
};

export default AgregarUsuarioService;
