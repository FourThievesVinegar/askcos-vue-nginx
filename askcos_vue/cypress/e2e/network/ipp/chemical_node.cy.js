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
    cy.get("button").contains("One Step").click(); // click one step
  });

//   it("Collapse Node", function () {
//     cy.get("canvas").click();
//     // cy.get('.bg-blue-darken-1 > .v-btn__content').click();
//     cy.get(".details-top").contains("Collapse").click();
//   });

//   it("Delete Node", function () {
//     cy.get("canvas").click();
//     // cy.get('.bg-red-darken-1 > .v-btn__content').click(); // click delete
//     cy.get(".details-top").contains("Delete").click();
//     cy.get(".v-card-title").should("contain", "Please Confirm");
//     cy.get("button").contains("Ok").click();
//   });
});
