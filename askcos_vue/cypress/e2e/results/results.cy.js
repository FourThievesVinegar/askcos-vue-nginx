// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Tree Explorer", () => {
  /* ==== Test Created with Cypress Studio ==== */
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.fixture("users.json").then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    });
    cy.visit("/results");
    cy.get("#results-update").click();
  });

  it("Expand Row", function () {
    cy.get("tbody").find(".v-btn").first().click();
    cy.get("tbody").find(".v-btn").contains(" View trees ").click();
  });

  it("Delete Results Row", function () {
    // cy.get('tbody').find('.mdi-delete').first().click()
  });
});
