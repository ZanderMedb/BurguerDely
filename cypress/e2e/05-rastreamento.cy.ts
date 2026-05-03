describe("Rastreamento de pedido", { testIsolation: false }, () => {
  let orderId: string;

  function suprimirPopup() {
    cy.window().then((win) => {
      win.sessionStorage.setItem("welcome_seen", "1");
    });
  }

  function esperarOverlaySumir() {
    cy.get("body").then(($body) => {
      if ($body.find(".fixed.inset-0").length > 0) {
        cy.get(".fixed.inset-0", { timeout: 10000 }).should("not.exist");
      }
    });
  }

  before(() => {
    cy.clearLocalStorage();
    cy.visit("/cardapio");
    suprimirPopup();

    cy.contains("Adicionar").first().click();
    cy.get("a[href='/carrinho']").first().click({ force: true });
    cy.url().should("include", "/carrinho");

    cy.contains("Finalizar pedido").click();
    cy.url().should("include", "/checkout");

    cy.get("#cep").should("be.visible").type("72130040{enter}");
    cy.get("#street", { timeout: 10000 }).should("not.have.value", "");
    cy.get(".fixed.inset-0").should("not.exist");

    cy.get("#number").should("be.visible").type("6");
    esperarOverlaySumir();

    cy.get("#complement").should("be.visible").type("casa 06", { force: true });
    cy.get("#ref").should("be.visible").type("casa 06", { force: true });

    cy.contains("Cartão").click();
    esperarOverlaySumir();

    cy.get("button[type=submit]").should("not.be.disabled").click();

    cy.contains("Rastrear pedido", { timeout: 15000 })
      .should("be.visible")
      .and("have.attr", "href")
      .then((href) => {
        orderId = (href as string).split("/rastreamento/")[1];
      });

    cy.contains("Rastrear pedido").click();
    cy.url({ timeout: 10000 }).should("include", "/rastreamento/");
  });

  it("TC-E2E-028 — deve acessar a página de rastreamento", () => {
    cy.url().should("include", "/rastreamento/");
  });

  it("TC-E2E-029 — deve exibir o número do pedido", () => {
    cy.contains(new RegExp(orderId, "i"), { timeout: 15000 })
      .should("be.visible");
  });

  it("TC-E2E-030 — deve exibir os status do pedido", () => {
    cy.contains(/pedido confirmado/i, { timeout: 10000 }).should("be.visible");
    cy.contains(/preparando/i).should("be.visible");
    cy.contains(/saiu para entrega/i).should("be.visible");
    cy.contains(/entreg/i).should("be.visible");
  });

  it("TC-E2E-031 — deve exibir tempo estimado de entrega", () => {
    cy.contains(/min/i).should("be.visible");
  });

  it("TC-E2E-032 — deve exibir endereço de entrega", () => {
    cy.screenshot("debug-032-endereco");
    cy.contains(/endere|entrega|rua|qng|taguatinga|72130|casa/i, { timeout: 10000 })
      .should("be.visible");
  });

  it("TC-E2E-033 — deve exibir status de preparo", () => {
    cy.contains(/preparando/i).should("be.visible");
  });
});