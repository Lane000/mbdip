document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadUserBookings();
    } catch (error) {
        console.error('Ошибка загрузки бронирований:', error);
        showError('Не удалось загрузить бронирования');
    }
});

async function loadUserBookings() {
    const response = await fetch('/api/my-bookings', {
        credentials: 'include'
    });

    if (!response.ok) {
        throw new Error(await response.text());
    }

    const bookings = await response.json();
    renderBookings(bookings);
}

function renderBookings(bookings) {
    const container = document.getElementById('bookings-container');

    if (!bookings.length) {
        container.innerHTML = `
            <div class="no-bookings">
                <p>У вас нет активных бронирований</p>
                <a href="/catalog" class="btn">Перейти в каталог</a>
            </div>
        `;
        return;
    }

    container.innerHTML = bookings.map(booking => `
        <div class="booking-card" data-booking-id="${booking.id}">
            <img src="${booking.main_image}" alt="${booking.brand} ${booking.model}">
            <div class="booking-info">
                <h3>${booking.brand} ${booking.model} (${booking.year})</h3>
                <p><strong>Даты:</strong> ${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}</p>
                <p><strong>Стоимость:</strong> ${booking.price.toLocaleString()} ₽</p>
                <button class="cancel-btn cancel-booking" data-booking-id="${booking.id}">
                    Отменить бронь
                </button>
            </div>
        </div>
    `).join('');

    // Назначаем обработчики
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            if (confirm('Вы уверены, что хотите отменить бронирование?')) {
                try {
                    await cancelBooking(btn.dataset.bookingId);
                    // После успешной отмены обновляем список
                    await loadUserBookings();
                } catch (error) {
                    console.error('Ошибка отмены:', error);
                    alert(error.message);
                }
            }
        });
    });
}

async function cancelBooking(bookingId) {
    const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при отмене бронирования');
    }

    return response.json();
}

// Вспомогательные функции
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('ru-RU');
}

function showError(message) {
    const container = document.getElementById('bookings-container');
    container.innerHTML = `
        <div class="error">
            <p>${message}</p>
            <button onclick="location.reload()">Попробовать снова</button>
        </div>
    `;
}