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
    cy.visit("/network?tab=IPP");

    // cy.get('.v-btn').contains('Strategy Settings').click();
    // cy.get('[value="mctsTB"]').click()
    // cy.get('[label-for="expansionTime"]').clear().type('15');
    // cy.get('.v-card-actions').contains('Save').click();
    // cy.get('.v-input').get('[placeholder="SMILES"]').type('C1CCC(OC2CCCCC2)CC1');
    // cy.get('button').contains("Build Tree").click() // click one step
    // cy.get('button').contains('Ok').click()

    // cy.wait(15000)

    cy.visit("/results");
    cy.get("#results-update").click();
  });

  it("Enter Reaction Node", function () {
    cy.get("tbody").find(".v-btn").first().click();
    cy.get("tbody").find(".v-btn").contains(" View trees ").click();
  });

  it("Click on canvas", function () {
    cy.get("tbody").find(".v-btn").first().click();
    cy.get("tbody").find(".v-btn").contains(" View trees ").click();
    // todo
    // cy.get("canvas").click();
    // cy.get(".jsPanel-content").contains("Evaluate reaction").click();
    // cy.url().should("contain", "forward");
  });
});
