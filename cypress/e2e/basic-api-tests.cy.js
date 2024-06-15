describe("Basic API Tests", () => {
  it("GET /entries returns status 200", () => {
    cy.request("https://api.demoblaze.com/entries")
      .its("status")
      .should("eq", 200);
  });
});

it("GET /entries returns a list of products", () => {
  cy.request("GET", "/entries").then((response) => {
    expect(response.status).to.eq(200);
    expect(response.body.Items).to.have.length.greaterThan(0);
  });
});

it("GET /entries returns a list of products with specific attributes", () => {
  cy.request("https://api.demoblaze.com/entries")
    .its("body.Items")
    .each((item) => {
      expect(item).to.have.property("cat");
      expect(item).to.have.property("title");
      expect(item).to.have.property("price");
    });
});
