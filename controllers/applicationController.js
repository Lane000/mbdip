const Application = require('../models/applicationModel');

// Создаем заявку в БД
exports.createApplication = (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ message: 'Имя и email обязательны' });
    }

    Application.create(name, email, (err, data) => {
        if (err) {
            res.status(400).json({ message: err.message });
        } else {
            res.status(201).json(data);
        }
    });
};