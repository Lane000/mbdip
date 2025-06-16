document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginFormElement');
    const registerForm = document.getElementById('registerFormElement');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const logoutButton = document.getElementById('logoutButton');
    const loginLink = document.getElementById('loginLink');

    switchToRegister.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
    });

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('loginForm').style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = loginForm.querySelector('input[type="text"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                    localStorage.setItem('user', JSON.stringify({
                        isLoggedIn: true,
                        username: data.username || email.split('@')[0],
                        email: email
                    }));
                } else {
                    alert(data.message);
                }
            });
    });

    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log("Форма регистрации отправлена");

        const username = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelector('#password').value;
        const confirmPassword = registerForm.querySelector('#confirmPassword').value;

        console.log("Данные формы:", { username, email, password, confirmPassword });

        if (password !== confirmPassword) {
            document.getElementById('passwordError').style.display = 'block';
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.getElementById('registrationSuccess').style.display = 'block';
                    localStorage.setItem('user', JSON.stringify({
                        isLoggedIn: true,
                        username: username,
                        email: email
                    }));

                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                } else {
                    alert(data.message);
                }
            })
            .catch(error => {
                console.error("Ошибка при отправке запроса:", error);
            });
        if (data.success) {
            document.getElementById('registrationSuccess').style.display = 'block';
            registerForm.reset();
            setTimeout(() => {
                window.location.reload();
            }, 2000);
        }
    });

    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.success) {

                fetch('/user-info')
                    .then(response => response.json())
                    .then(userData => {
                        if (userData.success) {
                            document.getElementById('name').textContent = userData.user.username;
                            document.getElementById('email').textContent = userData.user.email;
                        } else {
                            console.error("Ошибка при получении данных пользователя:", userData.message);
                        }
                    })
                    .catch(error => {
                        console.error("Ошибка при запросе данных пользователя:", error);
                    });

                document.querySelector('.profile-content').style.display = 'block';
                document.querySelector('.profile-header h1').textContent = `Добро пожаловать, ${data.user.username}`;

                document.getElementById('logoutButton').style.display = 'block';

                document.getElementById('loginLink').style.display = 'none';
            } else {
                document.getElementById('loginLink').style.display = 'block';

                document.getElementById('logoutButton').style.display = 'none';

                document.getElementById('modal').style.display = 'flex';
            }
        });

    logoutButton.addEventListener('click', () => {
        fetch('/logout', {
            method: 'POST',
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.reload();
                }
            });
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        modal.style.display = 'flex';
    });
});
