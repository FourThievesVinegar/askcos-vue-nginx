// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Product Prediction Page", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.visit("/forward?tab=forward");
  });

  it("can input Reactants", function () {
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  });

  it("can input Reagents", function () {
    cy.get('[data-cy="reagents"]').type("C");
  });

  it("can input Solvents", function () {
    cy.get('[data-cy="reagents"]').type("C");
    cy.get('[data-cy="solvent"]').type("ClC(Cl)(Cl)Cl");
  });

  it("Get Result", function () {
    //cy.visit('/forward?tab=context');
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get('[data-cy="reagents"]').type("C");
    cy.get('[data-cy="solvent"]').type("ClC(Cl)(Cl)Cl");
    cy.get('[data-cy="submit-button"] > .v-btn__content').click();
    cy.get("tbody").children().should("have.length", 4);
  });

  // it('Get Impurity Prediction', function() {
  //     //cy.visit('/forward?tab=context');
  //     cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  //     cy.get('#input-49').type('C');
  //     cy.get('#input-52').type('ClC(Cl)(Cl)Cl');
  //     cy.get('[data-cy="submit-button"] > .v-btn__content').click()
  //     /* ==== Generated with Cypress Studio ==== */
  //     // It is a little arrow leads to predict_inpurities
  //     cy.get('#predict-impurities-1 > .v-btn__content > .mdi-arrow-right').click();
  //     cy.get('#input-32').should('have.value', 'BrBr.c1ccccc1');
  //     cy.get('#input-76').should('have.value', 'Brc1ccccc1Br');
  //     cy.get('#input-49').should('have.value', 'C');
  //     cy.get('#input-52').should('have.value', 'ClC(Cl)(Cl)Cl');
  //     /* ==== End Cypress Studio ==== */
  // });

  // it('Get regio-selective reactions', function() {
  //     //cy.visit('/forward?tab=context');
  //     cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
  //     cy.get('#input-49').type('C');
  //     cy.get('#input-52').type('ClC(Cl)(Cl)Cl');
  //     cy.get('[data-cy="submit-button"] > .v-btn__content').click()
  //     /* ==== Generated with Cypress Studio ==== */
  //     // It is a little arrow leads to predict-regio-selectivities
  //     cy.get('#predict-regio-selectivities-1').click();
  //     cy.get('#input-32').should('have.value', 'BrBr.c1ccccc1');
  //     cy.get('#input-76').should('have.value', 'Brc1ccccc1Br');
  //     cy.get('#input-49').should('have.value', 'C');
  //     cy.get('#input-52').should('have.value', 'ClC(Cl)(Cl)Cl');
  //     /* ==== End Cypress Studio ==== */
  // });

  it("CLEAR button", function () {
    //cy.visit('/forward?tab=context');
    cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
    cy.get('[data-cy="reagents"]').type("C");
    cy.get('[data-cy="solvent"]').type("ClC(Cl)(Cl)Cl");
    cy.get('[data-cy="submit-button"] > .v-btn__content').click();
    /* ==== Generated with Cypress Studio ==== */
    cy.get('[data-cy="clear-button"] > .v-btn__content').click();
    cy.get("button").contains("Ok").click();
    cy.get('[data-cy="reactants"]').should("not.be.checked");
    cy.get('[data-cy="reagents"]').should("not.be.checked");
    cy.get('[data-cy="solvent"]').should("not.be.checked");
    /* ==== End Cypress Studio ==== */
  });
});
