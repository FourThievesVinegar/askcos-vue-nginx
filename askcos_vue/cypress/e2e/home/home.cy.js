// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("ASKCOS Homepage", () => {
  beforeEach(() => {
    cy.visit("/");
  });
  before(() => {
    cy.viewport("macbook-11");
    cy.fixture('users.json').then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    })
  });

  it("Test Launchpad", function () {
    cy.get('[placeholder="SMILES"]').type("c1ccccc1");
    cy.contains("Evaluate").click();
    cy.contains("SCScore").parent().contains("1.2");
  });
});
