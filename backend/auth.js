document.addEventListener('DOMContentLoaded', function() {
    const authBox = document.querySelector('.auth-box');
    setTimeout(() => {
        authBox.classList.add('show');
    }, 100);
});

document.addEventListener('DOMContentLoaded', function() {
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password-input');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const eyeIcon = this.querySelector('.eye-icon');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'password') {
                eyeIcon.src = 'resources/Eye_off.png';
                eyeIcon.alt = 'Показать пароль';
            } else {
                eyeIcon.src = 'resources/Eye.png';
                eyeIcon.alt = 'Скрыть пароль';
            }
        });
    }
});