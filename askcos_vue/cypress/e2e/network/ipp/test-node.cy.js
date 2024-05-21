/* eslint-disable cypress/no-unnecessary-waiting */
/* eslint-disable cypress/unsafe-to-chain-command */
// type definitions for Cypress object "cy"
/// <reference types="cypress" />
describe("IPP Page", () => {
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
    cy.wait(10000);
  });

  it("Collapse a reaction node", function () {
    cy.getReactionNode("OC1CCCCC1.OC1CCCCC1>>C1CCC(OC2CCCCC2)CC1").then(
      (nodeID) => {
        cy.openNodeDetail(nodeID)
          .get(".bg-blue-darken-1")
          .click()
          .getCluster(nodeID)
          .should("match", /cluster/);
      }
    );
  });
});
