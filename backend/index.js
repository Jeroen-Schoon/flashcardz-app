"use strict";

import {default as Express} from 'express';
import * as HTTP from 'http';
import * as Vite from 'vite';
import {svelte} from '@sveltejs/vite-plugin-svelte';
import Database from 'better-sqlite3'; // Documentation: https://github.com/JoshuaWise/better-sqlite3/wiki/API
import * as fs from 'fs';
import bcrypt from 'bcrypt';
import webpush from 'web-push'; // Push API

// If you want to reset to a clean database, uncomment this line for a second or two:
//fs.unlinkSync('.data/sqlite3.db');
const db = new Database('sqlite3.db');

// Make sure tables and initial data exist in the database
db.exec(fs.readFileSync('backend/schema.sql').toString());
console.log(`DBString: ${fs.readFileSync('backend/schema.sql').toString()}`);

// Create our express app
const app = Express();
app.use(Express.json());

// Connect it to a web server
const httpServer = HTTP.createServer();
httpServer.on('request', app);


// Register a new user.
app.post('/user/register', async function(req, res) {
	const { name, password } = req.body

	// Check if the username is already taken
	if (db.prepare('SELECT * FROM users WHERE name = ?').get(name)) {
		return res.status(401).json({ error: 'User already exists.' });
	}

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

	// Insert the new user into the users table
	const insert = db.prepare('insert into users(name, password) values(?, ?)').run(name, hashedPassword);

	// Fetch the newly registered user
	const user = db.prepare('SELECT * FROM users WHERE id = ?').get(insert.lastInsertRowid);
	res.status(201).json({ user: { id: user.id, name: user.name } });
});

// Login as user.
app.post('/user/login', async function(req, res) {
	const { name, password } = req.body;

	if (!name || !password) {
        return res.status(400).json({ error: 'Username and password are required.' });
    }

    // Query the database to find the user with the provided username and password
	const user = db.prepare('SELECT * FROM users WHERE name = ?').get(name);

	if (user && await bcrypt.compare(password, user.password)) {
        
        // Send a push notification after logging in
        const subscriptions = db.prepare('SELECT * FROM subscriptions').all();
        
        const payload = JSON.stringify({
            title: `Welcome back ${name}!`,
            body: 'Let\'s get learning!',
            icon: 'assets/svg/flashcardz-favicon-color.svg',
        });
        
        subscriptions.forEach(sub => {
            const pushSubscription = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.key_auth,
                    p256dh: sub.key_p256dh
                }
            };
            
            webpush.sendNotification(pushSubscription, payload)
            .then(response => {
                console.log('Push notification sent successfully:', response);
            })
            .catch(error => {
                console.error('Error sending push notification:', error);
            });
        });
        // Successful login
        res.status(200).json({ user: { id: user.id, name: user.name } });
    } else {
        // Invalid credentials
        res.status(401).json({ error: 'Invalid username or password.' });
    }
});

// Get all categories
app.get('/user/:id/categories', function(req, res) {
	const userId = req.params.id;

	if (!userId) {
		return res.status(400).json({ error: 'User ID is required to fetch categories.' });
	}

	const categories = db.prepare(`
		SELECT c.name, c.id FROM categories c
		JOIN user_categories uc ON c.id = uc.category_id
		WHERE uc.user_id = ?
	`).all(userId)

	res.status(200).json({ categories: categories });
});


// Add new category
app.post('/user/:id/categories', function(req, res) {
	const userId = req.params.id;
	const categoryName = req.body.categoryName;

	if (!userId) {
		return res.status(400).json({ error: 'User ID is required to add a category.' });
	} else if (!categoryName) {
		return res.status(400).json({ error: 'A category name is required to add a category.' });
	}

	// Check if a category with the given name already exists.
	const existingCategory = db.prepare('SELECT * FROM categories WHERE name = ?').get(categoryName)
	if (existingCategory) {
		// Check if the user already has this category.
		const existingUserCategory = db.prepare(`
			SELECT * FROM user_categories WHERE user_id = ? AND category_id = ?
		`).get(userId, existingCategory.id);

		if (existingUserCategory) {
			// Return an error when the user already owns this category.
			return res.status(401).json({ error: 'The user already got this category.' });
		}

		// Add the existing category to the users categories.
		const newUserCategory = db.prepare(`
			INSERT INTO user_categories(user_id, category_id) values(?, ?)
		`).run(userId, existingCategory.id);

		res.status(201).json({ category: newUserCategory.name })

	} else {
		// Insert a new category in the categories table.
		const newCategory = db.prepare('INSERT INTO categories(name) values(?)').run(categoryName);
		const newUserCategory = db.prepare(`
			INSERT INTO user_categories(user_id, category_id) values(?, ?)
		`).run(userId, newCategory.lastInsertRowid);

		res.status(201).json({ category: newUserCategory.name });
	}
});

// Remove a category
app.delete('/user/:userId/categories/:categoryId', function(req, res) {
    const { userId, categoryId } = req.params;

    // Delete the row from the join table (user_categories)
    const deleteUserCategory = db.prepare(`
		DELETE FROM user_categories WHERE user_id = ? AND category_id = ?
	`);
    const result = deleteUserCategory.run(userId, categoryId);

    if (result.changes === 0) {
        return res.status(404).json({ error: 'User-category relation not found.' });
    }

    // Check if any other users are using this category
    const otherUsersCount = db.prepare(`
        SELECT COUNT(*) AS count FROM user_categories WHERE category_id = ?
    `).get(categoryId).count;

    // If no other users use the category, delete it from the categories table
    if (otherUsersCount === 0) {
        const deleteCategory = db.prepare(`DELETE FROM categories WHERE id = ?`);
        deleteCategory.run(categoryId);
    }

    res.status(200).json({ message: 'Category removed successfully.' });
});

