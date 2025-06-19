document.addEventListener('DOMContentLoaded', function () {
    // Проверка авторизации и прав
    checkAuth();

    // Элементы интерфейса
    const sidebarItems = document.querySelectorAll('.sidebar li');
    const tabContents = document.querySelectorAll('.tab-content');
    const logoutButton = document.getElementById('logoutButton');
    const addCarBtn = document.getElementById('add-car-btn');
    const modal = document.getElementById('car-modal');
    const closeModal = document.querySelector('.close-modal');
    const carForm = document.getElementById('car-form');
    const modalTitle = document.getElementById('modal-title');

    // Переключение между вкладками
    sidebarItems.forEach(item => {
        item.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');

            sidebarItems.forEach(i => i.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));

            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            if (tabName === 'bookings') {
                loadBookings();
            } else if (tabName === 'cars') {
                loadCars();
            } else if (tabName === 'feedbacks') {
                loadFeedbacks();
            }
        });
    });

    // Загрузка бронирований
    function loadBookings() {
        fetch('/api/admin/bookings', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    return response.json().then(err => {
                        throw new Error(err.error || 'Ошибка сервера');
                    });
                }
                return response.json();
            })
            .then(bookings => {
                const container = document.getElementById('bookings-container');

                if (bookings.length === 0) {
                    container.innerHTML = '<p>Нет бронирований</p>';
                    return;
                }

                container.innerHTML = bookings.map(booking => `
            <div class="booking-card" data-id="${booking.id}">
                <h3>${booking.brand} ${booking.model} (${booking.year})</h3>
                <p><strong>Пользователь:</strong> ${booking.username}</p>
                <p><strong>Email:</strong> ${booking.email}</p>
                ${booking.phone ? `<p><strong>Телефон:</strong> ${booking.phone}</p>` : ''}
                <p><strong>Дата начала:</strong> ${booking.start_date}</p>
                <p><strong>Дата окончания:</strong> ${booking.end_date}</p>
                <p><strong>Цена:</strong> ₽${booking.price}</p>
                <button class="delete-booking">Удалить бронь</button>
            </div>
        `).join('');

                // Обработчики удаления бронирований
                document.querySelectorAll('.delete-booking').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const card = this.closest('.booking-card');
                        const bookingId = card.getAttribute('data-id');
                        deleteBooking(bookingId);
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка:', error);
                document.getElementById('bookings-container').innerHTML = `
            <div class="error">${error.message}</div>
        `;
            });
    }

    // Удаление бронирования
    function deleteBooking(bookingId) {
        if (!confirm('Вы уверены, что хотите удалить это бронирование?')) return;

        fetch(`/api/admin/bookings/${bookingId}`, {
            method: 'DELETE',
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка удаления');
                return response.json();
            })
            .then(() => {
                loadBookings();
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Не удалось удалить бронирование');
            });
    }

    // Загрузка автомобилей
    function loadCars() {
        fetch('/api/admin/cars', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети');
                return response.json();
            })
            .then(cars => {
                const container = document.getElementById('cars-container');

                if (cars.length === 0) {
                    container.innerHTML = '<p>Нет автомобилей</p>';
                    return;
                }

                container.innerHTML = `
                <div class="cars-grid">
                    ${cars.map(car => `
                        <div class="car-card" data-id="${car.id}">
                            <img src="${car.main_image}" alt="${car.brand} ${car.model}">
                            <div class="car-info">
                                <h3>${car.brand} ${car.model} (${car.year})</h3>
                                <p><strong>Цена:</strong> ₽${car.price}</p>
                                <p><strong>Цвет:</strong> ${car.color}</p>
                                <p><strong>Топливо:</strong> ${car.fuelType}</p>
                                <p><strong>Трансмиссия:</strong> ${car.transmission}</p>
                                <div class="car-actions">
                                    <button class="edit-car">Редактировать</button>
                                    <button class="delete-car">Удалить</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;

                // Обработчики для кнопок автомобилей
                document.querySelectorAll('.edit-car').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const card = this.closest('.car-card');
                        const carId = card.getAttribute('data-id');
                        editCar(carId);
                    });
                });

                document.querySelectorAll('.delete-car').forEach(btn => {
                    btn.addEventListener('click', function () {
                        const card = this.closest('.car-card');
                        const carId = card.getAttribute('data-id');
                        deleteCar(carId);
                    });
                });
            })
            .catch(error => {
                console.error('Ошибка:', error);
                document.getElementById('cars-container').innerHTML = `
                <div class="error">Ошибка загрузки автомобилей</div>
            `;
            });
    }

    // Удаление автомобиля
    async function deleteCar(carId) {
        if (!carId) {
            showNotification('ID автомобиля не указан', 'error');
            return;
        }

        if (!confirm(`Вы уверены, что хотите удалить автомобиль #${carId}?`)) {
            return;
        }

        try {
            // Показываем индикатор загрузки
            const deleteBtn = document.querySelector(`[data-car-id="${carId}"] .delete-btn`);
            if (deleteBtn) {
                deleteBtn.disabled = true;
                deleteBtn.textContent = 'Удаление...';
            }

            const response = await fetch(`/api/admin/cars/${carId}`, {
                method: 'DELETE',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.error ||
                    errorData.message ||
                    `Ошибка сервера: ${response.status}`
                );
            }

            // Плавное удаление из интерфейса
            const carElement = document.querySelector(`.car-card[data-id="${carId}"]`);
            if (carElement) {
                carElement.style.transition = 'opacity 0.3s ease';
                carElement.style.opacity = '0';
                setTimeout(() => {
                    carElement.remove();
                }, 300);
            }

            showNotification(`Автомобиль #${carId} успешно удалён`, 'success');

        } catch (error) {
            console.error('Ошибка удаления:', error);
            showNotification(
                error.message || 'Не удалось удалить автомобиль',
                'error'
            );
        } finally {
            // Восстанавливаем кнопку в любом случае
            const deleteBtn = document.querySelector(`[data-car-id="${carId}"] .delete-btn`);
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.textContent = 'Удалить';
            }
        }
    }

    // Инициализация обработчиков
    function initDeleteButtons() {
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const carId = btn.closest('[data-car-id]').dataset.carId;
                deleteCar(carId);
            });
        });
    }

    // Загрузка данных при открытии страницы
    document.addEventListener('DOMContentLoaded', () => {
        initDeleteButtons();
    });

    // Редактирование автомобиля
    function editCar(carId) {
        fetch(`/api/admin/cars/${carId}`, {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сети');
                return response.json();
            })
            .then(car => {
                // Заполняем форму данными автомобиля
                document.getElementById('car-id').value = car.id;
                document.getElementById('brand').value = car.brand;
                document.getElementById('model').value = car.model;
                document.getElementById('year').value = car.year;
                document.getElementById('price').value = car.price;
                document.getElementById('color').value = car.color;
                document.getElementById('fuelType').value = car.fuelType;
                document.getElementById('transmission').value = car.transmission;
                document.getElementById('main_image').value = car.main_image;

                // Показываем модальное окно
                modalTitle.textContent = 'Редактировать автомобиль';
                modal.style.display = 'block';
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Не удалось загрузить данные автомобиля');
            });
    }

    // Добавление нового автомобиля
    addCarBtn.addEventListener('click', function () {
        // Очищаем форму
        carForm.reset();
        document.getElementById('car-id').value = '';

        // Показываем модальное окно
        modalTitle.textContent = 'Добавить автомобиль';
        modal.style.display = 'block';
    });

    // Закрытие модального окна
    closeModal.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Отправка формы автомобиля
    carForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const carId = document.getElementById('car-id').value;
        const brand = document.getElementById('brand').value;
        const model = document.getElementById('model').value;
        const year = document.getElementById('year').value;
        const price = document.getElementById('price').value;
        const color = document.getElementById('color').value;
        const fuelType = document.getElementById('fuelType').value;
        const transmission = document.getElementById('transmission').value;
        const main_image = document.getElementById('main_image').value;

        const carData = {
            brand, model, year, price,
            color, fuelType, transmission, main_image
        };

        const url = carId ? `/api/admin/cars/${carId}` : '/api/admin/cars';
        const method = carId ? 'PUT' : 'POST';

        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(carData),
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) throw new Error('Ошибка сохранения');
                return response.json();
            })
            .then(() => {
                modal.style.display = 'none';
                loadCars();
            })
            .catch(error => {
                console.error('Ошибка:', error);
                alert('Не удалось сохранить автомобиль');
            });
    });

    // Выход из системы
    logoutButton.addEventListener('click', function () {
        fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(() => {
                window.location.href = '/';
            })
            .catch(error => {
                console.error('Ошибка:', error);
            });
    });

    // Проверка авторизации
    function checkAuth() {
        fetch('/check-auth', {
            credentials: 'include'
        })
            .then(response => {
                if (!response.ok) {
                    window.location.href = '/';
                    return;
                }
                return response.json();
            })
            .then(data => {
                if (data && data.success) {
                    // Загружаем первую вкладку
                    document.querySelector('.sidebar li.active').click();
                } else {
                    window.location.href = '/';
                }
            })
            .catch(error => {
                console.error('Ошибка:', error);
                window.location.href = '/';
            });
    }
    // Функция загрузки отзывов
    async function loadFeedbacks() {
        try {
            const response = await fetch('/api/admin/feedbacks', {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки отзывов');
            }

            const feedbacks = await response.json();
            renderFeedbacks(feedbacks);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
            showError('Не удалось загрузить отзывы');
        }
    }

    // Функция отрисовки отзывов
    function renderFeedbacks(feedbacks) {
        const container = document.getElementById('feedbacks-container');

        if (!feedbacks || feedbacks.length === 0) {
            container.innerHTML = '<div class="no-feedbacks">Нет отзывов для отображения</div>';
            return;
        }

        container.innerHTML = feedbacks.map(feedback => `
    <div class="feedback-item" data-feedback-id="${feedback.id}">
      <div class="feedback-header">
        <div class="feedback-author">${feedback.name || 'Аноним'}</div>
        <div class="feedback-actions">
          <button class="delete-feedback" data-id="${feedback.id}" title="Удалить">
            <i class="fas fa-trash"></i> Удалить
          </button>
        </div>
      </div>
      <div class="feedback-content">
        <p>${feedback.message}</p>
      </div>
    </div>
  `).join('');

        setupFeedbackDeleteButtons();
    }

    // Функция для удаления отзыва
    async function deleteFeedback(feedbackId) {
        if (!confirm('Вы уверены, что хотите удалить этот отзыв?')) return;

        try {
            const response = await fetch(`/api/admin/feedbacks/${feedbackId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Ошибка удаления');
            }

            // Удаляем элемент из DOM
            const feedbackElement = document.querySelector(`[data-feedback-id="${feedbackId}"]`);
            if (feedbackElement) {
                feedbackElement.classList.add('fade-out');
                setTimeout(() => feedbackElement.remove(), 300);
            }

            showNotification('Отзыв успешно удалён', 'success');
        } catch (error) {
            console.error('Ошибка удаления отзыва:', error);
            showNotification(error.message || 'Не удалось удалить отзыв', 'error');
        }
    }

    // Настройка кнопок удаления
    function setupFeedbackDeleteButtons() {
        document.querySelectorAll('.delete-feedback').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const feedbackId = btn.dataset.id;
                deleteFeedback(feedbackId);
            });
        });
    }

    // Вспомогательная функция для форматирования даты
    function formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('feedbacks-tab')) {
            loadFeedbacks();
        }
    });
});