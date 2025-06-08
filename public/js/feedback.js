document.addEventListener('DOMContentLoaded', async function () {
  // Получаем элементы формы
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackList = document.getElementById('feedbackList');
  const messageInput = document.getElementById('message');

  // Проверяем, что все элементы существуют
  if (!feedbackForm || !feedbackList || !messageInput) {
    console.error('Не найдены необходимые элементы формы');
    return;
  }

  // Функция для проверки авторизации через сервер
  async function checkAuth() {
    try {
      const response = await fetch('/check-auth', {
        credentials: 'include' // Важно для работы с сессиями
      });

      if (!response.ok) return false;

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      return false;
    }
  }

  // Функция загрузки отзывов
  async function loadFeedbacks() {
    try {
      const response = await fetch('/feedbacks/html');
      if (!response.ok) throw new Error('Ошибка загрузки отзывов');

      feedbackList.innerHTML = await response.text();
    } catch (error) {
      console.error('Ошибка:', error);
      feedbackList.innerHTML = '<div class="error">Не удалось загрузить отзывы</div>';
    }
  }

  // Обработчик отправки формы
  feedbackForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Проверяем авторизацию
    const isAuth = await checkAuth();
    if (!isAuth) {
      alert('Для отправки отзыва необходимо войти в систему');
      window.location.href = '/profile';
      return;
    }

    try {
      const message = messageInput.value.trim();
      if (!message) {
        alert('Пожалуйста, введите текст отзыва');
        return;
      }

      const formData = new FormData(feedbackForm);

      // Отправка отзыв
      const response = await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.get('name'),
          message: formData.get('message')
        }),
        credentials: 'include'
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Ошибка сервера');
      }

      // Обновляем список отзывов
      await loadFeedbacks();
      feedbackForm.reset();

      // Плавная прокрутка
      feedbackList.scrollIntoView({ behavior: 'smooth' });

    } catch (error) {
      console.error('Ошибка:', error);
      alert(error.message || 'Произошла ошибка при отправке');
    }
  });

  // Загружаем отзывы при загрузке страницы
  loadFeedbacks();
});