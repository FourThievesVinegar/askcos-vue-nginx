describe('Condition Recommendation Page', () => {
    beforeEach(() => {
      cy.visit('/forward?tab=context');
    });


    it('can input Reactants', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        cy.get('img').first().should('have.attr', 'alt', 'BrBr.c1ccccc1');
    });

    it('can input Product', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        cy.get('[data-cy="product"]').type("Brc1ccccc1");
        cy.get('img').eq(2).should('have.attr', 'alt', 'Brc1ccccc1');
    });


    it('lick to switch between V1/V2', function() {
        
    });


    it('Click to open the setting menu', function() {
        cy.get('button').contains('Settings').click();
        /* ==== Generated with Cypress Studio ==== */
        cy.get('.v-card-title').should('be.visible');
        /* ==== End Cypress Studio ==== */
    });
    

    it('Test SMILES', function() {
        cy.get('[data-cy="reactants"]').type("ClC1CCCCC1.OC1CCCCC1");
        cy.get('[data-cy="product"]').type("C1CCC(OC2CCCCC2)CC1");
        cy.get('[data-cy="submit-button"] > .v-btn__content').click()
        cy.get('tbody').children().should('have.length', 10);
        // cy.get('tbody').children().each(($el, index) => {
        //     // index starts at 0, so we add 1 to get the correct child number
        //     cy.get(`tbody > :nth-child(${index + 1}) > :nth-child(5)`).should('contain', '°C');
        // });
      });
  
  });