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

    cy.get("#input-35").type("C1CCC(OC2CCCCC2)CC1");
  });
  //todo
  //   it("Change tree builder settings - mcts algorithm options", function () {
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get('[label-for="expansionTime"]').type("50");
  //     cy.get('[label-for="maxIterations"]').clear().type("50");
  //     cy.get('[label-for="maxChemicals"]').clear().type("50");
  //     cy.get('[label-for="maxReactions"]').clear().type("50");
  //     cy.get('[label-for="maxTemplates"]').clear().type("50");
  //     cy.get('[label-for="maxDepth"]').clear().type("10");
  //     cy.get('[label-for="maxBranching"]').clear().type("30");

  //     cy.get(".v-card-actions").contains("Save").click();

  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get('[label-for="expansionTime"]')
  //       .get("#expansionTime")
  //       .should("have.value", "50");
  //     cy.get('[label-for="maxIterations"]')
  //       .get("#maxIterations")
  //       .should("have.value", "50");
  //     cy.get('[label-for="maxChemicals"]')
  //       .get("#maxChemicals")
  //       .should("have.value", "50");
  //     cy.get('[label-for="maxReactions"]')
  //       .get("#maxReactions")
  //       .should("have.value", "50");
  //     cy.get('[label-for="maxTemplates"]')
  //       .get("#maxTemplates")
  //       .should("have.value", "50");
  //     cy.get('[label-for="maxDepth"]')
  //       .get("#maxDepth")
  //       .should("have.value", "10");
  //     cy.get('[label-for="maxBranching"]')
  //       .get("#maxBranching")
  //       .should("have.value", "30");
  //   });

  //   it("Change tree builder settings - terminal chemical criteria", function () {
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get(".v-expansion-panel")
  //       .parent()
  //       .contains("Terminal chemical criteria")
  //       .click();
  //     cy.get('[label-for="buyableLogic"]').click();
  //     cy.get(".v-list-item__content").contains("Or").click();
  //     cy.get('[label-for="ppgLogic"]').click();
  //     cy.get(".v-list-item__content").contains("Or").click();
  //     cy.get('[label-for="scscoreLogic"]').click();
  //     cy.get(".v-list-item__content").contains("Or").click();

  //     cy.get("#chemPopR").clear().type("10");
  //     cy.get("#chemPopP").clear().type("10");

  //     cy.get(".v-card-actions").contains("Save").click();

  //     // assume options already expanded - check values
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get('[label-for="buyableLogic"]')
  //       .find(".v-field")
  //       .should("have.text", "Or");
  //     cy.get('[label-for="ppgLogic"]').find(".v-field").should("have.text", "Or");
  //     cy.get('[label-for="scscoreLogic"]')
  //       .find(".v-field")
  //       .should("have.text", "Or");

  //     cy.get("#chemPopR").should("have.value", "10");
  //     cy.get("#chemPopP").should("have.value", "10");
  //   });

  //   it("Change tree builder settings - pathway clustering options", function () {
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get(".v-expansion-panel")
  //       .parent()
  //       .contains("Pathway clustering options")
  //       .click();
  //     cy.get(
  //       ":nth-child(1) > :nth-child(2) > .v-input > .v-input__control > .v-selection-control > .v-selection-control__wrapper > .v-switch__track"
  //     ).click({ force: true });

  //     cy.get('[label-for="pathClusterMethod"]').find(".v-field__input").click();
  //     cy.get(".v-overlay__content").contains("hdbscan").click();
  //     cy.get("#pathClusterMinSize").clear().type("10");
  //     cy.get("#pathClusterMinSamples").clear().type("50");
  //     cy.get(".v-card-actions").contains("Save").click();

  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get('[value="mctsTB"]').click();
  //     cy.get('[label-for="pathClusterMethod"]')
  //       .find(".v-field")
  //       .should("have.text", "hdbscan");
  //     cy.get("#pathClusterMinSize").should("have.value", "10");
  //     cy.get("#pathClusterMinSamples").should("have.value", "50");
  //   });

  it("Change tree builder settings - result output options", function () {
    cy.get(".v-btn").contains("Strategy Settings").click();
    cy.get('[value="mctsTB"]').click();
    cy.get(".v-expansion-panel")
      .parent()
      .contains("Result output options")
      .click();

    /* ==== Generated with Cypress Studio ==== */
    cy.get("#returnFirst").check();
    cy.get("#maxTrees").clear().type("600");
    cy.get("#redirectToGraph").check();
    cy.get(".v-card-actions").contains("Save").click();

    /* ==== End Cypress Studio ==== */

    // assume option expanded
    cy.get(".v-btn").contains("Strategy Settings").click();
    cy.get('[value="mctsTB"]').click();
    cy.get("#maxTrees").should("have.value", "600");
  });
});
