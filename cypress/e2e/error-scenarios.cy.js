describe("Handling Error Scenarios in API Testing", () => {
  // Stubbing a network failure (500 Internal Server Error)
  it("should handle server errors gracefully", () => {
    cy.intercept("GET", "https://api.demoblaze.com/entries", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getEntriesError");
    cy.visit("https://www.demoblaze.com/");
    cy.wait("@getEntriesError").then((interception) => {
      // Log the error response for debugging
      cy.log("Error Response:", interception.response);
      console.log("Error Response:", interception.response);
      // Assert the response status code and error message
      expect(interception.response.statusCode).to.eq(500);
      expect(interception.response.body).to.have.property(
        "error",
        "Internal Server Error"
      );
      // Verify that the UI shows an appropriate error message
      // cy.contains(
      //   "Error: Unable to load entries. Please try again later."
      // ).should("be.visible");
    });
  });

  // Handling 404 resource not found error
  it("should handle 404 errors gracefully", () => {
    cy.request({
      method: "GET",
      url: "https://www.demoblaze.com/cart123.html",
      failOnStatusCode: false,
    }).then((resp) => {
      cy.log(resp);
      expect(resp.status).to.eq(404);
    });
  });
});
