// document.addEventListener('DOMContentLoaded', () => {
//   const form = document.querySelector('.feedback-form');
//   const feedbackList = document.getElementById('feedback-list');

//   // Функция загрузки отзывов
//   function loadFeedbacks() {
//     fetch('/feedbacks/html')
//       .then(response => response.text())
//       .then(html => {
//         feedbackList.innerHTML = html;
//       })
//       .catch(error => console.error('Ошибка загрузки отзывов:', error));
//   }

//   // Отправка формы
//   form.addEventListener('submit', (event) => {
//     event.preventDefault();
//     const formData = new FormData(form);

//     fetch('/feedback', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: formData.get('name'),
//         message: formData.get('message')
//       })
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           loadFeedbacks();
//           form.reset();
//         } else {
//           alert('Ошибка: ' + data.message);
//         }
//       })
//       .catch(error => console.error('Ошибка отправки:', error));
//   });

//   // Загрузка отзывов при загрузке страницы
//   loadFeedbacks();
// });




// document.addEventListener('DOMContentLoaded', function () {
//   const feedbackForm = document.getElementById('feedbackForm');
//   const feedbackList = document.getElementById('feedbackList');

//   feedbackForm.addEventListener('submit', function (e) {
//     e.preventDefault();

//     // Проверка авторизации
//     if (!isUserLoggedIn()) {
//       alert('Пожалуйста, войдите в систему, чтобы оставить отзыв.');
//       window.location.href = 'profile'; // Перенаправление на страницу входа
//       return;
//     }

//     const name = document.getElementById('name').value;
//     const email = document.getElementById('email').value;
//     const message = document.getElementById('message').value;

//     // Сохранение отзыва в localStorage
//     const feedback = {
//       name,
//       email,
//       message,
//       date: new Date().toLocaleString()
//     };

//     let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
//     feedbacks.push(feedback);
//     localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

//     // Очистка формы
//     feedbackForm.reset();

//     // Обновление списка отзывов
//     displayFeedbacks();
//   });

//   // Функция для проверки авторизации
//   function isUserLoggedIn() {
//     // Проверяем, есть ли в localStorage данные пользователя
//     const user = JSON.parse(localStorage.getItem('user'));
//     return user && user.isLoggedIn;
//   }

//   // Остальной код остается без изменений
//   function displayFeedbacks() {
//     // ... существующий код ...

//   }

//   displayFeedbacks();
// });




// document.addEventListener('DOMContentLoaded', function () {
//   const feedbackForm = document.getElementById('feedbackForm');
//   const feedbackList = document.getElementById('feedbackList');

//   // Функция для проверки авторизации
//   function isUserLoggedIn() {
//     const user = JSON.parse(localStorage.getItem('user'));
//     return user && user.isLoggedIn;
//   }

//   // Функция загрузки отзывов
//   function loadFeedbacks() {
//     fetch('/feedbacks/html')
//       .then(response => response.text())
//       .then(html => {
//         feedbackList.innerHTML = html;
//       })
//       .catch(error => console.error('Ошибка загрузки отзывов:', error));
//   }

//   // Обработчик отправки формы
//   feedbackForm.addEventListener('submit', function (event) {
//     event.preventDefault();

//     // Проверка авторизации
//     if (!isUserLoggedIn()) {
//       alert('Пожалуйста, войдите в систему, чтобы оставить отзыв.');
//       window.location.href = 'profile';
//       return;
//     }

//     const formData = new FormData(feedbackForm);

//     // Отправка на сервер
//     fetch('/feedback', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: formData.get('name'),
//         email: formData.get('email'),
//         message: formData.get('message')
//       })
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           // Обновляем список отзывов после успешной отправки
//           loadFeedbacks();
//           feedbackForm.reset();
//         } else {
//           alert('Ошибка: ' + data.message);
//         }
//       })
//       .catch(error => {
//         console.error('Ошибка отправки:', error);
//         alert('Произошла ошибка при отправке отзыва');
//       });
//   });

//   // Загружаем отзывы при загрузке страницы
//   loadFeedbacks();
// }); 




// document.addEventListener('DOMContentLoaded', function () {
//   const feedbackForm = document.getElementById('feedbackForm');
//   const feedbackList = document.getElementById('feedbackList');

//   // Функция проверки авторизации
//   function checkAuth() {
//     const user = JSON.parse(localStorage.getItem('user'));
//     return user && user.isLoggedIn;
//   }

//   // Обработчик отправки формы
//   feedbackForm.addEventListener('submit', function (e) {
//     e.preventDefault();

//     if (!checkAuth()) {
//       alert('Для отправки отзыва необходимо войти в систему');
//       window.location.href = '/profile';
//       return;
//     }

//     const formData = new FormData(feedbackForm);
//     const user = JSON.parse(localStorage.getItem('user'));

//     fetch('/feedback', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         name: user.username,
//         email: user.email,
//         message: formData.get('message')
//       })
//     })
//       .then(response => response.json())
//       .then(data => {
//         if (data.success) {
//           loadFeedbacks();
//           feedbackForm.reset();
//         } else {
//           alert('Ошибка: ' + data.message);
//         }
//       })
//       .catch(error => console.error('Error:', error));
//   });

//   // Загрузка отзывов
//   function loadFeedbacks() {
//     fetch('/feedbacks/html')
//       .then(response => response.text())
//       .then(html => {
//         feedbackList.innerHTML = html;
//       })
//       .catch(error => console.error('Ошибка загрузки:', error));
//   }

//   loadFeedbacks();
// });




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

      // Отправка отзыв
      const response = await fetch('/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
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