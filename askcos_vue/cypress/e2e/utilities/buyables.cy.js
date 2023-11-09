/* global cy */
describe('Buyable Compounds Page', () => {
  beforeEach(() => {
    cy.visit('/buyables');
  });

  it('can search compounds', () => {
    cy.get('[data-cy="all-sources-checkbox"]').type('c1ccccc1');
    cy.get('button').contains('Search').click();
    cy.get('img').first().should('have.attr', 'alt', 'c1ccccc1');
  });


  it('can change similarity threshold', () => {
    cy.get('[data-cy="similarity-input-element"] input')
      .clear()
      .type('0.5');
  });

  it('can limit number of results', () => {
    cy.get('[data-cy="result-input-element"] input')
      .clear()
      .type('10');
  });

});