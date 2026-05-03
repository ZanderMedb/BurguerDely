Cypress.Commands.add("loginViaStorage", (email = "teste@burguer.com", password = "senha123") => {
  cy.window().then((win) => {
    const usersRaw = win.localStorage.getItem("burger_users") || "[]";
    const users = JSON.parse(usersRaw);
    const exists = users.find((u) => u.email === email);
    if (!exists) {
      const user = {
        id: "cypress-user-001",
        name: "Usuário Teste",
        email,
        password,
        address: "QNG 04 Casa 06",
        city: "Brasília",
        state: "DF",
        zipCode: "72020-000",
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      win.localStorage.setItem("burger_users", JSON.stringify(users));
    }
    const sessionUser = users.find((u) => u.email === email);
    const { password: _, ...userWithoutPass } = sessionUser;
    win.localStorage.setItem("burger_session", JSON.stringify(userWithoutPass));
  });
  cy.reload();
});
