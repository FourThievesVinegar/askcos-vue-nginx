// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Condition Recommendation Page", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.visit("/forward?tab=sites");
  });

  it("can input Reactants", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  });

  it("Get Result", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get(".bg-success").click();
    cy.get("tbody").children().should("have.length", 5);
  });

  it("Copy all reaction ids", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get(".bg-success").click();
    cy.get("tbody").children().should("have.length", 5);
    /* ==== Generated with Cypress Studio ==== */
    cy.get("button").contains("Get Training Reaction IDs").click();
    cy.get("button").contains("Copy all reaction IDs").click();
    /* ==== End Cypress Studio ==== */
  });

  it("Find First 50 in Reaxys", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get(".bg-success").click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get("button").contains("Get Training Reaction IDs").click();
    //Find first 50 in Reaxys button clicked
    //cy.get('.my-2 > .v-btn__content').click();
    /* ==== End Cypress Studio ==== */
  });

  it("Export all as Reaxys Query", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get(".bg-success").click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get("button").contains("Get Training Reaction IDs").click();
    cy.get("button").contains("Export all as Reaxys query").click();
    /* ==== End Cypress Studio ==== */
  });
});
