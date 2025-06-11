document.addEventListener('DOMContentLoaded', () => {
  fetchCars();

  document.getElementById('applyFilters').addEventListener('click', fetchCars);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
});

function resetFilters() {
  document.getElementById('sort').value = '';
  document.getElementById('search').value = '';
  document.querySelectorAll('.filter-input').forEach(input => {
    if (input.tagName === 'SELECT') {
      input.selectedIndex = 0;
    } else {
      input.value = '';
    }
  });

  fetchCars();
}

async function fetchCars() {
  const sortValue = document.getElementById('sort').value;
  let sortBy = 'id';
  let sortOrder = 'ASC';

  switch (sortValue) {
    case 'price_asc':
      sortBy = 'price';
      sortOrder = 'ASC';
      break;
    case 'price_desc':
      sortBy = 'price';
      sortOrder = 'DESC';
      break;
    case 'brand_asc':
      sortBy = 'brand';
      sortOrder = 'ASC';
      break;
    default:
      sortBy = 'id';
      sortOrder = 'ASC';
  }

  const params = {
    search: document.getElementById('search').value,
    minYear: document.getElementById('minYear').value,
    maxYear: document.getElementById('maxYear').value,
    minPrice: document.getElementById('minPrice').value,
    maxPrice: document.getElementById('maxPrice').value,
    color: document.getElementById('color').value,
    fuelType: document.getElementById('fuelType').value,
    transmission: document.getElementById('transmission').value,
    sortBy,
    sortOrder
  };

  const queryString = Object.entries(params)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');

  try {
    const response = await fetch(`/api/cars?${queryString}`);
    const cars = await response.json();
    renderCars(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    showError('Error loading data');
  }
}

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
        <button class="book-btn">Забронировать</button>
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

// Элементы модального окна
const modal = document.getElementById('booking-modal');
const closeBtn = document.querySelector('.close-modal');

// Открытие модального окна
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('book-btn')) {
    const carCard = e.target.closest('.car-card');
    const carTitle = carCard.querySelector('.car-title').textContent;
    const carPrice = carCard.querySelector('.car-price').textContent;

    // Можно добавить информацию об авто в модальное окно
    modal.querySelector('h2').textContent = `Бронирование ${carTitle}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
});

// Закрытие модального окна
closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
});

// Закрытие при клике вне окна
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
});

// Обработка формы
document.getElementById('booking-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('booking-name').value;
  const phone = document.getElementById('booking-phone').value;
  const endDate = document.getElementById('booking-end-date').value;
  const startDate = document.getElementById('booking-start-date').value;

  // Здесь можно добавить отправку данных на сервер
  console.log('Бронирование:', { name, phone, startDate, endDate });

  // Показываем подтверждение
  alert('Ваша заявка на бронирование принята! Мы свяжемся с вами в ближайшее время.');

  // Закрываем модальное окно
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';

  // Очищаем форму
  e.target.reset();
});