// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("Buyable Compounds Page", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.visit("/buyables");
    cy.intercept("GET", "/api/buyables/sources").as("getSource");
    cy.wait("@getSource");
  });

  it("can search compounds", () => {
    cy.get('[placeholder="SMILES/SMARTS"]').type("c1ccccc1");
    cy.get("button").contains("Search").click();
    
  });

  it("can change similarity threshold", () => {
    cy.get('[data-cy="similarity-input-element"] input').clear();
    cy.get('[data-cy="similarity-input-element"] input').type("0.5");
  });

  it("can change limit results", () => {
    cy.get('[data-cy="result-input-element"] input').clear();
    cy.get('[data-cy="result-input-element"] input').type("50");
  });

  it("can search compounds with limit 2", () => {
    cy.get('[placeholder="SMILES/SMARTS"]').type("c1ccccc1");
    cy.get('[data-cy="result-input-element"] input').clear();
    cy.get('[data-cy="result-input-element"] input').type("2");
    cy.get("button").contains("Search").click();
    cy.get('table tbody tr').should('have.length', 2)
  });
});
