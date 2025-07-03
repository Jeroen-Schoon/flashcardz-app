CREATE TABLE if NOT EXISTS users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  password TEXT NOT NULL
);


CREATE TABLE if NOT EXISTS categories (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE if NOT EXISTS user_categories (
  user_id INTEGER,
  category_id INTEGER,
  PRIMARY KEY (user_id, category_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE if NOT EXISTS flashcards (
  id INTEGER PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category_id INTEGER,
  FOREIGN KEY (category_id) REFERENCES categories(id)
);

CREATE TABLE if NOT EXISTS user_flashcards (
    user_id INTEGER,
    flashcard_id INTEGER,
    PRIMARY KEY (user_id, flashcard_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (flashcard_id) REFERENCES flashcards(id)
);


CREATE TABLE IF NOT EXISTS subscriptions (
  id INTEGER PRIMARY KEY,
  endpoint TEXT NOT NULL,
  key_auth TEXT NOT NULL,
  key_p256dh TEXT NOT NULL
);
