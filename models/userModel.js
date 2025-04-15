const db = require('../config/db');
const bcrypt = require('bcrypt');

class User {
    // Сохраняем юзера в БД
    static create(username, email, password, callback) {
        const saltRounds = 10;
        bcrypt.hash(password, saltRounds, (err, hash) => {
            if (err) {
                return callback(err);
            }

            const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            db.run(sql, [username, email, hash], function (err) {
                if (err) {
                    callback(err);
                } else {
                    // Назначаем роль "user" по умолчанию
                    const userId = this.lastID;
                    User.assignRole(userId, 'user', (err) => {
                        if (err) {
                            callback(err);
                        } else {
                            callback(null, { id: userId, username, email });
                        }
                    });
                }
            });
        });
    }

    // Поиск юзера по Email
    static findByEmail(email, callback) {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                callback(err);
            } else {
                callback(null, row);
            }
        });
    }

    // Проверка пароля
    static comparePassword(candidatePassword, hash, callback) {
        bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
            if (err) {
                callback(err);
            } else {
                callback(null, isMatch);
            }
        });
    }

    // Присваивание роли пользователю
    static assignRole(userId, roleName, callback) {
        const sql = 'INSERT INTO user_roles (user_id, role_id) VALUES (?, (SELECT id FROM roles WHERE name = ?))';
        db.run(sql, [userId, roleName], function (err) {
            if (err) {
                callback(err);
            } else {
                callback(null);
            }
        });
    }
}

module.exports = User;