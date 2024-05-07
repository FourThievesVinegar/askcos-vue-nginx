// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Solubility Predict Page", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.visit("/solprop?tab=solpred");
  });

  it("can input solute", () => {
    //input for solute
    cy.get('[data-cy="solute"]').type("CC(=O)O");
    //cy.get("img").first().should("have.attr", "alt", "CC(=O)O");
  });

  it("can input solvent", () => {
    //input for solvent
    cy.get('[data-cy="solvent"]').type("CCO");
    //cy.get("img").eq(1).should("have.attr", "alt", "CCO");
  });

  it("Get Result", () => {
    //input for solute
    cy.get('[data-cy="solute"]').type("CC(=O)O");
    //input for solvent
    cy.get('[data-cy="solvent"]').type("CCO");
    //click submit button
    cy.get(".bg-success").click();
    cy.get("tbody").children().should("have.length", 1);
  });

  it("Can Run Batch", () => {
    //click run batch button
    cy.get(".bg-yellow-darken-4").click();
    /* ==== Generated with Cypress Studio ==== */
    //Upload file dialog appears
    cy.get(".v-card-text > :nth-child(1) > .v-col").should("be.visible");
    /* ==== End Cypress Studio ==== */
  });

  it("Download CSV", () => {
    //input for solute
    cy.get('[data-cy="solute"]').type("CC(=O)O");
    //input for solvent
    cy.get('[data-cy="solvent"]').type("CCO");
    //click submit button
    cy.get(".bg-success").click();
    /* ==== Generated with Cypress Studio ==== */
    //click downloads and csv file
    cy.get(".mx-auto > :nth-child(1) > .v-btn > .v-btn__content").click();
    cy.get(
      ".v-overlay__content > .v-list > :nth-child(1) > .v-list-item__content"
    ).click();
    /* ==== End Cypress Studio ==== */
  });

  it("Download JSON", () => {
    //input for solute
    cy.get('[data-cy="solute"]').type("CC(=O)O");
    //input for solvent
    cy.get('[data-cy="solvent"]').type("CCO");
    //click submit button
    cy.get(".bg-success").click();
    //click downloads and JSON file
    cy.get(".mx-auto > :nth-child(1) > .v-btn > .v-btn__content").click();
    cy.get(
        ".v-overlay__content > .v-list > :nth-child(2) > .v-list-item__content"
      ).click();
  });
});
