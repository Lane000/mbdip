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
  const container = document.getElementById('cars-container');
  if (!container) return;

  container.innerHTML = '<div class="loading">Загрузка автомобилей...</div>';

  try {
    const params = getFilterParams();
    const queryString = buildQueryString(params);

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

function buildQueryString(params) {
  return Object.entries(params)
    .filter(([_, value]) => value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join('&');
}

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
        <button class="filter-button book-btn" id="book-button">Забронировать</button>
      </div>
    </div>
  `;
}

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

const modal = document.getElementById('booking-modal');
const closeBtn = document.querySelector('.close-modal');
const bookingForm = document.getElementById('booking-form');

let currentUserId = null;

async function checkAuth() {
  try {
    const response = await fetch('/check-auth', {
      credentials: 'include'
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        currentUserId = data.user.id;
        console.log('User authenticated, ID:', currentUserId);
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

document.addEventListener('click', async (e) => {
  if (e.target.classList.contains('book-btn')) {
    const isAuthenticated = await checkAuth();

    if (!isAuthenticated) {
      alert('Пожалуйста, войдите в систему для бронирования');
      window.location.href = '/profile';
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

function closeModal() {
  modal.style.display = 'none';
  document.body.style.overflow = 'auto';
  bookingForm.reset();

  const errorElements = document.querySelectorAll('.date-error');
  errorElements.forEach(el => el.remove());
}

closeBtn.addEventListener('click', closeModal);
window.addEventListener('click', (e) => e.target === modal && closeModal());

bookingForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const carId = modal.dataset.carId;
  const dateStart = document.getElementById('booking-date-start').value;
  const dateEnd = document.getElementById('booking-date-end').value;

  if (new Date(dateEnd) < new Date(dateStart)) {
    showError('Дата окончания не может быть раньше даты начала');
    return;
  }

  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        userId: currentUserId,
        carId,
        startDate: dateStart,
        endDate: dateEnd
      })
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Ошибка сервера');
    }

    alert(`Бронирование #${result.bookingId} успешно создано!`);
    closeModal();
  } catch (error) {
    alert(error)
    console.error('Ошибка бронирования:', error);
    showError(error.message || 'Ошибка при бронировании. Попробуйте позже.');
  }
});

function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'date-error';
  errorElement.textContent = message;
  errorElement.style.color = 'red';
  errorElement.style.marginTop = '10px';

  const dateRange = document.querySelector('.date-range');
  const existingError = dateRange.querySelector('.date-error');

  if (existingError) {
    existingError.textContent = message;
  } else {
    dateRange.appendChild(errorElement);
  }
}

function setupDateInputs() {
  const today = new Date().toISOString().split('T')[0];
  const dateStart = document.getElementById('booking-date-start');
  const dateEnd = document.getElementById('booking-date-end');

  dateStart.min = today;
  dateEnd.min = today;

  dateStart.addEventListener('change', function () {
    dateEnd.min = this.value;

    if (this.value && !dateEnd.value) {
      const endDate = new Date(this.value);
      endDate.setDate(endDate.getDate() + 3);
      dateEnd.valueAsDate = endDate;
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupDateInputs();
});

function formatDate(dateString) {
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('ru-RU', options);
}