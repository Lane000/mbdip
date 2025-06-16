document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/cars/index');
        if (!response.ok) throw new Error('Ошибка загрузки данных');

        const cars = await response.json();
        const container = document.getElementById('cars-container');

        container.innerHTML = cars.map(car => createCarCard(car)).join('');
    } catch (error) {
        console.error('Ошибка:', error);
        document.getElementById('cars-container').innerHTML = `
            <p class="error-message">Не удалось загрузить автомобили. Попробуйте позже.</p>
        `;
    }
});

function createCarCard(car) {
    const imageUrl = car.main_image || 'img/default.jpg';
    const validatedImageUrl = imageUrl.startsWith('http') ? imageUrl : `https://${imageUrl}`;

    return `
        <div class="car-card" data-car-id="${car.id}">
        <div class="car-image" style="background-image: url('${validatedImageUrl}'), url('img/default.jpg')">
            <img src="${imageUrl}" alt="${car.brand} ${car.model}" loading="lazy" style="display: none;"
                onerror="this.parentNode.style.backgroundImage = 'url(img/default.jpg)'">
        </div>
        <div class="car-content">
            <div class="car-header">
            <h3 class="car-title">${car.brand} ${car.model}</h3>
            <p class="car-subtitle">${car.year} год</p>
            </div>
            
            <div class="car-details">
            <div class="car-detail">
                <span class="car-detail-icon">🎨</span>
                <div>
                <div class="car-detail-label">Цвет</div>
                <div class="car-detail-value">${car.color}</div>
                </div>
            </div>
            
            <div class="car-detail">
                <span class="car-detail-icon">⛽</span>
                <div>
                <div class="car-detail-label">Тип топлива</div>
                <div class="car-detail-value">${car.fuelType}</div>
                </div>
            </div>
            
            <div class="car-detail">
                <span class="car-detail-icon">⚙️</span>
                <div>
                <div class="car-detail-label">Коробка передач</div>
                <div class="car-detail-value">${car.transmission}</div>
                </div>
            </div>
            </div>
            
            <div class="car-price">
            ${car.price.toLocaleString()} ₽ <span class="car-price-currency">в сутки</span>
            </div>
            <button class="filter-button book-btn" id="book-button" onclick="window.location.href='/catalog'">Забронировать</button>
        </div>
        </div>
    `
}