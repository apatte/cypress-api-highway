describe("Mocking API Responses", () => {
  it("GET /entries with stubbed response", () => {
    // Stubbing the GET request to /entries with a mocked response
    cy.intercept("GET", "https://api.demoblaze.com/entries", {
      statusCode: 200,
      body: {
        Items: [
          { id: 1, cat: "Phones", title: "iPhone", price: 799 },
          { id: 2, cat: "Laptops", title: "MacBook Pro", price: 1299 },
        ],
      },
    }).as("getEntries");

    // Triggering the request to /entries
    cy.visit("https://www.demoblaze.com");

    // Asserting the response using cy.wait and cy.get
    cy.wait("@getEntries")
      .its("response.body.Items")
      .should("deep.equal", [
        { id: 1, cat: "Phones", title: "iPhone", price: 799 },
        { id: 2, cat: "Laptops", title: "MacBook Pro", price: 1299 },
      ]);
  });
});
describe("UI and API Integration", () => {
  it("should add an item to cart", () => {
    // Intercepting API calls to monitor
    cy.intercept("GET", "/entries").as("getEntries");
    cy.intercept("POST", "/view").as("viewEntry");
    cy.intercept("POST", "/addtocart").as("addToCart");

    cy.visit("https://www.demoblaze.com/");
    cy.wait("@getEntries").its("response.statusCode").should("eq", 200);
    cy.contains("Samsung galaxy s6").click();
    cy.wait("@viewEntry").its("response.statusCode").should("eq", 200);
    cy.contains(".btn", "Add to cart").click();
    cy.wait("@addToCart").its("response.statusCode").should("eq", 200);
  });
});

//this is pseudocode to illustrate how authentication can be handled via API
describe("should add a product to the cart via API as an authenticated user", () => {
  let userID;
  let cookie;

  // Step 1: Log in to get userID and cookie
  before(() => {
    cy.request({
      method: "POST",
      url: "https://api.demoblaze.com/login",
      body: {
        username: "test_user",
        password: "test_password",
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
      userID = response.body.id; // assuming the response contains the user ID
      cookie = response.body.cookie; // assuming the response contains the cookie
    });
  });

  // Step 2: Add a product to the cart via the API
  it("should add a product to the cart via API and verify it in the UI", () => {
    cy.request({
      method: "POST",
      url: "https://api.demoblaze.com/addtocart",
      body: {
        id: userID,
        cookie: cookie,
        prod_id: 1,
        flag: true,
      },
    }).then((response) => {
      // Verify the API response
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property("cookie", cookie);

      // Step 3: Visit the site and verify the product in the cart
      cy.visit("https://www.demoblaze.com");

      // Open the cart
      cy.get("#cartur").click();

      // Verify the product appears in the cart
      cy.contains("td", "Samsung galaxy s6").should("be.visible");
    });
  });

  // Clean up: Remove the product from the cart via API
  after(() => {
    cy.request({
      method: "POST",
      url: "https://api.demoblaze.com/deletecart",
      body: {
        id: userID,
      },
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });
});
