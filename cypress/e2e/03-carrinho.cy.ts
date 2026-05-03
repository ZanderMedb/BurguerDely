/**
 * ============================================================
 *  TC-E2E-014 a 020 — Testes E2E: Carrinho
 *  Ferramenta: Cypress
 *  Rotas testadas: /cardapio, /carrinho
 * ============================================================
 */

function irParaCarrinho() {
  cy.get("a[href='/carrinho']").first().click({ force: true });
  cy.url().should("include", "/carrinho");
}

function suprimirPopup() {
  cy.window().then((win) => {
    win.sessionStorage.setItem("welcome_seen", "1");
  });
}

describe("Carrinho de compras", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit("/cardapio");
    suprimirPopup();
  });

  it("TC-E2E-014 — deve exibir produtos no cardápio", () => {
    cy.contains("Adicionar").should("be.visible");
  });

  it("TC-E2E-015 — deve adicionar produto ao carrinho e atualizar o contador", () => {
    cy.contains("Adicionar").first().click();
    cy.contains("1").should("be.visible");
  });

  it("TC-E2E-016 — deve navegar para o carrinho e exibir o produto adicionado", () => {
    cy.contains("Adicionar").first().click();
    irParaCarrinho();
    cy.contains("R$").should("be.visible");
  });

  it("TC-E2E-017 — deve aumentar a quantidade do item no carrinho", () => {
    cy.contains("Adicionar").first().click();
    irParaCarrinho();
    // Botão + é o terceiro botão dentro do controle de quantidade (-, quantidade, +)
    cy.get(".flex.items-center.border.rounded-lg button").last().click({ force: true });
    cy.contains("2").should("be.visible");
  });

  it("TC-E2E-018 — deve remover produto ao clicar no ícone de lixeira", () => {
    cy.contains("Adicionar").first().click();
    irParaCarrinho();
    // Botão com classe text-destructive (lixeira)
    cy.get("button.text-destructive").first().click({ force: true });
    cy.contains("carrinho está vazio").should("be.visible");
  });

  it("TC-E2E-019 — deve aplicar cupom PRIMEIROBURGER e exibir desconto", () => {
    cy.contains("Adicionar").first().click();
    irParaCarrinho();
    // O cupom é aplicado automaticamente via onChange — só digitar já aplica
    cy.get("input[placeholder='Cupom de desconto']").type("PRIMEIROBURGER");
    cy.contains("Cupom PRIMEIROBURGER aplicado").should("be.visible");
  });

  it("TC-E2E-020 — deve navegar para checkout ao clicar em Finalizar pedido", () => {
    cy.contains("Adicionar").first().click();
    irParaCarrinho();
    // Texto exato do botão no código: "Finalizar pedido" (p minúsculo)
    cy.contains("Finalizar pedido").click();
    cy.url().should("include", "/checkout");
  });
});
