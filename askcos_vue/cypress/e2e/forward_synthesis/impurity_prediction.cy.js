describe('Condition Recommendation Page', () => {
    beforeEach(() => {
      cy.visit('/forward?tab=impurity');
    });


    it('can input Reactants', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').first().should('have.attr', 'alt', 'BrBr.c1ccccc1');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Product', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        cy.get('[data-cy="product"]').type("Brc1ccccc1");
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').eq(2).should('have.attr', 'alt', 'Brc1ccccc1');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Reagents', function() {
        cy.get('#input-49').type('C');
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').first().should('have.attr', 'alt', 'C');
        /* ==== End Cypress Studio ==== */
    });

    it('can input Solvents', function() {
        cy.get('#input-49').type('C');
        cy.get('#input-52').type('ClC(Cl)(Cl)Cl');
        /* ==== Generated with Cypress Studio ==== */
        cy.get('img').eq(1).should('have.attr', 'alt', 'ClC(Cl)(Cl)Cl');
        /* ==== End Cypress Studio ==== */
    });
    

    it('Get Result', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        cy.get('[data-cy="submit-button"]').click()
        cy.get('tbody').children().should('have.length', 6);
    });

    it('CLEAR button', function() {
        cy.get('[data-cy="reactants"]').type("BrBr.c1ccccc1");
        cy.get('[data-cy="submit-button"]').click()
        /* ==== Generated with Cypress Studio ==== */
        cy.get('button').contains('Clear Results').click();
        cy.get('button').contains('Ok').click();
        cy.get('#input-32').should('not.be.checked');
        cy.get('#input-35').should('not.be.checked');
        cy.get('#input-49').should('not.be.checked');
        cy.get('#input-52').should('not.be.checked');
        /* ==== End Cypress Studio ==== */
    });
  
  });