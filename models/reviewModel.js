const db = require('../config/db');

// Модель отзыва в БД
class Review {
    // Создание отзыва
    static create(username, text, callback) {
        const sql = 'INSERT INTO reviews (username, text) VALUES (?, ?)';
        db.run(sql, [username, text], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null, { id: this.lastID, username, text });
            }
        });
    }

    // Получение всех отзывов
    static getAll(callback) {
        const sql = 'SELECT * FROM reviews ORDER BY createdAt DESC';
        db.all(sql, [], (err, rows) => {
            if (err) {
                callback(err);
            } else {
                callback(null, rows);
            }
        });
    }
}

module.exports = Review;