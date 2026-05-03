/**
 * ============================================================
 *  TC-E2E-001 a 006 — Testes E2E: Login
 *  Ferramenta: Cypress
 *  Rota testada: /login
 * ============================================================
 */

// Fecha o WelcomePopup se estiver visível
// Cria usuário de teste e desloga — reutilizado no beforeEach
function criarUsuarioTeste() {
  cy.clearLocalStorage();
  cy.visit("/cadastro");
  suprimirPopup();
  cy.get("#name").type("Usuário Teste", { force: true });
  cy.get("#reg-email").type("login@burguer.com", { force: true });
  cy.get("#reg-pass").type("senha123", { force: true });
  cy.get("#reg-confirm").type("senha123", { force: true });
  cy.get("#address").type("QNG 04 Casa 06", { force: true });
  cy.get("#zip").type("72020-000", { force: true });
  cy.get("button[type=submit]").click({ force: true });
  cy.url().should("eq", Cypress.config("baseUrl") + "/");
  cy.clearLocalStorage("burger_session");
  cy.visit("/login");
  suprimirPopup();
}

function suprimirPopup() {
  cy.window().then((win) => {
    win.sessionStorage.setItem("welcome_seen", "1");
  });
}

describe("Login", () => {
  beforeEach(() => {
    criarUsuarioTeste();
  });

  it("TC-E2E-001 — deve exibir a tela de login corretamente", () => {
    cy.get("#email").should("be.visible");
    cy.get("#password").should("be.visible");
    cy.get("button[type=submit]").should("contain.text", "Entrar");
  });

  it("TC-E2E-002 — deve logar com credenciais válidas e redirecionar para home", () => {
    cy.get("#email").type("login@burguer.com");
    cy.get("#password").type("senha123");
    cy.get("button[type=submit]").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });

  it("TC-E2E-003 — deve exibir erro com senha incorreta", () => {
    cy.get("#email").type("login@burguer.com");
    cy.get("#password").type("senhaerrada");
    cy.get("button[type=submit]").click();
    cy.contains("E-mail ou senha incorretos").should("be.visible");
  });

  it("TC-E2E-004 — deve exibir erro com e-mail não cadastrado", () => {
    cy.get("#email").type("naoexiste@burguer.com");
    cy.get("#password").type("qualquer");
    cy.get("button[type=submit]").click();
    cy.contains("E-mail ou senha incorretos").should("be.visible");
  });

  it("TC-E2E-005 — deve exibir erro ao enviar formulário vazio", () => {
    cy.get("button[type=submit]").click();
    cy.contains("Preencha todos os campos").should("be.visible");
  });

  it("TC-E2E-006 — deve navegar para cadastro ao clicar no link", () => {
    cy.contains("Cadastre-se").click();
    cy.url().should("include", "/cadastro");
  });
});
