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

    handleLogin();
    handleRegistration();
});
function handleLogin() {

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('login-text').value;
    const password = document.getElementById('password-input').value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('username', data.username); 
            
            alert('Вход выполнен успешно!');
            window.location.href = 'Main.html';
        } else {
            alert(data.message || 'Ошибка входа');
        }
    } catch (err) {
        console.error('Ошибка:', err);
    }
});
}

function handleRegistration() {
    const regForm = document.getElementById('regForm');
    if (!regForm) return;

    regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('reg-login-text').value;
        const email = document.getElementById('email-input').value;
        const password = document.getElementById('reg-password-input').value;
        const passwordRepeat = document.getElementById('password-repeat-input').value;

        if (password !== passwordRepeat) {
            alert("Пароли не совпадают!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                alert('Регистрация успешна!');
                localStorage.setItem('currentUser', username);
                window.location.href = './UserPages/UsersBooks.html';
            } else {
                alert(data.message || 'Ошибка регистрации');
            }
        } catch (err) {
            console.error(err);
            alert('Сервер не отвечает');
        }
    });
}

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


