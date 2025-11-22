document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form').forEach(form => {
        const box = form.querySelector('.auth-box');
        if (form.style.display === 'none') return;
        setTimeout(() => {
            box.classList.add('show');
        }, 50);
    });

    togglePassword('password-input', 'togglePassword');
    togglePassword('password-repeat-input', 'toggleRepeatPassword');
    togglePassword('reg-password-input', 'toggleRegPassword');

    linkClicked('loginForm', 'regForm', 'switchToReg');
    linkClicked('regForm', 'loginForm', 'switchToLog');
});


function togglePassword(passwordID, iconID) {
    const togglePassword = document.getElementById(iconID);
    const passwordInput = document.getElementById(passwordID);
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const eyeIcon = this.querySelector('.eye-icon');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            
            if (type === 'password') {
                eyeIcon.src = '../resources/Eye_off.png';
                eyeIcon.alt = 'Показать пароль';
            } else {
                eyeIcon.src = '../resources/Eye.png';
                eyeIcon.alt = 'Скрыть пароль';
            }
        });
    }
}

function linkClicked(hideId, showId, linkId) {
    const hideForm = document.getElementById(hideId);
    const showForm = document.getElementById(showId);
    const link = document.getElementById(linkId);

    if (!hideForm || !showForm || !link) return;

    link.addEventListener('click', function (e) {
        e.preventDefault();

        hideForm.querySelector('.auth-box').classList.remove('show');
        hideForm.querySelector('.auth-box').classList.add('hide');

        hideForm.querySelector('.auth-box').addEventListener('transitionend', function onHide() {
            hideForm.style.display = 'none';
            hideForm.querySelector('.auth-box').removeEventListener('transitionend', onHide);

            showForm.style.display = 'block';
            const newBox = showForm.querySelector('.auth-box');
            newBox.classList.remove('hide');

            setTimeout(() => {
                newBox.classList.add('show');
            }, 20);
        });
    });
}


