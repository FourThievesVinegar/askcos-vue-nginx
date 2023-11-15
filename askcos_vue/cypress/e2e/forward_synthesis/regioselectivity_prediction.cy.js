describe('Condition Recommendation Page', () => {
    beforeEach(() => {
      cy.visit('/forward?tab=selectivity');
    });

    it('can input Reactants', function() {
        cy.get('[data-cy="reactants"]').type("CC(C)OCCBr.O=c1[nH]c(=S)[nH]c2cc[nH]c12");
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').first().should('have.attr', 'alt', 'CC(C)OCCBr.O=c1[nH]c(=S)[nH]c2cc[nH]c12');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Product', function() {
        cy.get('[data-cy="reactants"]').type("CC(C)OCCBr.O=c1[nH]c(=S)[nH]c2cc[nH]c12");
        cy.get('[data-cy="product"]').type("CC(C)OCCn1ccc2[nH]c(=S)[nH]c(=O)c21");
        /* ==== Generated with Cypress Studio ==== */
        cy.get(':nth-child(3) > :nth-child(1) > .v-responsive > .v-img__img').should('be.visible');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Reagents', function() {
        cy.get('#input-49').type('O=C([O-])[O-].[K+]');
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').first().should('have.attr', 'alt', 'O=C([O-])[O-].[K+]');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Solvents', function() {
        cy.get('#input-49').type('O=C([O-])[O-].[K+]');
        cy.get('#input-52').type('CN(C)C=O.CN(C)C=O');
        /* ==== Generated with Cypress Studio ==== */
        cy.get(':nth-child(2) > [width="300"] > .v-responsive > .v-img__img').should('be.visible');
        /* ==== End Cypress Studio ==== */
    });

    it('Get Result', function() {
        cy.get('[data-cy="reactants"]').type("CC(C)OCCBr.O=c1[nH]c(=S)[nH]c2cc[nH]c12");
        cy.get('[data-cy="product"]').type("CC(C)OCCn1ccc2[nH]c(=S)[nH]c(=O)c21");
        cy.get('#input-49').type('O=C([O-])[O-].[K+]');
        cy.get('#input-52').type('CN(C)C=O.CN(C)C=O');
        /* ==== Generated with Cypress Studio ==== */
        cy.get('[data-cy="submit-button"] > .v-btn__content').click();
        cy.get('tbody').children().should('have.length', 3);
        /* ==== End Cypress Studio ==== */
    });

    it('Copy SMILE data', function() {
        cy.get('[data-cy="reactants"]').type("CC(C)OCCBr.O=c1[nH]c(=S)[nH]c2cc[nH]c12");
        cy.get('[data-cy="product"]').type("CC(C)OCCn1ccc2[nH]c(=S)[nH]c(=O)c21");
        cy.get('#input-49').type('O=C([O-])[O-].[K+]');
        cy.get('#input-52').type('CN(C)C=O.CN(C)C=O');
        cy.get('[data-cy="submit-button"] > .v-btn__content').click();
        /* ==== Generated with Cypress Studio ==== */
        //clicking the image of the result
        cy.get(':nth-child(1) > :nth-child(2) > [role="button"] > [max-height="125px"] > .v-responsive > .v-img__img').click();
        /* ==== End Cypress Studio ==== */
    });

  
  });