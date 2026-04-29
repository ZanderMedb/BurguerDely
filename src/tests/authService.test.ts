/**
 * ============================================================
 *  TESTES UNITÁRIOS — authService.ts
 *  Ferramenta: Vitest
 *  Cobre: register, login, logout, requestPasswordReset,
 *         resetPassword, updateProfile, getSession
 * ============================================================
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  register,
  login,
  logout,
  getSession,
  requestPasswordReset,
  resetPassword,
  updateProfile,
} from "../services/authService";

// ── Mock localStorage ─────────────────────────────────────────
const store: Record<string, string> = {};

const localStorageMock = {
  getItem: (k: string) => store[k] ?? null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

(globalThis as any).localStorage = localStorageMock;

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
});


// ── REGISTER ──────────────────────────────────────────────────
describe("register()", () => {
  const validData = {
    name: "João Silva",
    email: "joao@email.com",
    password: "senha123",
    address: "QNG 04 Casa 06",
    city: "Brasília",
    state: "DF",
    zipCode: "72020-000",
  };

  it("TC-AUTH-001 — deve registrar novo usuário com sucesso", () => {
    const result = register(validData);
    expect(result.success).toBe(true);
    expect(result.user).toBeDefined();
    expect(result.user?.email).toBe("joao@email.com");
    expect(result.user?.name).toBe("João Silva");
  });

  it("TC-AUTH-002 — não deve expor senha no objeto retornado", () => {
    const result = register(validData);
    expect(result.user).not.toHaveProperty("password");
  });

  it("TC-AUTH-003 — deve rejeitar e-mail já cadastrado", () => {
    register(validData);
    const second = register({ ...validData, name: "Outro Nome" });
    expect(second.success).toBe(false);
    expect(second.error).toBe("E-mail já cadastrado.");
  });

  it("TC-AUTH-004 — deve criar sessão automaticamente após registro", () => {
    register(validData);
    const session = getSession();
    expect(session).not.toBeNull();
    expect(session?.email).toBe("joao@email.com");
  });

  it("TC-AUTH-005 — dois e-mails diferentes devem ser registrados sem conflito", () => {
    const r1 = register(validData);
    const r2 = register({ ...validData, email: "outro@email.com" });
    expect(r1.success).toBe(true);
    expect(r2.success).toBe(true);
  });
});

// ── LOGIN ─────────────────────────────────────────────────────
describe("login()", () => {
  beforeEach(() => {
    register({
      name: "Maria",
      email: "maria@email.com",
      password: "abc123",
      address: "Rua X",
      city: "Brasília",
      state: "DF",
      zipCode: "70000-000",
    });
    logout(); // limpa sessão para testar login isolado
  });

  it("TC-AUTH-006 — deve logar com credenciais corretas", () => {
    const result = login("maria@email.com", "abc123");
    expect(result.success).toBe(true);
    expect(result.user?.email).toBe("maria@email.com");
  });

  it("TC-AUTH-007 — deve rejeitar senha incorreta", () => {
    const result = login("maria@email.com", "senhaerrada");
    expect(result.success).toBe(false);
    expect(result.error).toBe("E-mail ou senha incorretos.");
  });

  it("TC-AUTH-008 — deve rejeitar e-mail não cadastrado", () => {
    const result = login("naoexiste@email.com", "qualquer");
    expect(result.success).toBe(false);
    expect(result.error).toBe("E-mail ou senha incorretos.");
  });

  it("TC-AUTH-009 — deve criar sessão após login bem-sucedido", () => {
    login("maria@email.com", "abc123");
    const session = getSession();
    expect(session?.email).toBe("maria@email.com");
  });

  it("TC-AUTH-010 — login é case-sensitive para senha", () => {
    const result = login("maria@email.com", "ABC123");
    expect(result.success).toBe(false);
  });
});

// ── LOGOUT ────────────────────────────────────────────────────
describe("logout()", () => {
  it("TC-AUTH-011 — deve limpar a sessão do usuário", () => {
    register({
      name: "Carlos",
      email: "carlos@email.com",
      password: "pass",
      address: "X",
      city: "BSB",
      state: "DF",
      zipCode: "00000-000",
    });
    expect(getSession()).not.toBeNull();
    logout();
    expect(getSession()).toBeNull();
  });
});

// ── RESET DE SENHA ────────────────────────────────────────────
describe("requestPasswordReset() + resetPassword()", () => {
  beforeEach(() => {
    register({
      name: "Ana",
      email: "ana@email.com",
      password: "senha111",
      address: "Y",
      city: "BSB",
      state: "DF",
      zipCode: "00000-000",
    });
    logout();
  });

  it("TC-AUTH-012 — deve aceitar solicitação de reset para e-mail existente", () => {
    const result = requestPasswordReset("ana@email.com");
    expect(result.success).toBe(true);
  });

  it("TC-AUTH-013 — deve rejeitar reset para e-mail inexistente", () => {
    const result = requestPasswordReset("naoexiste@email.com");
    expect(result.success).toBe(false);
    expect(result.message).toBe("E-mail não encontrado.");
  });

  it("TC-AUTH-014 — deve redefinir senha com token correto", () => {
    requestPasswordReset("ana@email.com");
    const token = store["burger_reset_ana@email.com"];
    const result = resetPassword("ana@email.com", token, "novaSenha999");
    expect(result.success).toBe(true);
    const loginResult = login("ana@email.com", "novaSenha999");
    expect(loginResult.success).toBe(true);
  });

  it("TC-AUTH-015 — deve rejeitar token inválido no reset", () => {
    requestPasswordReset("ana@email.com");
    const result = resetPassword("ana@email.com", "TOKEN-ERRADO", "novaSenha");
    expect(result.success).toBe(false);
    expect(result.message).toBe("Código inválido.");
  });

  it("TC-AUTH-016 — token deve ser removido após uso bem-sucedido", () => {
    requestPasswordReset("ana@email.com");
    const token = store["burger_reset_ana@email.com"];
    resetPassword("ana@email.com", token, "nova123");
    expect(store["burger_reset_ana@email.com"]).toBeUndefined();
  });
});

// ── UPDATE PROFILE ────────────────────────────────────────────
describe("updateProfile()", () => {
  it("TC-AUTH-017 — deve atualizar dados do perfil com sucesso", () => {
    const { user } = register({
      name: "Pedro",
      email: "pedro@email.com",
      password: "p123",
      address: "Rua Z",
      city: "BSB",
      state: "DF",
      zipCode: "00000-000",
    });
    const result = updateProfile(user!.id, { name: "Pedro Atualizado", city: "Goiânia" });
    expect(result.success).toBe(true);
    expect(result.user?.name).toBe("Pedro Atualizado");
    expect(result.user?.city).toBe("Goiânia");
  });

  it("TC-AUTH-018 — deve retornar falha para userId inexistente", () => {
    const result = updateProfile("id-que-nao-existe", { name: "X" });
    expect(result.success).toBe(false);
  });
});
