describe('Flashcard App Happy Path', () => {
    let userId = 1;
    let categoryId = 1;

    it('should register and login a user', () => {
        // Register a new user
        cy.registerUser('testuser', 'password123');
        
        // Log the user in
        cy.loginUser('testuser', 'password123');
    });

    it('should allow the user to create a category', () => {
        // Fetch the logged-in user's ID
        cy.request('POST', '/user/login', { name: 'testuser', password: 'password123' })

        // Add a new category
        cy.addCategory(userId, 'Mathematics');

        // Verify that the category is saved
        cy.request(`/user/${userId}/categories`).then((response) => {
        const categories = response.body.categories;
        expect(categories).to.have.lengthOf(1);
        expect(categories[0].name).to.eq('Mathematics');
        });
    });

    it('should allow the user to add a flashcard to the category', () => {
        cy.addFlashcard(userId, categoryId, 'What is 2 + 2?', '4');

        // Verify that the flashcard is saved
        cy.request(`/user/${userId}/categories/${categoryId}/flashcards`).then((response) => {
        const flashcards = response.body.flashcards;
        expect(flashcards).to.have.lengthOf(1);
        expect(flashcards[0].question).to.eq('What is 2 + 2?');
        expect(flashcards[0].answer).to.eq('4');
        });
    });

    it('should persist data after reloading', () => {
        // Reload the app
        cy.visit('/');
        
        // Verify the category and flashcards still exist
        cy.request(`/user/${userId}/categories/${categoryId}/flashcards`).then((response) => {
        const flashcards = response.body.flashcards;
        expect(flashcards).to.have.lengthOf(1);
        expect(flashcards[0].question).to.eq('What is 2 + 2?');
        });
    });
});
  