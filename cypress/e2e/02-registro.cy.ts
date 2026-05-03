/**
 * ============================================================
 *  TC-E2E-007 a 013 — Testes E2E: Registro
 *  Ferramenta: Cypress
 *  Rota testada: /cadastro
 * ============================================================
 */

function suprimirPopup() {
  cy.window().then((win) => {
    win.sessionStorage.setItem("welcome_seen", "1");
  });
}

describe("Registro de usuário", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/cadastro");
    suprimirPopup();
  });

  it("TC-E2E-007 — deve exibir o formulário de cadastro completo", () => {
    cy.get("#name").should("be.visible");
    cy.get("#reg-email").should("be.visible");
    cy.get("#reg-pass").should("be.visible");
    cy.get("#reg-confirm").should("be.visible");
    cy.get("#address").should("be.visible");
    cy.get("#zip").should("be.visible");
  });

  it("TC-E2E-008 — deve criar conta com dados válidos e redirecionar para home", () => {
    cy.get("#name").type("Usuário Cypress");
    cy.get("#reg-email").type(`cypress_${Date.now()}@burguer.com`);
    cy.get("#reg-pass").type("cypress123");
    cy.get("#reg-confirm").type("cypress123");
    cy.get("#address").type("QNG 04 Casa 06");
    cy.get("#zip").type("72020-000");
    cy.get("button[type=submit]").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");
  });

  it("TC-E2E-009 — deve exibir erro quando as senhas não coincidem", () => {
    cy.get("#name").type("Usuário Cypress");
    cy.get("#reg-email").type("teste@burguer.com");
    cy.get("#reg-pass").type("senha123");
    cy.get("#reg-confirm").type("outrasenha");
    cy.get("#address").type("QNG 04 Casa 06");
    cy.get("#zip").type("72020-000");
    cy.get("button[type=submit]").click();
    cy.contains("senhas não coincidem").should("be.visible");
  });

  it("TC-E2E-010 — deve exibir erro se senha tiver menos de 6 caracteres", () => {
    cy.get("#name").type("Usuário Cypress");
    cy.get("#reg-email").type("teste@burguer.com");
    cy.get("#reg-pass").type("123");
    cy.get("#reg-confirm").type("123");
    cy.get("#address").type("QNG 04 Casa 06");
    cy.get("#zip").type("72020-000");
    cy.get("button[type=submit]").click();
    cy.contains("pelo menos 6 caracteres").should("be.visible");
  });

  it("TC-E2E-011 — deve exibir erro com e-mail já cadastrado", () => {
    cy.get("#name").type("Usuário Cypress");
    cy.get("#reg-email").type("duplicado@burguer.com");
    cy.get("#reg-pass").type("cypress123");
    cy.get("#reg-confirm").type("cypress123");
    cy.get("#address").type("QNG 04 Casa 06");
    cy.get("#zip").type("72020-000");
    cy.get("button[type=submit]").click();
    cy.url().should("eq", Cypress.config("baseUrl") + "/");

    cy.clearLocalStorage("burger_session");
    cy.visit("/cadastro");
    suprimirPopup();
    cy.get("#name").type("Outro Nome");
    cy.get("#reg-email").type("duplicado@burguer.com");
    cy.get("#reg-pass").type("cypress123");
    cy.get("#reg-confirm").type("cypress123");
    cy.get("#address").type("QNG 04 Casa 06");
    cy.get("#zip").type("72020-000");
    cy.get("button[type=submit]").click();
    cy.contains("já cadastrado").should("be.visible");
  });

  it("TC-E2E-012 — deve exibir erro ao enviar formulário vazio", () => {
    cy.get("button[type=submit]").click();
    cy.contains("Preencha todos os campos").should("be.visible");
  });

  it("TC-E2E-013 — deve navegar para login ao clicar no link", () => {
    cy.contains("Entrar").click();
    cy.url().should("include", "/login");
  });
});
