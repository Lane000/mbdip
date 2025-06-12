document.addEventListener('DOMContentLoaded', () => {
  // Инициализация и загрузка автомобилей
  fetchCars();

  // Обработчики событий
  document.getElementById('applyFilters').addEventListener('click', fetchCars);
  document.getElementById('resetFilters').addEventListener('click', resetFilters);
});

// Сброс фильтров
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

// Загрузка автомобилей с сервера
async function fetchCars() {
  const container = document.getElementById('cars-container');
  if (!container) return;

  // Показываем индикатор загрузки
  container.innerHTML = '<div class="loading">Загрузка автомобилей...</div>';

  try {
    // Формируем параметры запроса
    const params = getFilterParams();
    const queryString = buildQueryString(params);

    // Выполняем запрос
    const response = await fetch(`/api/cars?${queryString}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const cars = await response.json();
    renderCars(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    showError('Ошибка загрузки данных. Пожалуйста, попробуйте позже.');
  }
}

// Получение параметров фильтрации
function getFilterParams() {
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

  return {
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
}

// Формирование строки запроса
function buildQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

// Отрисовка карточек автомобилей
function renderCars(cars) {
  const container = document.getElementById('cars-container');
  if (!container) return;

  if (!cars || cars.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🚗</div>
        <h3 class="empty-state-title">Автомобили не найдены</h3>
        <p class="empty-state-text">Попробуйте изменить параметры фильтрации</p>
      </div>
    `;
    return;
  }

  container.innerHTML = cars.map(car => createCarCard(car)).join('');
}

// Создание HTML-карточки автомобиля
function createCarCard(car) {
  // Используем изображение из БД или дефолтное, если его нет
  const imageUrl = car.main_image || 'img/default.jpg';

  return `
    <div class="car-card" data-car-id="${car.id}">
      <div class="car-image" style="background-image: url('${imageUrl}'), url('img/default.jpg')">
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
        <button class="filter-button book-btn" id="book-button">Забронировать</button>
      </div>
    </div>
  `;
}

// Показ ошибки
function showError(message) {
  const container = document.getElementById('cars-container');
  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">⚠️</div>
      <h3 class="empty-state-title">Ошибка</h3>
      <p class="empty-state-text">${message}</p>
    </div>
  `;
}

// Элементы модального окна
const modal = document.getElementById('booking-modal');
const closeBtn = document.querySelector('.close-modal');

// Текущий пользователь (должен быть установлен при авторизации)
let currentUserId = null;

// Открытие модального окна
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('book-btn')) {
    // Проверяем авторизацию
    if (!currentUserId) {
      alert('Пожалуйста, войдите в систему для бронирования');
      return;
    }

    const carCard = e.target.closest('.car-card');
    const carId = carCard.dataset.carId;
    const carTitle = carCard.querySelector('.car-title').textContent;

    modal.dataset.carId = carId;
    modal.querySelector('h2').textContent = `Бронирование ${carTitle}`;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }
});

// Закрытие модального окна
closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => e.target === modal && closeModal());

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
}

// Обработка формы бронирования
document.getElementById('booking-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const carId = modal.dataset.carId;
  const dateStart = document.getElementById('booking-date-start').value;
  const dateEnd = document.getElementById('booking-date-end').value;

  // Валидация дат
  if (new Date(dateEnd) < new Date(dateStart)) {
    showDateError('Дата окончания не может быть раньше даты начала');
    return;
  }

  try {
    // Отправка данных на сервер
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUserId,
        carId,
        startDate: dateStart,
        endDate: dateEnd
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Ошибка сервера');
    }

    const result = await response.json();
    alert(`Бронирование #${result.bookingId} успешно создано!`);
    closeModal();
    e.target.reset();
  } catch (error) {
    console.error('Ошибка:', error);
    alert(error.message || 'Ошибка при бронировании. Попробуйте позже.');
  }
});

// Вспомогательные функции
function showDateError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'date-error';
  errorElement.textContent = message;

  const dateRange = document.querySelector('.date-range');
  const existingError = dateRange.querySelector('.date-error');
  if (existingError) existingError.remove();

  dateRange.appendChild(errorElement);
}

// Установка минимальной даты (сегодня)
window.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('booking-date-start').min = today;
  document.getElementById('booking-date-end').min = today;

  document.getElementById('booking-date-start').addEventListener('change', function () {
    document.getElementById('booking-date-end').min = this.value;
  });

  // Здесь должен быть код для получения currentUserId (пример):
  // currentUserId = getCurrentUserId(); 
});