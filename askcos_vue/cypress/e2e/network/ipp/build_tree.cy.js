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
  });

  it("Can run build tree", function () {
    cy.get("button").contains("Build Tree").click(); // click one step
    cy.get("button").contains("Ok").click();
    cy.visit("/results");
    // todo
    // cy.get(":nth-child(1) > :nth-child(2) > :nth-child(1) > strong").should(
    //   "have.text",
    //   "C1CCC(OC2CCCCC2)CC1"
    // );
  });
});
