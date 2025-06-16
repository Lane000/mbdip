const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite', err);
    } else {
        console.log('Подключено к БД SQLite');

        db.serialize(() => {
            db.run(`
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    email TEXT UNIQUE,
                    password TEXT,
                    role INTEGER,
                    FOREIGN KEY (role) REFERENCES roles(id)
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS roles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    role TEXT
                )
            `);

            db.run(`INSERT OR IGNORE INTO roles (role) VALUES ('admin')`);
            db.run(`INSERT OR IGNORE INTO roles (role) VALUES ('user')`);

            // Проверяем наличие администратора
            db.get("SELECT COUNT(*) as count FROM users WHERE username = 'admin'", (err, row) => {
                if (err) {
                    console.error("Ошибка проверки администратора:", err);
                    return;
                }

                if (row.count === 0) {
                    const adminPassword = bcrypt.hashSync('admin123', 10); // Хэшируем пароль
                    db.run(
                        `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`,
                        ['admin', 'admin@example.com', adminPassword, 1],
                        function (err) {
                            if (err) {
                                console.error("Ошибка добавления администратора:", err);
                            } else {
                                console.log("Администратор создан. Логин: admin, Пароль: admin123");
                            }
                        }
                    );
                }
            });

            db.run(`CREATE TABLE IF NOT EXISTS feedbacks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                message TEXT
            )`);

            db.run(`
                CREATE TABLE IF NOT EXISTS cars (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    brand TEXT NOT NULL,
                    model TEXT NOT NULL,
                    year INTEGER NOT NULL,
                    price REAL NOT NULL,
                    color TEXT NOT NULL,
                    fuelType TEXT NOT NULL,
                    transmission TEXT NOT NULL,
                    main_image TEXT
                )
            `);

            db.run(`
                CREATE TABLE IF NOT EXISTS bookings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    car_id INTEGER NOT NULL,
                    start_date TEXT NOT NULL,
                    end_date TEXT NOT NULL,
                    phone TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(id),
                    FOREIGN KEY(car_id) REFERENCES cars(id)
                )
            `);

            db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
                if (err) {
                    console.error("Ошибка проверки автомобилей:", err);
                    return;
                }

                if (row.count === 0) {
                    const cars = [
                        ['Kia', 'K5', 2022, 25000, 'Черный', 'Бензин', 'Автоматическая', 'https://dacartur.com/assets/components/phpthumbof/cache/kia-k5-1.bc462d18a20ae278397b1db9e154be01.jpg'],
                        ['Mazda', '6', 2020, 20000, 'Белый', 'Бензин', 'Механическая', 'https://prokatmashin116.ru/photos/big/aa39f19b1d81b3c62bfc2ed344c05520.jpg'],
                        ['Lixiang', 'LI7', 2024, 40000, 'Белый', 'Электро', 'Автоматическая', 'https://cl-energy.ru/wp-content/uploads/2023/06/Lixiang-L7_14.jpg'],
                        ['Lexus', '350F', 2021, 45000, 'Красный', 'Бензин', 'Автоматическая', 'https://orenburg.dacartur.com/assets/img/novosti-vse/lexus-2023/1-(10).jpg'],
                        ['Lexus', 'GS250', 2019, 35000, 'Серебристый', 'Дизель', 'Автоматическая', 'https://ekaterinburg.dacartur.com/assets/components/phpthumbof/cache/8.81bb3e86b3f66d6b400bb552d96fa537.png']
                    ];

                    const stmt = db.prepare(`
                        INSERT INTO cars 
                        (brand, model, year, price, color, fuelType, transmission, main_image) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    `);

                    cars.forEach(car => {
                        stmt.run(car, err => {
                            if (err) console.error("Ошибка добавления авто:", err);
                        });
                    });

                    // stmt.finalize(err => {
                    //     if (err) console.error("Ошибка завершения stmt:", err);

                    //     db.run(`
                    //         INSERT OR IGNORE INTO bookings 
                    //         (user_id, car_id, start_date, end_date, status)
                    //         SELECT 1, id, '2023-12-01', '2023-12-10', 'active'
                    //         FROM cars WHERE brand = 'Kia' AND model = 'K5' LIMIT 1
                    //     `, (err) => {
                    //         if (err) console.error("Ошибка добавления бронирования:", err);
                    //     });
                    // });
                }
            });
        });
    }
});

// Обработка ошибок
db.on('error', (err) => {
    console.error('Ошибка SQLite:', err);
});

module.exports = db;