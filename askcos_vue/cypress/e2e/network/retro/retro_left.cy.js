// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("One step Retro", () => {
  /* ==== Test Created with Cypress Studio ==== */
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.fixture("users.json").then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    });

    cy.visit("/network?tab=RP");

    cy.get("#retro-target").type("C1CCC(OC2CCCCC2)CC1");
  });

  it("Run Submit", function () {
    cy.get('[data-cy="retro-left-panel"]')
      .find("img")
      .should("have.attr", "alt", "C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="retro-submit"]').click();
    cy.get('[data-cy="retro-results"]').should("be.visible");
  });

  it("Change to Augmented transformer", function () {
    cy.get('[data-cy="retro-model"]').click();
    cy.get(".v-list").contains("augmented_transformer").click();
    cy.get('[data-cy="retro-submit"]').click();
  });
});
