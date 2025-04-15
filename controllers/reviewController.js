const Review = require('../models/reviewModel');

// Создаем отзыв в БД
exports.createReview = (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Необходимо авторизоваться' });
    }

    const { text } = req.body;
    const username = req.session.user.username;

    Review.create(username, text, (err, review) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при сохранении отзыва' });
        }
        res.json({ success: true, username: review.username, text: review.text });
    });
};

// Получаем все отзывы из БД
exports.getAllReviews = (req, res) => {
    Review.getAll((err, reviews) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Ошибка при получении отзывов' });
        }
        res.json({ success: true, reviews });
    });
};