const sqlite3 = require('sqlite3').verbose();

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
                    password TEXT
                )
            `);


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
            transmission TEXT NOT NULL
            )
            `);
        });
        db.serialize(() => {
            db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
                if (err) throw err;

                if (row.count === 0) {
                    const cars = [
                        ['Kia', 'K5', 2022, 25000, 'Черный', 'Бензин', 'Автоматическая'],
                        ['Mazda', '6', 2020, 20000, 'Белый', 'Бензин', 'Механическая'],
                        ['Lixiang', 'LI7', 2024, 40000, 'Белый', 'Электро', 'Автоматическая'],
                        ['Lexus', '350F', 2021, 45000, 'Красный', 'Бензин', 'Автоматическая'],
                        ['Lexus', 'GS250', 2019, 35000, 'Серебристый', 'Дизель', 'Автоматическая']
                    ];

                    const stmt = db.prepare("INSERT INTO cars (brand, model, year, price, color, fuelType, transmission) VALUES (?, ?, ?, ?, ?, ?, ?)");

                    cars.forEach(car => {
                        stmt.run(car, err => {
                            if (err) console.error("Ошибка добавления авто:", err);
                        });
                    });

                    stmt.finalize();
                }
            });
        });
    }
});

module.exports = db;