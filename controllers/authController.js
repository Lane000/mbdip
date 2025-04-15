const User = require('../models/userModel');

// Регистрируем пользователя
exports.register = (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: 'Все поля обязательны' });
    }

    User.create(username, email, password, (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при регистрации' });
        }
        res.status(201).json({ message: 'Пользователь зарегистрирован', user });
    });
};

// Сохраняем пользователя в сессии
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email и пароль обязательны' });
    }

    User.findByEmail(email, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Неверный email или пароль' });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(401).json({ message: 'Неверный email или пароль' });
            }

            req.session.user = user;
            res.json({ message: 'Авторизация успешна', user });
        });
    });
};

// Удаляем пользователя из сессии
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Ошибка при выходе' });
        }
        res.json({ message: 'Выход выполнен успешно' });
    });
};

// Проверяем авторизацию
exports.check = (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, username: req.session.user.username });
    } else {
        res.json({ isAuthenticated: false });
    }
};