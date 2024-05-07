/* eslint-disable cypress/unsafe-to-chain-command */
/* eslint-disable no-unused-vars */
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
    cy.get('[placeholder="SMILES"]').type("random_input");
    cy.get("button").contains("One Step").click(); // click open step
    cy.get(".v-card-title")
      .contains("Action Unsuccessful")
      .should("be.visible");
  });

  var default_template = "template_relevance";
  var default_dataset_template_based = "reaxys";
  var default_max_templates = "1000";
  var default_max_cum_prob = "0.999";
  var default_dataset_template_free = "USPTO_FULL";

  it("Add augmented transformer", function () {
    /* ==== Generated with Cypress Studio ==== */
    cy.get(".v-btn").contains("Strategy Settings").click();
    cy.get(".mdi-plus").click();
    cy.get(".v-card")
      .contains("Strategy 2")
      .parentsUntil(".v-card")
      .parent()
      .contains(default_template)
      .click();
    cy.get(".v-card")
      .contains("Strategy 2")
      .parentsUntil(".v-card")
      .parent()
      .get(".v-list-item-title")
      .contains("augmented_transformer")
      .click();
    cy.get(".v-card")
      .contains("Strategy 2")
      .parentsUntil(".v-card")
      .parent()
      .contains(default_dataset_template_free)
      .click();
    cy.get(".v-list-item-title").contains("pistachio").click();
    cy.get(".v-card-actions").contains("Save").click();
    cy.get(".pa-0").should("contain", "template_relevance");
    cy.get(".pa-0").should("contain", "augmented_transformer");
    cy.get(".bg-green-darken-1 > .v-btn__content").click(); // click open step
    cy.get("canvas").should("be.visible");
  });

  // Todo fix this
  /* ==== Test Created with Cypress Studio ==== */
  //   it("Change template relevance", function () {
  //     /* ==== Generated with Cypress Studio ==== */
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .contains(default_dataset_template_based)
  //       .click();
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .get(".v-list-item-title")
  //       .contains("bkms_metabolic")
  //       .click();
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .get('[id^="max_num_templates"]')
  //       .clear()
  //       .type("500");
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .get('[id^="max_cum_prob"]')
  //       .clear()
  //       .type("0.7");
  //     cy.get(".v-card-actions").contains("Save").click();

  //     cy.get(".pa-0").should("contain", "template_relevance");
  //     cy.get(".v-btn").contains("Strategy Settings").click();
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .contains("bkms_metabolic");
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .get('[id^="max_num_templates"]')
  //       .should("have.value", "500");
  //     cy.get(".v-card")
  //       .contains("Strategy 1")
  //       .parentsUntil(".v-card")
  //       .parent()
  //       .get('[id^="max_cum_prob"]')
  //       .should("have.value", "0.7");
  //     /* ==== End Cypress Studio ==== */
  //   });
});
