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
            db.run(`
            CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER NOT NULL,
            price REAL NOT NULL,
            mileage INTEGER NOT NULL,
            color TEXT NOT NULL,
            fuelType TEXT NOT NULL,
            transmission TEXT NOT NULL
            )
            `);

            // Добавление тестовых данных
            db.serialize(() => {
                // Проверяем, есть ли уже данные в таблице
                db.get("SELECT COUNT(*) as count FROM cars", (err, row) => {
                    if (err) throw err;

                    if (row.count === 0) {
                        const cars = [
                            ['Toyota', 'Camry', 2020, 25000, 30000, 'Black', 'Gasoline', 'Automatic'],
                            ['Honda', 'Civic', 2019, 20000, 40000, 'White', 'Gasoline', 'Automatic'],
                            ['Ford', 'Focus', 2018, 15000, 50000, 'Blue', 'Gasoline', 'Manual'],
                            ['Tesla', 'Model 3', 2021, 45000, 10000, 'Red', 'Electric', 'Automatic'],
                            ['BMW', 'X5', 2017, 35000, 60000, 'Silver', 'Diesel', 'Automatic']
                        ];

                        const stmt = db.prepare("INSERT INTO cars (brand, model, year, price, mileage, color, fuelType, transmission) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");

                        cars.forEach(car => {
                            stmt.run(car, err => {
                                if (err) console.error("Error inserting car:", err);
                            });
                        });

                        stmt.finalize();
                        console.log("Test cars added to database");
                    }
                });
            });
        });
    }
});

module.exports = db;