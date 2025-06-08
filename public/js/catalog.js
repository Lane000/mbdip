document.addEventListener('DOMContentLoaded', () => {
    fetchCars();

    document.getElementById('applyFilters').addEventListener('click', fetchCars);
    document.getElementById('resetFilters').addEventListener('click', resetFilters);
});

function resetFilters() {
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
    const params = {
        brand: document.getElementById('brand').value,
        minYear: document.getElementById('minYear').value,
        maxYear: document.getElementById('maxYear').value,
        minPrice: document.getElementById('minPrice').value,
        maxPrice: document.getElementById('maxPrice').value,
        color: document.getElementById('color').value,
        fuelType: document.getElementById('fuelType').value,
        transmission: document.getElementById('transmission').value,
        search: document.getElementById('search')?.value || '',
        sortBy: 'price',
        sortOrder: 'DESC'
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
        <h3 class="empty-state-title">No cars found</h3>
        <p class="empty-state-text">Try adjusting your filters or reset them</p>
      </div>
    `;
        return;
    }

    cars.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';

        const imageNum = Math.floor(Math.random() * 10) + 1;
        const imageUrl = `https://source.unsplash.com/random/600x400/?car,${car.brand},${car.model},${imageNum}`;

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
              <div class="car-detail-label">Color</div>
              <div class="car-detail-value">${car.color}</div>
            </div>
          </div>
          
          <div class="car-detail">
            <span class="car-detail-icon">⛽</span>
            <div>
              <div class="car-detail-label">Fuel</div>
              <div class="car-detail-value">${car.fuelType}</div>
            </div>
          </div>
          
          <div class="car-detail">
            <span class="car-detail-icon">⚙️</span>
            <div>
              <div class="car-detail-label">Transmission</div>
              <div class="car-detail-value">${car.transmission}</div>
            </div>
          </div>
        </div>
        
        <div class="car-price">
          ${car.price.toLocaleString()} <span class="car-price-currency">$</span>
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