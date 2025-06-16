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

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
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

// Маршрут для получения бронирований текущего пользователя
app.get('/api/my-bookings', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const userId = req.session.userId;

    db.all(`
        SELECT b.id, b.start_date, b.end_date, 
               c.id as car_id, c.brand, c.model, c.year, c.price, c.main_image
        FROM bookings b
        JOIN cars c ON b.car_id = c.id
        WHERE b.user_id = ?
        ORDER BY b.start_date DESC
    `, [userId], (err, bookings) => {
        if (err) {
            console.error('Ошибка получения бронирований:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        res.json(bookings);
    });
});

// Маршрут для отмены бронирования
app.delete('/api/bookings/:id', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
    }

    const bookingId = req.params.id;
    const userId = req.session.userId;

    // Проверяем, что бронирование принадлежит текущему пользователю
    db.get('SELECT user_id FROM bookings WHERE id = ?', [bookingId], (err, row) => {
        if (err) {
            console.error('Ошибка проверки бронирования:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }

        if (!row || row.user_id !== userId) {
            return res.status(404).json({ error: 'Бронирование не найдено или вам не принадлежит' });
        }

        db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function (err) {
            if (err) {
                console.error('Ошибка удаления бронирования:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
            }

            res.json({ success: true });
        });
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

app.get('/api/cars/index', (req, res) => {
    const query = 'SELECT * FROM cars LIMIT 3';
    db.all(query, [], (err, cars) => {
        if (err) {
            console.error('Ошибка при запросе к БД:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(cars);
    });
});

// Проверка существования пользователя и автомобиля
async function checkExists(db, table, id) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT id FROM ${table} WHERE id = ?`, [id], (err, row) => {
            if (err) return reject(err);
            resolve(!!row);
        });
    });
}

// Эндпоинт для бронирования
app.post('/api/bookings', async (req, res) => {
    const { phone, startDate, endDate, carId, userId } = req.body;

    if (!phone) {
        return res.status(400).json({ error: 'Номер телефона обязателен' });
    }

    try {
        // Проверяем существование пользователя и автомобиля
        const [userExists, carExists] = await Promise.all([
            checkExists(db, 'users', userId),
            checkExists(db, 'cars', carId)
        ]);

        if (!userExists || !carExists) {
            return res.status(400).json({
                error: 'Неверные данные',
                details: {
                    userExists,
                    carExists
                }
            });
        }

        // Проверяем доступность автомобиля на эти даты
        const isAvailable = await new Promise((resolve, reject) => {
            db.get(
                `SELECT id FROM bookings 
                WHERE car_id = ? 
                AND (
                    (start_date BETWEEN ? AND ?) 
                    OR (end_date BETWEEN ? AND ?)
                    OR (? BETWEEN start_date AND end_date)
                    OR (? BETWEEN start_date AND end_date)
                )`,
                [carId, startDate, endDate, startDate, endDate, startDate, endDate], // Исправлено: убрал phone из параметров проверки доступности
                (err, row) => {
                    if (err) return reject(err);
                    resolve(!row);
                }
            );
        });

        if (!isAvailable) {
            return res.status(400).json({
                error: 'Автомобиль уже забронирован на указанные даты'
            });
        }

        // Создаем бронирование (добавляем phone)
        db.run(
            `INSERT INTO bookings (user_id, car_id, start_date, end_date, phone) 
            VALUES (?, ?, ?, ?, ?)`, // Добавлен phone
            [userId, carId, startDate, endDate, phone], // Добавлен phone
            function (err) {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Ошибка базы данных' });
                }
                res.json({
                    bookingId: this.lastID,
                    message: 'Бронирование успешно создано'
                });
            }
        );
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// // Получение списка бронирований
app.get('/api/user/bookings', (req, res) => {
    const { userId, carId, status } = req.query;
    let query = `SELECT * FROM bookings`;
    const params = [];

    if (userId || carId || status) {
        query += ' WHERE';
        const conditions = [];

        if (userId) {
            conditions.push(' user_id = ?');
            params.push(userId);
        }

        if (carId) {
            conditions.push(' car_id = ?');
            params.push(carId);
        }

        if (status) {
            conditions.push(' status = ?');
            params.push(status);
        }

        query += conditions.join(' AND');
    }

    db.all(query, params, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка базы данных' });
        }
        res.json(rows);
    });
});

// Проверка админских прав
function checkAdmin(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Необходима авторизация' });
    }

    db.get('SELECT role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
        if (err || !user || user.role !== 1) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }
        next();
    });
}

// Маршруты админ-панели
app.get('/admin', checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'admin.html'));
});

// Получение всех бронирований с информацией о пользователях
app.get('/api/admin/bookings', checkAdmin, (req, res) => {
    db.all(`
        SELECT b.id, b.start_date, b.end_date, b.phone,
               u.username, u.email,
               c.brand, c.model, c.year, c.price, c.main_image
        FROM bookings b
        JOIN users u ON b.user_id = u.id
        JOIN cars c ON b.car_id = c.id
        ORDER BY b.start_date DESC
    `, (err, bookings) => {
        if (err) {
            console.error('Ошибка получения бронирований:', err);
            return res.status(500).json({
                error: 'Ошибка сервера',
                details: err.message // Добавляем детали ошибки
            });
        }
        res.json(bookings);
    });
});

// Удаление бронирования (админ)
app.delete('/api/admin/bookings/:id', checkAdmin, (req, res) => {
    const bookingId = req.params.id;

    db.run('DELETE FROM bookings WHERE id = ?', [bookingId], function (err) {
        if (err) {
            console.error('Ошибка удаления бронирования:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json({ success: true });
    });
});

// Получение всех автомобилей
app.get('/api/admin/cars', checkAdmin, (req, res) => {
    db.all('SELECT * FROM cars ORDER BY id DESC', (err, cars) => {
        if (err) {
            console.error('Ошибка получения автомобилей:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json(cars);
    });
});

// Добавление нового автомобиля
app.post('/api/admin/cars', checkAdmin, (req, res) => {
    const { brand, model, year, price, color, fuelType, transmission, main_image } = req.body;

    db.run(
        `INSERT INTO cars 
        (brand, model, year, price, color, fuelType, transmission, main_image) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [brand, model, year, price, color, fuelType, transmission, main_image],
        function (err) {
            if (err) {
                console.error('Ошибка добавления автомобиля:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
            }
            res.json({
                success: true,
                carId: this.lastID
            });
        }
    );
});

// Обновление автомобиля
app.put('/api/admin/cars/:id', checkAdmin, (req, res) => {
    const carId = req.params.id;
    const { brand, model, year, price, color, fuelType, transmission, main_image } = req.body;

    db.run(
        `UPDATE cars SET 
        brand = ?, model = ?, year = ?, price = ?, 
        color = ?, fuelType = ?, transmission = ?, main_image = ?
        WHERE id = ?`,
        [brand, model, year, price, color, fuelType, transmission, main_image, carId],
        function (err) {
            if (err) {
                console.error('Ошибка обновления автомобиля:', err);
                return res.status(500).json({ error: 'Ошибка сервера' });
            }
            res.json({ success: true });
        }
    );
});

// Удаление автомобиля
app.delete('/api/admin/cars/:id', checkAdmin, (req, res) => {
    const carId = req.params.id;

    db.run('DELETE FROM cars WHERE id = ?', [carId], function (err) {
        if (err) {
            console.error('Ошибка удаления автомобиля:', err);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
        res.json({ success: true });
    });
});
module.exports = app;

