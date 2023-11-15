describe('Buyable Compounds Page', () => {
  beforeEach(() => {
    cy.visit('/buyables');
  });

  it('can search compounds', () => {
    cy.get('[placeholder="SMILES/SMARTS"]').type('c1ccccc1');
    cy.get('button').contains('Search').click();
    cy.get('img').first().should('have.attr', 'alt', 'c1ccccc1');
  });


  it('can change similarity threshold', () => {
    cy.get('[data-cy="similarity-input-element"] input')
      .clear()
      .type('0.5');
  });

  it('can input similarity threshold', () => {
    cy.get('[id^="input-34"]')
      .clear({force: true})
      .type('0.5');
  });

  it('can limit number of results', () => {
    cy.get('[id^="input-37"]')
      .clear({force: true})
      .type('4');
  });

  it('can search compounds with limit 2', () => {
    cy.get('[placeholder="SMILES/SMARTS"]').type('c1ccccc1');
    cy.get('[id^="input-37"]')
    .clear({force: true})
    .type('2');
    cy.get('button').contains('Search').click();
    cy.get('img').should('have.length', 2)
  });

});