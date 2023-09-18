describe('Buyable Compounds Page', () => {
  beforeEach(() => {
    cy.visit('/buyables');
  });

  it('displays page title and description', () => {
    cy.get('h1').contains('Buyable Compounds');
    cy.get('p.text-body-1').contains('The chemicals and prices stored in our database are taken from Reaxys');
  });

  it('can search compounds', () => {
    cy.get('input[placeholder="SMILES/SMARTS"]').type('c1ccccc1');
    cy.get('button').contains('Search').click();
    cy.get('img').first().should('have.attr', 'alt', 'c1ccccc1');
  });

  it('can filter by source', () => {
    cy.get('button').contains('Select Sources').click();

    cy.get('[data-cy="all-sources-checkbox"]')
      .find('input[type="checkbox"]')
      .check();
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

  it('can add new compound', () => {
    cy.get('button[data-cy="add-compound-button"]').click();
    cy.get('v-text-field[label="SMILES"]').type('c1ccccc1');
    cy.get('input[label="Price per gram"]').type('10');
    cy.get('input[label="Source"]').type('');
    cy.get('button').contains('Add Entry').click();

    cy.get('td').contains('c1ccccc1');
    cy.get('td').contains('10');
    cy.get('td').contains('Test');
  });

});