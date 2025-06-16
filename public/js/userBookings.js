document.addEventListener('DOMContentLoaded', function () {
    fetch('/api/my-bookings', {
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка сети');
            return response.json();
        })
        .then(bookings => {
            const bookingsContainer = document.getElementById('bookings-container');

            if (bookings.length === 0) {
                bookingsContainer.innerHTML = `
                <div class="no-bookings">
                    <p>У вас пока нет бронирований</p>
                    <a href="/catalog" class="btn">Арендовать автомобиль</a>
                </div>
            `;
                return;
            }

            bookingsContainer.innerHTML = bookings.map(booking => `
            <div class="booking-card">
                <img src="${booking.main_image}" alt="${booking.brand} ${booking.model}">
                <div class="booking-info">
                    <h3>${booking.brand} ${booking.model} (${booking.year})</h3>
                    <p><strong>Дата начала:</strong> ${new Date(booking.start_date).toLocaleDateString()}</p>
                    <p><strong>Дата окончания:</strong> ${new Date(booking.end_date).toLocaleDateString()}</p>
                    <p><strong>Цена:</strong> ₽${booking.price}</p>
                    <button class="cancel-booking" data-id="${booking.id}">Отменить бронь</button>
                </div>
            </div>
        `).join('');

            // Обработка отмены бронирования
            document.querySelectorAll('.cancel-booking').forEach(button => {
                button.addEventListener('click', function () {
                    const bookingId = this.getAttribute('data-id');
                    cancelBooking(bookingId);
                });
            });
        })
        .catch(error => {
            console.error('Ошибка:', error);
            document.getElementById('bookings-container').innerHTML = `
            <div class="error">Ошибка загрузки бронирований</div>
        `;
        });
});

function cancelBooking(bookingId) {
    if (!confirm('Вы уверены, что хотите отменить бронирование?')) return;

    fetch(`/api/user/bookings/${bookingId}`, {
        method: 'DELETE',
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) throw new Error('Ошибка отмены бронирования');
            return response.json();
        })
        .then(() => {
            alert('Бронирование отменено');
            location.reload(); // Обновляем страницу
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Не удалось отменить бронирование');
        });
}