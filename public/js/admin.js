document.addEventListener('DOMContentLoaded', () => {

    const switchToLogin = document.getElementById('switchToLogin');

    switchToLogin.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').style.display = 'block';
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

});