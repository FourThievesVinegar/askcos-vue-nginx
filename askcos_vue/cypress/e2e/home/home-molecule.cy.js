// type definitions for Cypress object "cy"
/// <reference types="cypress" />

describe("ASKCOS Homepage", () => {
  beforeEach(() => {
    cy.viewport("macbook-11");
    cy.fixture("users.json").then((users) => {
      const validUser = users.validUser;
      cy.login(validUser.username, validUser.password);
    });
    cy.visit("/");
  });

  it("Test Canonicalization", function () {
    cy.get('[placeholder="SMILES"]').type(
      "C1=CC(=C(C=C1F)F)C(CN2C=NC=N2)(CN3C=NC=N3)O"
    );
    cy.get('[data-cy="home-canonicalize"]').click();
    cy.get('[data-cy="home-searchbar"]')
      .find("input")
      .should("have.value", "OC(Cn1cncn1)(Cn1cncn1)c1ccc(F)cc1F");
  });

  it("Test Resolver", function () {
    cy.get('[data-cy="home-NIH-resolver"]').click();
    cy.get('[placeholder="SMILES"]').type("aspirin");
    cy.get('[data-cy="home-resolve-btn"]').click();
    cy.get('[data-cy="home-searchbar"]')
      .find("input")
      .should("have.value", "CC(=O)OC1=CC=CC=C1C(=O)O");
  });

  it("Test Support", function () {
    cy.get('[data-cy="home-support"]').click();
    cy.get('[data-cy="home-support"]').contains("askcos_support@mit.edu");
  });

  it("Test SCscore", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-scscore"]').click();
    cy.contains("SCScore").parent().contains("1.7");
  });

  it("Test IPP", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-ipp"]').invoke("removeAttr", "target").click();
    cy.url().should("include", "IPP&target=C1CCC(OC2CCCCC2)CC1");
  });

  it("Test Tree Builder", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-build-tree"]').click();
    cy.waitCelery();
    cy.get('[data-cy="home-view-tree-results"]').contains("Visit Results");
  });

  it("Test Predict Forward Synthesis", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-forward-synthesis"]')
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("include", "forward&reactants=C1CCC(OC2CCCCC2)CC1");
  });

  it("Test Predict Forward Synthesis", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-predict-impurties"]')
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("include", "impurity&reactants=C1CCC(OC2CCCCC2)CC1");
  });

  it("Test Predict Aromatic Site Selectivity", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-site-selectivity"]')
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("include", "sites&reactants=C1CCC(OC2CCCCC2)CC1");
  });

  it("Test Solvent Screen", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCC(OC2CCCCC2)CC1");
    cy.get('[data-cy="home-solvent-screen"]')
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("include", "solscreen&solute=C1CCC(OC2CCCCC2)CC1");
  });

  it("Test Buyables", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCCCCCC1");
    cy.get('[data-cy="home-buyables"]').invoke("removeAttr", "target").click();
    cy.url().should("include", "buyables?q=C1CCCCCCC1");
    cy.get('[data-cy="buyables-table"]').contains("SMILES");
  });

  it("Test QM Prediction", function () {
    cy.get('[placeholder="SMILES"]').type("C1CCCCCCC1");
    cy.get('[data-cy="home-qm-descriptors"]')
      .invoke("removeAttr", "target")
      .click();
    cy.url().should("include", "qm?smiles=C1CCCCCCC1");
    cy.get('[data-cy="qm-table"]').contains("npa charge (e)");
  });
});
