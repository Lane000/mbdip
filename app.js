const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session')
// const applicationRoutes = require('./routes/applicationRoutes');
// const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const db = require('./config/db');
const bcrypt = require('bcrypt');
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Настройка сессий
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Регистрация
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;
    console.log("Данные для регистрации:", { username, email, password });

    if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'Все поля обязательны' });
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    db.run('INSERT INTO users (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], function (err) {
        if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ success: false, message: 'Пользователь с таким именем или email уже существует' });
            }
            console.error("Ошибка при регистрации:", err);
            return res.status(500).json({ success: false, message: 'Ошибка при регистрации' });
        }
        console.log("Пользователь успешно зарегистрирован, ID:", this.lastID);
        res.json({ success: true, userId: this.lastID });
    });
});

// Авторизация
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ success: false, message: 'Логин и пароль обязательны' });
    }

    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err || !user) {
            return res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
        }

        if (bcrypt.compareSync(password, user.password)) {
            req.session.userId = user.id;
            res.json({ success: true, userId: user.id });
        } else {
            res.status(401).json({ success: false, message: 'Неверный логин или пароль' });
        }
    });
});

// Проверка авторизации
app.get('/check-auth', (req, res) => {
    if (req.session.userId) {
        db.get('SELECT id, username, email FROM users WHERE id = ?', [req.session.userId], (err, user) => {
            if (err || !user) {
                return res.status(401).json({ success: false, message: 'Пользователь не найден' });
            }
            res.json({ success: true, user });
        });
    } else {
        res.status(401).json({ success: false, message: 'Не авторизован' });
    }
});

// Логаут
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при выходе' });
        }
        res.json({ success: true });
    });
});

app.get('/user-info', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, message: 'Пользователь не авторизован' });
    }

    const userId = req.session.userId;

    db.get('SELECT username, email FROM users WHERE id = ?', [userId], (err, user) => {
        if (err || !user) {
            return res.status(500).json({ success: false, message: 'Ошибка при получении данных пользователя' });
        }
        res.json({ success: true, user });
    });
});

// Маршруты
// app.use('/api', applicationRoutes);
app.use('/api', reviewRoutes);
// app.use('/auth', authRoutes);

// Маршруты для статических страниц
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'index.html'));
});

app.get('/catalog', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'catalog.html'));
});

app.get('/contacts', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'contacts.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'about.html'));
});

app.get('/profile', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'lk.html'));
});

app.get('/feedbacks/html', (req, res) => {
    db.all('SELECT * FROM feedbacks', [], (err, rows) => {
        if (err) {
            return res.status(500).send('Ошибка при получении отзывов');
        }
        const feedbacksHtml = rows.map(feedback => `
            <div>
                <h3>${feedback.name}</h3>
                <p>${feedback.message}</p>
            </div>
        `).join('');
        res.send(feedbacksHtml);
    });
});

// Добавление отзыва
app.post('/feedback', (req, res) => {
    const { name, message } = req.body;
    if (!name || !message) {
        return res.status(400).json({ success: false, message: 'Имя и сообщение обязательны' });
    }
    db.run('INSERT INTO feedbacks (name, message) VALUES (?, ?)', [name, message], function (err) {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при добавлении отзыва' });
        }
        res.json({ success: true, feedback: { id: this.lastID, name, message } });
    });
});

// API для получения автомобилей с фильтрацией
app.get('/api/cars', (req, res) => {
    const {
        brand,
        minYear,
        maxYear,
        minPrice,
        maxPrice,
        color,
        fuelType,
        transmission,
        search,
        sortBy = 'id',
        sortOrder = 'ASC'
    } = req.query;

    // Начало SQL запроса
    let sql = "SELECT * FROM cars";
    const conditions = [];
    const params = [];

    // Добавляем условия фильтрации
    if (brand) {
        conditions.push("brand = ?");
        params.push(brand);
    }

    if (color) {
        conditions.push("color = ?");
        params.push(color);
    }

    if (fuelType) {
        conditions.push("fuelType = ?");
        params.push(fuelType);
    }

    if (transmission) {
        conditions.push("transmission = ?");
        params.push(transmission);
    }

    if (minYear) {
        conditions.push("year >= ?");
        params.push(minYear);
    }

    if (maxYear) {
        conditions.push("year <= ?");
        params.push(maxYear);
    }

    if (minPrice) {
        conditions.push("price >= ?");
        params.push(minPrice);
    }

    if (maxPrice) {
        conditions.push("price <= ?");
        params.push(maxPrice);
    }

    if (search) {
        conditions.push("(brand LIKE ? OR model LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
    }

    // Объединяем условия
    if (conditions.length > 0) {
        sql += " WHERE " + conditions.join(" AND ");
    }

    // Добавляем сортировку
    const validSortColumns = ['id', 'brand', 'model', 'year', 'price', 'mileage'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'id';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    sql += ` ORDER BY ${sortColumn} ${sortDirection}`;

    // Выполняем запрос
    db.all(sql, params, (err, rows) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json(rows);
    });
});

module.exports = app;

