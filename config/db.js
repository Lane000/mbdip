const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to SQLite', err);
    } else {
        console.log('Connected to SQLite database');

        db.serialize(() => {
            // Создание таблицы для заявок
            db.run(`
                CREATE TABLE IF NOT EXISTS requests (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    email TEXT NOT NULL,
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // Создание таблицы для пользователей
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE,
                    password TEXT
                )
            `);

            // Создание таблицы для ролей
            db.run(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL UNIQUE
                )
            `);

            // Создание таблицы для связи пользователей и ролей
            db.run(`
                CREATE TABLE IF NOT EXISTS user_roles (
                    user_id INTEGER,
                    role_id INTEGER,
                    PRIMARY KEY (user_id, role_id),
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
                )
            `);

            // Создание таблицы для отзывов
            db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                message TEXT
            )`);

            // Добавление ролей по умолчанию
            db.run(`
                INSERT OR IGNORE INTO roles (name) VALUES ('user'), ('admin')
            `, (err) => {
                if (err) {
                    console.error('Ошибка при добавлении ролей:', err);
                }
            });
        });
    }
});

module.exports = db;