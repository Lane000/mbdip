document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.feedback-form');
  const feedbackList = document.getElementById('feedback-list');

  // Функция загрузки отзывов
  function loadFeedbacks() {
    fetch('/feedbacks/html')
      .then(response => response.text())
      .then(html => {
        feedbackList.innerHTML = html;
      })
      .catch(error => console.error('Ошибка загрузки отзывов:', error));
  }

  // Отправка формы
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const formData = new FormData(form);

    fetch('/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: formData.get('name'),
        message: formData.get('message')
      })
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          loadFeedbacks();
          form.reset();
        } else {
          alert('Ошибка: ' + data.message);
        }
      })
      .catch(error => console.error('Ошибка отправки:', error));
  });

  // Загрузка отзывов при загрузке страницы
  loadFeedbacks();
});
