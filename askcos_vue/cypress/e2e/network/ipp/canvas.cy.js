/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable cypress/unsafe-to-chain-command */
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
    // cy.get('#input-35').type('C1CCC(OC2CCCCC2)CC1');
  });

  it("Wrong smiles input", function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[placeholder="SMILES"]').clear().type("random_input");
    cy.get("button").contains("One Step").click();
    cy.get(".v-card-title").contains("Action Unsuccessful").should("be.visible");
  });

  it("Input smiles check canvas", function () {
    cy.get("button").contains("One Step").click();
    cy.get("canvas").should("be.visible");
  });

  it("Hierarchical button click", function () {
    cy.get("button").contains("One Step").click();
    cy.get("#hierarchical-button").click();
  });

  it("Enumerate pathways click", function () {
    cy.get("button").contains("One Step").click();
    cy.wait(3000);
    cy.get('[aria-describedby="v-tooltip-97"]').click();
    cy.get("#tree-view-overlay > .v-btn-group > :nth-child(4)").click(); // next button
  });
});
