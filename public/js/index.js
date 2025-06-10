document.addEventListener('DOMContentLoaded', () => {
    renderCars();
});



function renderCars(cars) {
    const container = document.getElementById('cars-container');
    container.innerHTML = '';

    if (cars.length === 0) {
        container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🚗</div>
        <h3 class="empty-state-title">Автомобили не найдены</h3>
        <p class="empty-state-text">Попробуйте изменить фильтры</p>
      </div>
    `;
        return;
    }
    const carImages = {
        'Kia K5': 'k5.webp',
        'Mazda 6': 'mazda6.webp',
        'Lixiang LI7': 'li7.webp',
        'Lexus 350F': '350f-lex.webp',
        'Lexus GS250': 'gs250-lex.webp'
    };

    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';

        const imageName = carImages[`${car.brand} ${car.model}`] || 'default.jpg';
        const imageUrl = `img/${imageName}`;

        card.innerHTML = `
      <div class="car-image" style="background-image: url('${imageUrl}')"></div>
      <div class="car-content">
        <div class="car-header">
          <h3 class="car-title">${car.brand} ${car.model}</h3>
          <p class="car-subtitle">${car.year}</p>
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
      </div>
    `;

        container.appendChild(card);
    });
}

function showError(message) {
    const container = document.getElementById('cars-container');
    container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3 class="empty-state-title">Error</h3>
      <p class="empty-state-text">${message}</p>
    </div>
  `;
}