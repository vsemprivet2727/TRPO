document.addEventListener('DOMContentLoaded', function() {
    const authBox = document.querySelector('.auth-box');
    setTimeout(() => {
        authBox.classList.add('auth-box.show');
    }, 100);
});