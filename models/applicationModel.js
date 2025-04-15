const db = require('../config/db');

// Модель заявки в БД
class Application {
    static create(name, email, callback) {
        const sql = 'INSERT INTO requests (name, email) VALUES (?, ?)';
        db.run(sql, [name, email], function (err) {
            if (err) {
                callback(err, null);
            } else {
                callback(null, { id: this.lastID, name, email });
            }
        });
    }
}

module.exports = Application;