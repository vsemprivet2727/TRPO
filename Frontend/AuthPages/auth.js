document.addEventListener('DOMContentLoaded', function() {
    const authBox = document.querySelector('.auth-box');
    setTimeout(() => {
        authBox.classList.add('show');
    }, 100);

    togglePassword('password-input', 'togglePassword')
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
                eyeIcon.src = 'resources/Eye_off.png';
                eyeIcon.alt = 'Показать пароль';
            } else {
                eyeIcon.src = 'resources/Eye.png';
                eyeIcon.alt = 'Скрыть пароль';
            }
        });
    }
}

function linkClicked(currentFormId, otherFormId, linkId) {
    const currentForm = document.getElementById(currentFormId);
    const otherForm = document.getElementById(otherFormId);
    const link = document.getElementById(linkId);
    if (otherForm && link) {
        link.addEventListener('click', function(e){
            e.preventDefault();
            currentForm.style.display = 'none';
            otherForm.style.display = 'block';
        });
    }
}

/*
    <form action="" method="get">
         <div class="flexscroll-box">
             <div class="auth-box">
                 <h2 align="center">Войдите в аккаунт</h2><br>
                 <input type="text" id="login-text" placeholder="Логин">
                 <div class="password-container">
                     <input type="password" id="password-input" placeholder="Пароль" required>
                     <span class="toggle-password" id="togglePassword">
                     <img src="../resources/Eye.png" class="eye-icon" alt="Показать пароль">
                     </span>
                 </div>
                 <button class="btn btn-primary"><b>Войти</b></button>
                 <a href="Reg.html" id="goToReg">Нет учетной записи? Создать</a>
                 </div>
             </div>
         </div>
    </form>
<form style="display:none;">
        <div class="flexscroll-box">
            <div class="auth-box">
                <h2 align="center">Зарегистрируйтесь</h2><br>
                <input type="text" id="login-text" placeholder="Логин">
                <input type="email" id="email-input" placeholder="Эл. Почта" required>
                <div class="password-container">
                    <input type="password" id="password-input" placeholder="Пароль" required>
                    <span class="toggle-password" id="togglePassword">
                    <img src="../resources/Eye.png" class="eye-icon" alt="Показать пароль">
                    </span>
                </div>
                <div class="password-container">
                    <input type="password" id="password-repeat-input" placeholder="Повторите пароль" required>
                    <span class="toggle-password" id="toggleRepeatPassword">
                    <img src="../resources/Eye.png" class="eye-icon" alt="Показать пароль">
                    </span>
                </div>
                <button class="btn btn-primary"><b>Создать</b></button>
                <a href="Auth.html">Уже есть аккаунт? Войти</a>
                </div>
            </div>
        </div>
    </form>
*/

