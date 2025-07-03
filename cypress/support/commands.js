// Custom Command to register a user
Cypress.Commands.add('registerUser', (username, password) => {
    cy.request('POST', '/user/register', { name: username, password: password }).then((response) => {
            expect(response.status).to.eq(201);
        });
    });

    // Custom Command to log in
    Cypress.Commands.add('loginUser', (username, password) => {
        cy.request('POST', '/user/login', { name: username, password: password }).then((response) => {
            expect(response.status).to.eq(200);
        });
    });

    // Custom Command to add a category
    Cypress.Commands.add('addCategory', (userId, categoryName) => {
        cy.request('POST', `/user/${userId}/categories`, { categoryName }).then((response) => {
            expect(response.status).to.eq(201);
        });
    });

    // Custom Command to add a flashcard
    Cypress.Commands.add('addFlashcard', (userId, categoryId, question, answer) => {
        cy.request('POST', `/user/${userId}/categories/${categoryId}/flashcards`, { question, answer }).then((response) => {
            expect(response.status).to.eq(201);
        });
    });