// Get all flashcards for a specific user and category
app.get('/user/:userId/categories/:categoryId/flashcards', function(req, res) {
    const { userId, categoryId } = req.params;

    if (!userId || !categoryId) {
        return res.status(400).json({ error: 'User ID and Category ID are required.' });
    }

    const flashcards = db.prepare(`
        SELECT id, question, answer FROM flashcards
        WHERE category_id IN (
            SELECT category_id FROM user_categories WHERE user_id = ?
        ) AND category_id = ?
    `).all(userId, categoryId);

    res.status(200).json({ flashcards });
});

// Get a specific flashcard by ID
app.get('/flashcard/:id', function(req, res) {
    const { id } = req.params;

    const flashcard = db.prepare('SELECT id, question, answer FROM flashcards WHERE id = ?').get(id);

    if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found.' });
    }

    res.status(200).json({ flashcard });
});


// Add a new flashcard
app.post('/user/:userId/categories/:categoryId/flashcards', function(req, res) {
    const { userId, categoryId } = req.params;
    const { question, answer } = req.body;

    if (!userId || !categoryId || !question || !answer) {
        return res.status(400).json({ error: 'User ID, Category ID, question, and answer are required.' });
    }

    // Insert new flashcard
    const newFlashcard = db.prepare(`
        INSERT INTO flashcards (question, answer, category_id) VALUES (?, ?, ?)
    `).run(question, answer, categoryId);

	const newUserFlashcard = db.prepare(`
		INSERT INTO user_flashcards (user_id, flashcard_id) VALUES (?, ?)
	`).run(userId, newFlashcard.lastInsertRowid);

    res.status(201).json({ id: newFlashcard.lastInsertRowid, question, answer });
});

// Update an existing flashcard
app.put('/flashcard/:id', function(req, res) {
    const { id } = req.params;
    const { question, answer } = req.body;

    const flashcard = db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
    
    if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found.' });
    }

    // Update the flashcard
    db.prepare('UPDATE flashcards SET question = ?, answer = ? WHERE id = ?').run(question, answer, id);

    res.status(200).json({ id, question, answer });
});

// Delete a flashcard
app.delete('/flashcard/:id', function(req, res) {
    const { id } = req.params;

    const flashcard = db.prepare('SELECT * FROM flashcards WHERE id = ?').get(id);
    
    if (!flashcard) {
        return res.status(404).json({ error: 'Flashcard not found.' });
    }

    // Delete related records in user_flashcards table (or any other related tables)
    db.prepare('DELETE FROM user_flashcards WHERE flashcard_id = ?').run(id);

    // Delete the flashcard
    db.prepare('DELETE FROM flashcards WHERE id = ?').run(id);

    res.status(204).send(); // No content to return
});

// VAPID keys (private and public)
const vapidKeys = {
    publicKey: 'BOoKqFYaUWjE3-5P11iJ_xu3T9L2fLxCp1XoYuuwRe7dCP635UpUbSYKq14WEymdiMQkpyV6xBZ6O8knfQ63tlk',
    privateKey: 'YjrNAvwFv8UhIDa26KwFOnx9oSNvZJBorOOH-PtJj-I'
};

// Configure VAPID keys
webpush.setVapidDetails(
    'mailto:you@example.com',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// API route to handle new subscribers
app.post('/subscribe', (req, res) => {
    const { endpoint, keys } = req.body;

    if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
        return res.status(400).json({ error: 'Invalid subscription data.' });
    }

    try {
        // Check if the subscription already exists in the database
        const existingSubscription = db.prepare('SELECT * FROM subscriptions WHERE endpoint = ?').get(endpoint);

        if (existingSubscription) {
            // If the subscription already exists, update it (in case the keys have changed)
            db.prepare(`
                UPDATE subscriptions
                SET key_auth = ?, key_p256dh = ?
                WHERE endpoint = ?
            `).run(keys.auth, keys.p256dh, endpoint);
            return res.status(200).json({ message: 'Subscription updated.' });
        }

        // Insert the new subscription
        db.prepare(`
            INSERT INTO subscriptions (endpoint, key_auth, key_p256dh)
            VALUES (?, ?, ?)
        `).run(endpoint, keys.auth, keys.p256dh);

        res.status(201).json({ message: 'Subscription saved successfully.' });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription.' });
    }
});


// All other requests are handled by Vite, to server our Svelte frontend application.
app.use((await Vite.createServer({
	root: 'frontend/',
	logLevel: 'info',
	server: {
		middlewareMode: true,
		hmr: {server: httpServer}
	},
	plugins: [
		svelte(),
	],
	appType: 'spa',
})).middlewares);

// Read host and port from environment variables and start the web server
const host = process.env.HOST || '0.0.0.0';
const port = (0|process.env.PORT) || 3000;
httpServer.listen(port, host, () => {
	console.log(`Running at http://${host}:${port}`);
});
