// // Registration
// describe('User Registration', () => {
//   it('should register a new user', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/register',
//       body: {
//         name: 'testuser',
//         password: 'password123'
//       }
//     }).then((response) => {
//       expect(response.status).to.eq(201);
//       expect(response.body.user).to.have.property('id');
//       expect(response.body.user).to.have.property('name', 'testuser');
//     });
//   });

//   it('should not allow duplicate user registration', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/register',
//       body: {
//         name: 'testuser',
//         password: 'password123'
//       },
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(401);
//       expect(response.body).to.have.property('error', 'User already exists.');
//     });
//   });
// });

// // Login
// describe('User Login', () => {
//   it('should login successfully with valid credentials', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/login',
//       body: {
//         name: 'testuser',
//         password: 'password123'
//       }
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body.user).to.have.property('id');
//       expect(response.body.user).to.have.property('name', 'testuser');
//     });
//   });

//   it('should fail login with invalid credentials', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/login',
//       body: {
//         name: 'testuser',
//         password: 'wrongpassword'
//       },
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(401);
//       expect(response.body).to.have.property('error', 'Invalid username or password.');
//     });
//   });
// });

// // Categories
// describe('Get User Categories', () => {
//   it('should return categories for a valid user', () => {
//     cy.request({
//       method: 'GET',
//       url: '/user/1/categories'
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('categories');
//     });
//   });

//   it('should return an error for missing user ID', () => {
//     cy.request({
//       method: 'GET',
//       url: '/user//categories',
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(400);
//       expect(response.body).to.have.property('error', 'User ID is required to fetch categories.');
//     });
//   });
// });

// describe('Add Category', () => {
//   it('should add a category for the user', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/1/categories',
//       body: { categoryName: 'Science' }
//     }).then((response) => {
//       expect(response.status).to.eq(201);
//     });
//   });

//   it('should return an error for missing category name', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/1/categories',
//       body: {},
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(400);
//       expect(response.body).to.have.property('error', 'A category name is required to add a category.');
//     });
//   });
// });

// describe('Remove Category', () => {
//   it('should remove a category for the user', () => {
//     cy.request({
//       method: 'DELETE',
//       url: '/user/1/categories/1'
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('message', 'Category removed successfully.');
//     });
//   });

//   it('should return an error for non-existent category', () => {
//     cy.request({
//       method: 'DELETE',
//       url: '/user/1/categories/999',
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(404);
//       expect(response.body).to.have.property('error', 'User-category relation not found.');
//     });
//   });
// });

// describe('Get Flashcards', () => {
//   it('should return flashcards for a valid category', () => {
//     cy.request({
//       method: 'GET',
//       url: '/user/1/categories/1/flashcards'
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('flashcards');
//     });
//   });

//   it('should return an error for missing user or category ID', () => {
//     cy.request({
//       method: 'GET',
//       url: '/user//categories//flashcards',
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(400);
//       expect(response.body).to.have.property('error', 'User ID and Category ID are required.');
//     });
//   });
// });

// describe('Get Flashcard by ID', () => {
//   it('should return a flashcard by its ID', () => {
//     cy.request({
//       method: 'GET',
//       url: '/flashcard/1'
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body.flashcard).to.have.property('id');
//     });
//   });

//   it('should return a 404 for non-existent flashcard', () => {
//     cy.request({
//       method: 'GET',
//       url: '/flashcard/999',
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(404);
//       expect(response.body).to.have.property('error', 'Flashcard not found.');
//     });
//   });
// });

// describe('Add Flashcard', () => {
//   it('should add a new flashcard', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/1/categories/1/flashcards',
//       body: { question: 'What is Cypress?', answer: 'A testing framework' }
//     }).then((response) => {
//       expect(response.status).to.eq(201);
//       expect(response.body).to.have.property('id');
//     });
//   });

//   it('should return an error for missing fields', () => {
//     cy.request({
//       method: 'POST',
//       url: '/user/1/categories/1/flashcards',
//       body: { question: '', answer: '' },
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(400);
//       expect(response.body).to.have.property('error', 'User ID, Category ID, question, and answer are required.');
//     });
//   });
// });

// describe('Update Flashcard', () => {
//   it('should update an existing flashcard', () => {
//     cy.request({
//       method: 'PUT',
//       url: '/flashcard/1',
//       body: { question: 'Updated question?', answer: 'Updated answer' }
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('id');
//     });
//   });

//   it('should return 404 for non-existent flashcard', () => {
//     cy.request({
//       method: 'PUT',
//       url: '/flashcard/999',
//       body: { question: 'Does not exist', answer: 'N/A' },
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(404);
//       expect(response.body).to.have.property('error', 'Flashcard not found.');
//     });
//   });
// });


// describe('Delete Flashcard', () => {
//   it('should delete an existing flashcard', () => {
//     cy.request({
//       method: 'DELETE',
//       url: '/flashcard/1'
//     }).then((response) => {
//       expect(response.status).to.eq(200);
//       expect(response.body).to.have.property('message', 'Flashcard deleted.');
//     });
//   });

//   it('should return 404 for non-existent flashcard', () => {
//     cy.request({
//       method: 'DELETE',
//       url: '/flashcard/999',
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(404);
//       expect(response.body).to.have.property('error', 'Flashcard not found.');
//     });
//   });
// });

// describe('Push Notification Subscription', () => {
//   it('should subscribe for push notifications', () => {
//     cy.request({
//       method: 'POST',
//       url: '/subscribe',
//       body: {
//         endpoint: '/push',
//         expirationTime: null,
//         keys: {
//           p256dh: 'valid_p256dh_key',
//           auth: 'valid_auth_key'
//         }
//       }
//     }).then((response) => {
//       expect(response.status).to.eq(201);
//     });
//   });

//   it('should return an error for missing subscription data', () => {
//     cy.request({
//       method: 'POST',
//       url: '/subscribe',
//       body: {},
//       failOnStatusCode: false
//     }).then((response) => {
//       expect(response.status).to.eq(400);
//       expect(response.body).to.have.property('error', 'Invalid subscription data.');
//     });
//   });
// });
