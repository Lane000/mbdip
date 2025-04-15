const express = require('express');
const db = require('../config/db');

const router = express.Router();

// Получение всех отзывов в формате JSON
router.get('/feedbacks', (req, res) => {
    db.all('SELECT * FROM feedbacks', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при получении отзывов' });
        }
        res.json(rows);
    });
});

// Получение отзывов в формате HTML для вставки в <div id="feedback-list">
router.get('/feedbacks/html', (req, res) => {
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

// Добавление нового отзыва
router.post('/feedback', (req, res) => {
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

module.exports = router;
