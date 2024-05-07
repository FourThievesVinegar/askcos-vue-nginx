// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("IPP Page", () => {
  /* ==== Test Created with Cypress Studio ==== */
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.fixture("users.json").then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    });
    cy.visit("/network?tab=IPP");

    cy.get(".v-input")
      .get('[placeholder="SMILES"]')
      .type("C1CCC(OC2CCCCC2)CC1");
    cy.get("button").contains("One Step").click(); // click one step
  });

  /* ==== Test Created with Cypress Studio ==== */
  it("Import empty file", function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(".v-col-sm-12 > .v-input > .v-input__append > .ml-2").click();
    cy.get("#input-100").click();
    cy.get(".v-card-actions").contains("Load").should("be.disabled");
    /* ==== End Cypress Studio ==== */
  });
});
