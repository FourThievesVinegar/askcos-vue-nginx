/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable no-unused-vars */
// type definitions for Cypress object "cy"
/// <reference types="cypress" />
let store;

describe("IPP Page", () => {
  /* ==== Test Created with Cypress Studio ==== */
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.fixture("users.json").then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    });
    cy.visit("/network?tab=IPP").then((win) => {
      store = win.store;
    });

    cy.get(".v-input")
      .get('[placeholder="SMILES"]')
      .type("C1CCC(OC2CCCCC2)CC1");

    // allow only one reaction to enable testing
    cy.get(".v-btn").contains("Strategy Settings").click();
    cy.get("#reactionLimit").clear().type("1");
    cy.get(".v-card-actions").contains("Save").click();
    cy.get("button").contains("One Step").click(); // click one step
  });

  it("Collapse Node", function () {
    cy.get("#hierarchical-button").click();
    cy.get("#center-graph-button").click();
    // todo fix this
    // cy.get("canvas").click("center");
    // cy.get(".details-top").contains("Collapse").click();
  });

  it("Delete Node", function () {
    cy.get("#hierarchical-button").click();
    cy.get("#center-graph-button").click();
    // todo fix this
    // cy.get("canvas").click("center");
    // cy.get(".details-top").contains("Delete").click();
    // cy.get(".v-card-title").should("contain", "Please Confirm");
    // cy.get("button").contains("Ok").click();

    // cy.get("canvas").click("center");
    // cy.get("#chemical-node-toolbar").should("exist"); // only chemical node left
  });
});
