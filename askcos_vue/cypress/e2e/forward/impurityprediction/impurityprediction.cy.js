// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Condition Recommendation Page", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.visit("/forward?tab=impurity");
  });

  it("can input Reactants", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  });

  it("can input Product", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get('[data-cy="product"]').type("Brc1ccccc1");
  });

  it("can input Reagents", function () {
    cy.get('[data-cy="reagents"]').type("C");
  });

  it("can input Solvents", function () {
    cy.get('[data-cy="reagents"]').type("C");
    cy.get('[data-cy="solvent"]').type("ClC(Cl)(Cl)Cl");
  });

  // Add intercept to wait
  //   it("Get Result", function () {
  //     cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  //     cy.get('[data-cy="submit-button"]').click();
  //     cy.get("tbody").children().should("have.length", 6);
  //   });

  it("CLEAR button", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    /* ==== Generated with Cypress Studio ==== */
    cy.get("button").contains("Clear Results").click();
    cy.get("button").contains("Ok").click();
    cy.get('[data-cy="reactants"]').should("not.be.checked");
    cy.get('[data-cy="product"]').should("not.be.checked");
    cy.get('[data-cy="reagents"]').should("not.be.checked");
    cy.get('[data-cy="solvent"]').should("not.be.checked");
    /* ==== End Cypress Studio ==== */
  });
});
