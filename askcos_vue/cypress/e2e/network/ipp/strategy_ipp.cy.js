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

  it("Enable clustering", function () {
    cy.get(".v-btn").contains("Strategy Settings").click();
    cy.get('[value="IPPC"]').click();
    cy.get("#allowClusterSetting").check(); //  Cluster similar precursors
    cy.get('[label-for="clusterMethod"]').click();
    // cy.get(".v-list").contains("kmeans").click();

    // cy.get("#allowCluster").check(); //  Clustering method
    cy.get(".v-card-actions").contains("Save").click();
  });

//   it("Check clustering result - kmeans", function () {
//     cy.get(".v-btn").contains("Strategy Settings").click();
//     cy.get('[value="IPPC"]').click();
//     cy.get("#allowClusterSetting").check(); //  Cluster similar precursors
//     cy.get('[label-for="clusterMethod"]').click();
//     // cy.get(".v-list").contains("kmeans").click();

//     // cy.get("#allowCluster").check(); //  Clustering method
//     cy.get(".v-card-actions").contains("Save").click();

//     cy.get("button").contains("One Step").click(); // click open step
//     cy.get("canvas").click();

//     // cy.get("#allowCluster").should("be.checked");
//     cy.get("#details > :nth-child(8)")
//       .find(".v-card")
//       .then(($value_clustered) => {
//         cy.get("#allowCluster").uncheck(); //  Clustering method
//         cy.get("#details > :nth-child(8)")
//           .find(".v-card")
//           .then(($value_unclustered) => {
//             expect($value_clustered.length).to.not.equal(
//               $value_unclustered.length
//             );
//           });
//       });
//   });

//   it("Check clustering result - hdbscan", function () {
//     cy.get(".v-btn").contains("Strategy Settings").click();
//     cy.get('[value="IPPC"]').click();
//     cy.get("#allowClusterSetting").check(); //  Cluster similar precursors
//     cy.get('[label-for="clusterMethod"]').click();
//     cy.get(".v-list").contains("hdbscan").click();

//     // cy.get("#allowCluster").check(); //  Clustering method
//     cy.get(".v-card-actions").contains("Save").click();

//     cy.get("button").contains("One Step").click(); // click open step
//     cy.get("canvas").click();

//     cy.get("#allowCluster").should("be.checked"); // check cluster result length vs unclustered length
//     cy.get("#details > :nth-child(8)")
//       .find(".v-card")
//       .then(($value_clustered) => {
//         cy.get("#allowCluster").uncheck(); //  Clustering method
//         cy.get("#details > :nth-child(8)")
//           .find(".v-card")
//           .then(($value_unclustered) => {
//             expect($value_clustered.length).to.not.equal(
//               $value_unclustered.length
//             );
//           });
//       });
//   });
});
