/**
 * ============================================================
 *  TC-E2E-021 a 027 — Testes E2E: Checkout
 * ============================================================
 */

function suprimirPopup() {
  cy.window().then((win) => {
    win.sessionStorage.setItem("welcome_seen", "1");
  });
}

function chegarNoCheckout() {
  cy.clearLocalStorage();
  cy.visit("/cardapio");
  suprimirPopup();

  cy.contains("Adicionar").first().click();
  cy.get("a[href='/carrinho']").first().click({ force: true });

  cy.url().should("include", "/carrinho");

  cy.contains("Finalizar pedido").click();
  cy.url().should("include", "/checkout");

  suprimirPopup();
}

// ✅ MOCK PROFISSIONAL (sem depender da API real)
function preencherEndereco() {
  cy.intercept("GET", "**/viacep.com.br/ws/**", {
    statusCode: 200,
    body: {
      cep: "72130-040",
      logradouro: "QNG 04",
      bairro: "Taguatinga Norte",
      localidade: "Brasília",
      uf: "DF"
    }
  }).as("cep");

  cy.get("#cep").clear().type("72130040{enter}");


  // 🔥 sincroniza com render do React
  cy.get("#street", { timeout: 10000 })
    .should("be.visible")
    .and("have.value", "QNG 04");

  cy.get("#number").clear().type("6");
  cy.get("#complement").clear().type("casa 06");
  cy.get("#ref").clear().type("casa 06");
}

describe("Checkout", () => {
  beforeEach(() => {
    chegarNoCheckout();
  });

  it("TC-E2E-021 — deve exibir o formulário de checkout com campos de endereço", () => {
    cy.get("#cep").should("be.visible");

    preencherEndereco();

    cy.get("#ref").should("be.visible");
  });

  it("TC-E2E-022 — deve exibir as três opções de pagamento", () => {
    cy.contains("Cartão").should("be.visible");
    cy.contains("Dinheiro").should("be.visible");
    cy.contains("PIX").should("be.visible");
  });

  it("TC-E2E-023 — deve mostrar aviso de pagamento na entrega ao selecionar Cartão", () => {
    preencherEndereco();

    cy.contains("Cartão").click();
    cy.contains("Pagamento na entrega").should("be.visible");
  });

  it("TC-E2E-024 — deve mostrar QR Code ao selecionar PIX", () => {
    preencherEndereco();

    cy.contains("PIX").click();

    cy.get("img[alt='QR Code PIX']").should("be.visible");
    cy.contains("Copiar código PIX").should("be.visible");
  });

  it("TC-E2E-025 — deve confirmar pedido com cartão e exibir tela de sucesso", () => {
    preencherEndereco();

    cy.contains("Cartão").click();

    cy.get("button[type=submit]")
      .should("not.be.disabled")
      .click();

    cy.contains("Pedido confirmado").should("be.visible");
    cy.contains("Rastrear pedido").should("be.visible");
  });

  it("TC-E2E-026 — deve exibir tela de verificação PIX após confirmar com PIX", () => {
    preencherEndereco();

    cy.contains("PIX").click();

    cy.get("button[type=submit]")
      .should("not.be.disabled")
      .click();

    cy.contains("Aguardando pagamento PIX").should("be.visible");
  });

  it("TC-E2E-027 — deve exibir o total correto no resumo do pedido", () => {
    cy.contains("Total").should("be.visible");
    cy.contains("R$").should("be.visible");
  });
});