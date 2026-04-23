export interface User {
  id: string;
  name: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  createdAt: string;
}

interface StoredUser extends User {
  password: string;
}

const USERS_KEY = "burger_users";
const SESSION_KEY = "burger_session";

function getUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): User | null {
  try {
    const s = localStorage.getItem(SESSION_KEY);
    return s ? JSON.parse(s) : null;
  } catch {
    return null;
  }
}

function setSession(user: User) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function toPublicUser(u: StoredUser): User {
  const { password: _, ...rest } = u;
  return rest;
}

export function register(data: {
  name: string;
  email: string;
  password: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  if (users.find((u) => u.email === data.email)) {
    return { success: false, error: "E-mail já cadastrado." };
  }
  const newUser: StoredUser = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, newUser]);
  const pub = toPublicUser(newUser);
  setSession(pub);
  return { success: true, user: pub };
}

export function login(email: string, password: string): { success: boolean; error?: string; user?: User } {
  const users = getUsers();
  const u = users.find((u) => u.email === email && u.password === password);
  if (!u) return { success: false, error: "E-mail ou senha incorretos." };
  const pub = toPublicUser(u);
  setSession(pub);
  return { success: true, user: pub };
}

export function logout() {
  clearSession();
}

export function requestPasswordReset(email: string): { success: boolean; message: string } {
  const users = getUsers();
  const u = users.find((u) => u.email === email);
  if (!u) return { success: false, message: "E-mail não encontrado." };
  // Simulate - store token
  const token = crypto.randomUUID().slice(0, 6).toUpperCase();
  localStorage.setItem(`burger_reset_${email}`, token);
  console.log(`[Simulação] Código de redefinição para ${email}: ${token}`);
  return { success: true, message: `Código enviado para ${email}. (Verifique o console do navegador)` };
}

export function resetPassword(email: string, token: string, newPassword: string): { success: boolean; message: string } {
  const storedToken = localStorage.getItem(`burger_reset_${email}`);
  if (!storedToken || storedToken !== token) {
    return { success: false, message: "Código inválido." };
  }
  const users = getUsers();
  const idx = users.findIndex((u) => u.email === email);
  if (idx === -1) return { success: false, message: "Usuário não encontrado." };
  users[idx].password = newPassword;
  saveUsers(users);
  localStorage.removeItem(`burger_reset_${email}`);
  return { success: true, message: "Senha redefinida com sucesso!" };
}

export function updateProfile(userId: string, data: Partial<Omit<User, "id" | "createdAt">>): { success: boolean; user?: User } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return { success: false };
  users[idx] = { ...users[idx], ...data };
  saveUsers(users);
  const pub = toPublicUser(users[idx]);
  setSession(pub);
  return { success: true, user: pub };
}
