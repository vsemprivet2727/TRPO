const API_URL = 'http://localhost:3000/api';
const AUTH_KEY = 'currentUser';

console.log("Проверка авторизации...");
//console.log("LocalStorage:", localStorage.getItem(AUTH_KEY));

let currentSelectedBookId = null;

async function loadBooks() {
    console.log('Загрузка книг с API...');
    try {
        const response = await fetch(`${API_URL}/books`);
        if (!response.ok) throw new Error('Ошибка загрузки книг');

        const books = await response.json();
        
        displayBooks(books);
    } catch (error) {
        console.error('Error loading books: ', error);
    }
}

function displayBooks(books) {
    const scrollBox = document.getElementById('books-scroll-box');
    if (!scrollBox) return;
    
    if (books.length === 0) {
        const grid = document.querySelector('.books-grid')
        if (grid) grid.innerHTML = ''
        grid.innerHTML = '<div class="scroll-box-item">Книги не найдены</div>';
        return;
    }

    const oldGrid = scrollBox.querySelector('.books-grid');
    if (oldGrid) oldGrid.remove();

    const gridContainer = document.createElement('div');
    gridContainer.className = 'books-grid';
    
    if (books.length === 0) {
        scrollBox.innerHTML = '<p>Книги не найдены</p>';
        return;
    }
    
    for(let i = 0; i < books.length; i++) {
        const bookItem = document.createElement('div');
        bookItem.className = 'scroll-box-item book-card';
        bookItem.innerHTML = `
            <div style="display: flex; flex-direction: row; justify-content: space-between; width:100%">
                <div style="display: flex; flex-direction: column; text-align: left;">
                    <span class="title">${books[i].title}</span>
                    <small>${books[i].author}</span>
                </div>
                <img src="../resources/Book open.png" alt="Книга">
            </div>
        `;
        bookItem.addEventListener('click', () => openBookModal(books[i]));
        gridContainer.appendChild(bookItem);
    }
    
    scrollBox.appendChild(gridContainer);
}

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById('bookModal');
    const closeBtn = document.querySelector('.close');
    const filters = document.getElementById('filter-container');

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modal.style.display = 'none';
        }
    });
});

const modal = document.getElementById('bookModal');
const closeBtn = document.querySelector('.close');

function openBookModal(book) {
    const modal = document.getElementById('bookModal');
    
    currentSelectedBookId = book._id || book.id;

    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = book.author;
    document.getElementById('modalYear').textContent = new Date(book.publishDate).getFullYear();
    document.getElementById('modalGenre').textContent = Array.isArray(book.genre) ? book.genre.join(', ') : book.genre;
    document.getElementById('modalPublisher').textContent = book.publisher;
    
    modal.style.display = 'block';
}

function setupBookClicks() {
    const bookItems = document.querySelectorAll('.scroll-box-item');
    
    bookItems.forEach(item => {
        item.addEventListener('click', function() {
            openBookModal(testBooks[0]);
        });
    });
}

//Добавление книги в бд
//Удаление книги из бд
document.addEventListener('DOMContentLoaded', () => {
    //Добавление книги в бд
    const addButton = document.getElementById('add-new-book');
    const formElementIds = [ // Список ID всех обязательных полей
        'new-book-name',
        'new-book-author',
        'new-book-publisher',
        'new-book-year',
        'new-book-genres',
        'new-book-inStock'
    ];

    if(addButton){
        addButton.addEventListener('click', async () => {
        
        const titleValue = document.getElementById('new-book-name').value.trim();
        const authorValue = document.getElementById('new-book-author').value.trim();
        const publisherValue = document.getElementById('new-book-publisher').value.trim();
        const yearValue = document.getElementById('new-book-year').value.trim();
        const genresValue = document.getElementById('new-book-genres').value.trim();
        const inStockValue = document.getElementById('new-book-inStock').value; 

        // Проверка на пустые поля
        const requiredFields = {
            'new-book-name': titleValue,
            'new-book-author': authorValue,
            'new-book-publisher': publisherValue,
            'new-book-year': yearValue,
            'new-book-genres': genresValue,
            'new-book-inStock': inStockValue
        };
        
        let allFieldsValid = true;
        let missingFieldName = '';

        // Перебираем все обязательные поля и проверяем, что они не пустые
        for (const [id, value] of Object.entries(requiredFields)) {
            if (!value) {
                allFieldsValid = false;
                
                const labelElement = document.querySelector(`label[for="${id}"]`);
                missingFieldName = labelElement ? labelElement.textContent : id; 
                break; // Останавливаем проверку при первой же ошибке
            }
        }

        if (!allFieldsValid) {
            alert(`Ошибка сохранения: Поле "${missingFieldName}" должно быть заполнено.`);
            // Не допускаем отправку запроса
            return;
        }

        // Подготовка данных для сервера
        // Превращаем строку жанров в массив
        const genreArray = genresValue.split(/\s+/).filter(g => g !== "");

        const inStockBoolean = (inStockValue === 'true');
        
        const bookData = {
            title: titleValue,
            author: authorValue,
            publisher: publisherValue,
            publishDate: yearValue, 
            genre: genreArray,
            inStock: inStockBoolean
        };

        // Отправка на сервер
        try {
            // Указываем полный адрес, где действительно находится API
            const response = await fetch("http://localhost:3000/api/books", { 
                method: "POST",
                headers: {
                "Content-Type": "application/json"
                },
                body: JSON.stringify(bookData)
            });

            if (response.ok) {
                const result = await response.json();
                alert("Книга добавлена!");


                
                location.reload();
            } else {
                alert("Ошибка при добавлении");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Ошибка сети");
        }
        });
    }
    //////////////////////
    //Удаление книги из бд
    //////////////////////
    
    const removeSelect = document.getElementById('select-for-remove');
    const removeButton = document.getElementById('remove-book-btn');
    
if (removeButton) {
    async function loadBooksForRemoval() {
        if (!removeSelect) return; 

        try {
            const response = await fetch("http://localhost:3000/api/books");
            if (!response.ok) throw new Error('Не удалось загрузить книги');
            
            const books = await response.json();
            
            removeSelect.innerHTML = '<option value="">Выберите книгу</option>';

            books.forEach(book => {
                const option = document.createElement('option');
                option.value = book._id;
                option.textContent = `${book.title} (${book.author})`;
                removeSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Ошибка загрузки книг для удаления:", error);
            alert('Ошибка при попытки подключения');
        }
    }

    loadBooksForRemoval();

    removeButton.addEventListener('click', async () => {
        if (!removeSelect) return;
        
        const bookId = removeSelect.value;

        if (!bookId) {
            alert('Выберите книгу')
            return;
        }

        const confirmation = confirm(`Вы уверены, что хотите удалить книгу?`);
        if (!confirmation) return;
        
        try {
            const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
                method: "DELETE" 
            });

            if (response.ok) {
                const result = await response.json();
                alert('Книга успешно удалена')
                location.reload();
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.message || response.statusText}`)
            }
        } catch (error) {
            console.error("Ошибка сети при удалении:", error);
            alert('Ошибка сети')
        }
    });
}

    const resetFiltersButton = document.getElementById('reset-filters-btn');

    const filterIds = [
        'checkbox-is-we-have',
        'genre-select',
        'publisher-select',
        'author-select',
        'input-year'
    ];
    if (resetFiltersButton) {
        resetFiltersButton.addEventListener('click', () => {
        
            filterIds.forEach(id => {
                const element = document.getElementById(id);
                if (!element) return;

                if (element.type === 'checkbox') {
                element.checked = false;
                } else { 
                    element.value = ''; 
                }
            });
        
            applyFilters(); 
            console.log("Фильтры сброшены.");
        });
    }
});

// ФИЛЬТРАЦИЯ

async function applyFilters() {
    const params = new URLSearchParams();
    
    const fAuthor = document.getElementById("author-select");
    const fPublisher = document.getElementById("publisher-select");
    const fGenre = document.getElementById("genre-select");
    const fYear = document.getElementById("input-year");
    const fStock = document.getElementById("checkbox-is-we-have");

    if (fAuthor?.value) params.append("author", fAuthor.value);
    if (fPublisher?.value) params.append("publisher", fPublisher.value);
    if (fGenre?.value) params.append("genre", fGenre.value);
    if (fYear?.value) params.append("year", fYear.value);
    if (fStock?.classList.contains('on')) params.append("inStock", "true");

    try {
        const response = await fetch(`${API_URL}/books?` + params.toString());
        const books = await response.json();

        displayBooks(books);
    } catch (err) {
        console.error("Ошибка фильтрации:", err);
    }
}

async function populateFilters() {
    const fAuthor = document.getElementById("author-select");
    const fPublisher = document.getElementById("publisher-select");
    const fGenre = document.getElementById("genre-select");

    if (!fAuthor || !fPublisher || !fGenre) return;
    console.log(fAuthor, fPublisher, fGenre);

    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();

        const authors = new Set();
        const publishers = new Set();
        const genres = new Set();

        books.forEach(book => {
            if (book.author) authors.add(book.author);
            if (book.publisher) publishers.add(book.publisher);
            if (book.genre) book.genre.forEach(g => genres.add(g));
        });

        fAuthor.innerHTML = '<option value="">Все авторы</option>';
        fPublisher.innerHTML = '<option value="">Все издатели</option>';
        fGenre.innerHTML = '<option value="">Все жанры</option>';

        authors.forEach(a => fAuthor.innerHTML += `<option value="${a}">${a}</option>`);
        publishers.forEach(p => fPublisher.innerHTML += `<option value="${p}">${p}</option>`);
        genres.forEach(g => fGenre.innerHTML += `<option value="${g}">${g}</option>`);

        setupFilterListeners();
        
    } catch (err) {
        console.error("Ошибка при заполнении фильтров:", err);
    }
}

function setupFilterListeners() {
    const ids = ["author-select", "publisher-select", "genre-select"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", applyFilters);
    });

    const yearInput = document.getElementById("input-year");
    if (yearInput) yearInput.addEventListener("input", applyFilters);

    const stockCb = document.getElementById("checkbox-is-we-have");
    if (stockCb) stockCb.addEventListener("click", applyFilters);
}

async function loadUsers() {
    const scrollBox = document.getElementById('users-scroll-box');
     try {
        const nameInputEl = document.getElementById('search-input-name');
        const emailInputEl = document.getElementById('search-input-email');

        const nameFilter = nameInputEl ? nameInputEl.value.trim() : '';
        const emailFilter = emailInputEl ? emailInputEl.value.trim() : '';

        console.log(`Фильтрация: Имя="${nameFilter}", Email="${emailFilter}"`);

        const params = new URLSearchParams();
        if (nameFilter) params.append('username', nameFilter);
        if (emailFilter) params.append('email', emailFilter);

        const queryString = params.toString();
        const url = `${API_URL}/users${queryString ? '?' + queryString : ''}`;

        console.log("Отправка запроса на:", url);

        const response = await fetch(url);

        if (!response.ok) throw new Error('Ошибка загрузки пользователей');

        const users = await response.json();

        if (users.length === 0) {
            scrollBox.innerHTML += '<p style="padding:10px;">Пользователи не найдены</p>';
            return;
        }
        if (document.getElementById('scroll-users')) document.getElementById('scroll-users').remove();
        const userList = document.createElement('div');
        userList.style.marginTop = '40px'; 
        userList.id = 'scroll-users';
        users.forEach(user => {
            if (user.username != 'admin') {
                const userItem = document.createElement('div');
                userItem.className = 'scroll-box-item book-card';
                userItem.style.margin = '10px';
                userItem.style.cursor = 'pointer';
                userItem.style.aspectRatio = '3/1';

                userItem.addEventListener('click', () => {
                    const removeSelect = document.getElementById('user-borrowed-books-select');
                    if (removeSelect) {
                        removeSelect.innerHTML = '';
                        if (user.borrowedBooks && user.borrowedBooks.length > 0) {
                            user.borrowedBooks.forEach(b => {
                                const option = document.createElement('option');
                                option.value = b.bookId._id || b.bookId; 
                                option.textContent = b.bookId.title || "Книга без названия";
                                removeSelect.appendChild(option);
                            });
                        } else {
                            removeSelect.innerHTML = '<option value="">Нет книг</option>';
                        }
                    }
                    modalUserOpen(user);
                    });

                    userItem.innerHTML = `
    <div style="display: flex; flex-direction: column; width: 100%; gap: 8px">
        <div style="display:flex; flex-direction: row; justify-content: space-between; align-items: center">
            <div><strong>${user.username}</strong> (${user.email})</div>
        </div>
        
        <div style="margin-top: 8px">
            <strong>Взятые книги:</strong>
            ${
                user.borrowedBooks && user.borrowedBooks.length > 0 
                ? `
                    <div style="margin-top: 4px;">
                        <table class="filter-box-table" style="width:100%; background-color:#fff;">
                                ${user.borrowedBooks.map(b => `
                                    <tr style="border-bottom: 1px solid #f0f0f0;">
                                        <td style="width:70%">
                                            ${b.bookId ? b.bookId.title : "Книга удалена или не найдена"}
                                        </td>
                                        <td style="">
                                            ${b.bookId ? new Date(b.returnDate).toLocaleDateString() : "-"}
                                        </td>
                                    </tr>
                                `).join('')}
                        </table>
                    </div>
                `
                : '<div style="color: #666; font-style: italic">Книг нет</div>'
            }
        </div>
    </div>
`;

                userList.appendChild(userItem);
                scrollBox.appendChild(userList);
        }
        });

    } catch (err) {
        console.error(err);
        scrollBox.innerHTML += '<p>Не удалось загрузить пользователей</p>';
    }

}

// Функция для загрузки книг конкретного пользователя
async function loadUserBooks(username) {
    const scrollBox = document.querySelector('.scroll-box'); 
    if (!scrollBox) return;

    try {
        const response = await fetch(`${API_URL}/user-books?username=${username}`);
        if (!response.ok) throw new Error('Сервер вернул ошибку');
        
        const books = await response.json();

        if (books.length === 0) {
            scrollBox.innerHTML += '<div style="display:flex; justify-content:center;"><h1>У вас нет взятых книг.</h1></div>';
            return;
        }

        books.forEach(book => {
            const bookItem = document.createElement('div');
            bookItem.className = 'scroll-box-item book-card';
            bookItem.style.aspectRatio = '7/1'
            bookItem.innerHTML = `
                <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width: 100%">
                    <div style="display: flex; flex-direction: column; text-align: left;">
                        <span style="font-weight: bold;">${book.title}</span>
                        <small>${book.author}</small>
                        <small style="color: #ff4d4d; margin-top: 5px;">Вернуть: ${book.returnDate}</small>
                    </div>
                    <img src="../resources/Book open.png" alt="Книга" style="width: 30px; height: 30px;">
                </div>
            `;
            bookItem.addEventListener('click', () => openBookModal(book));
            scrollBox.appendChild(bookItem);
        });
    } catch (error) {
        console.error('Ошибка загрузки личных книг: ', error);
    }
}

async function loadWaitingBooks(username) {
    try {
        const response = await fetch(`${API_URL}/user-wishlist?username=${username}`);
        console.log(response)
        if (!response.ok) throw new Error('Ошибка со стороны сервера: ', response.status)
        else {
            const requestedBooks = await response.json();
            const scrollBox = document.getElementById('waiting-books-scroll-box');
            if (requestedBooks.length>0) {
                requestedBooks.forEach(book => {
                const item = document.createElement('div');
                item.className = 'scroll-box-item';
                item.style.aspectRatio = '7/1';
                item.style.width = '100%';
                item.dataset.bookId = book._id;
                item.innerHTML = `
                <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center; width:100%">
                    <div style="display: flex; flex-direction: column; text-align: left;">
                        <span class="title">${book.title}</span>
                        <small>${book.author}</span>
                    </div>
                    <img src="../resources/Book open.png" alt="Книга">
                    <div><button class="deny-btn btn btn-primary" style="background: #fff">Отменить</button></div>
                </div>
                `;
                scrollBox.appendChild(item);
                });
            }
            else scrollBox.innerHTML = `<h1>Нет заявок на книги</h1>`;
        }
    } catch (error) {
        console.log('Ошибка: ', error)
    }
}

function askToLogin() {
    const btn = document.getElementById('request-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
        if(localStorage.getItem('currentUser') == null) {
            alert('Что бы запросить книгу войдите в аккаунт');
            return;
        }
    })
}

async function requestBook() {
    const btn = document.getElementById('request-btn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        try {
            btn.disabled = true;
            btn.textContent = 'Отправка...';
            
            const response = await fetch(`${API_URL}/users/wishlist`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: localStorage.getItem('currentUser'), 
                    bookId: currentSelectedBookId
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 400 && errorData.message.includes("Книги нет в наличии")) {
                    alert(errorData.message);
                    btn.disabled = false;
                    btn.textContent = 'Запросить';
                    return;
                }  else if (response.status === 400 & errorData.message.includes("Книга уже в списке желаемого")) {
                    alert(errorData.message);
                    btn.disabled = false;
                    btn.textContent = 'Запросить';
                    return;
                }

                throw new Error(`Ошибка запроса: ${response.status}`);
            }

            const result = await response.json();
            alert(result.message);
            btn.textContent = 'Добавлено';

        } catch (error) {
            console.log(error);
            alert('Не удалось добавить книгу в список желаемого. Попробуйте снова.');
        } finally {
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = 'Запросить';
            }, 300);
        }
    });
}

function setupDenyButtonDelegation() {
    const scrollBox = document.getElementById('waiting-books-scroll-box');
    if (!scrollBox) return;
    
    scrollBox.addEventListener('click', async function(event) {
    const button = event.target.closest('.deny-btn');
    if (button) {
        const item = button.closest('.scroll-box-item');
        const bookId = item ? item.dataset.bookId : null;
        const username = localStorage.getItem('currentUser');
        
             console.log('Book ID:', bookId);
        console.log('Username:', username);

        if (!bookId) {
            console.error('Не удалось получить bookId');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите отменить заявку на эту книгу?'))
            return;
        
        try {
            await removeFromWishlist(bookId, username);
            if (item) {
                item.remove();
            }
            
            if (scrollBox.children.length === 0) {
                scrollBox.innerHTML = `<h1>Нет заявок на книги</h1>`;
            }
        } 
        catch (error) {
            button.disabled = false;
            button.textContent = 'Отменить';
            alert(error.message);
        }
    }
});
}

async function removeFromWishlist(bookId, username) {
    try {
        const response = await fetch(`${API_URL}/users/${username}/wishlist/${bookId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        });

        const result = await response.json();
        
        if (!response.ok)
            throw new Error(result.message || 'Ошибка при удалении');

        alert(result.message);

        return result;
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function search() {
    const path = window.location.pathname;
    const searchField = document.getElementById('input-search');
    if (!searchField) return;

    searchField.addEventListener('input', async () => {
        try {
            let url;
            if (path.includes('/Main.html') || path.includes('/Books.html')) {
                url = `${API_URL}/books`;

            const response = await fetch(url);
            if (!response.ok) {
                console.log('Ошибка запроса:', response.status);
                return;
            }

            const items = await response.json();

            const query = searchField.value.toLowerCase();

            const queryThreegrams = [];
            for (let i = 0; i <= query.length - 3; i++) {
                queryThreegrams.push(query.slice(i, i + 3));
            }

            const sortedBooks = [];

            items.forEach(item => {
                const title = item.title.toLowerCase();
                let matches = 0;

                for (let i = 0; i <= title.length - 3; i++) {
                    const tg = title.slice(i, i + 3);
                    if (queryThreegrams.includes(tg)) {
                        matches++;
                    }
                }

                if (matches >= queryThreegrams.length / 2) {
                    sortedBooks.push(item);
                }
            });

            displayBooks(sortedBooks);
            }
            else url = `${API_URL}/users`;
        } catch (error) {
            console.log('Ошибка:', error);
        }
    });
}

async function sort() {
    const param = document.getElementById('select-sort');

    if(!param) return;
    const response = await fetch(`${API_URL}/books`);

    try {
        if (!response.ok) {
            console.log('Ошибка запроса:', response.status);
            return;
        }
        const books = await response.json();
        let sortedBooks = [...books];
        if(param.value=='title') {
            sortedBooks.sort((a,b) => 
                a.title.toLowerCase().localeCompare(b.title.toLowerCase())
        );
    }
    if (param.value === 'author') {
        sortedBooks.sort((a, b) =>
            a.author.toLowerCase().localeCompare(b.author.toLowerCase())
        );
    }
    displayBooks(sortedBooks);
    } catch (error) {
        console.log('Ошибка: ', error)
    }
}

function searchClicked() {
    const search = document.getElementById('search-container');
    const filter = document.getElementById('filter-container');
    const input = document.getElementById('input-search');

    if(search.classList.contains('active')) 
        input.focus();
    else {
        search.classList.add('active');
        filter.classList.remove('active');
    }
}

function filtersClicked(){
    const filter = document.getElementById('filter-container');
    const search = document.getElementById('search-container');

    filter.classList.add('active');
    search.classList.remove('active');
}
function openAddBook() {
    const window = document.getElementById('add-book');
    closeRemoveBook()
    window.showModal();
}
function closeAddBook() {
    const window = document.getElementById('add-book');
    window.close()
}
function openRemoveBook() {
    const window = document.getElementById('remove-book');
    closeAddBook();
    window.showModal();
}
function closeRemoveBook() {
    const window = document.getElementById('remove-book');
    window.close();
}

function inStockClicked() {
    const thumblerBtn = document.getElementById('checkbox-is-we-have');
    if(thumblerBtn.classList.contains('on')) thumblerBtn.classList.remove('on');
    else thumblerBtn.classList.add('on')
}

function logOut() {
    const loginBtn = document.getElementById('user-display-name');
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (localStorage.getItem('currentUser')) {
            const answer = confirm('Вы уверены что хотите выйти с аккаунта?')
        if (answer == true) {
            localStorage.removeItem('currentUser');
            window.location.href = 'Books.html';
        }
    }
    else window.location.href = '../Auth.html';
    })
}

async function acceptRequest(book, username) {
    const startDate = document.getElementById('input-date-start')?.value;
    const endDate = document.getElementById('input-date-end')?.value;

    if (!startDate || !endDate) {
        alert('Выберите даты');
        return;
    }

    try {
        const userRes = await fetch(`${API_URL}/users?username=${encodeURIComponent(username)}`);

        if (!userRes.ok) {
            const text = await userRes.text(); 
            console.error("Ошибка при получении пользователя:", text);
            throw new Error(`Ошибка запроса: ${userRes.status}`);
        }

        const users = await userRes.json();
        if (!users.length) {
            alert('Пользователь не найден');
            return;
        }

        const user = users[0];

        const response = await fetch(`${API_URL}/users/accept-wishlist`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: user._id,
                bookId: book._id,
                borrowedDate: startDate,
                returnDate: endDate
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error("Ошибка при выдаче книги:", text);
            throw new Error(`Ошибка запроса: ${response.status}`);
        }

        alert('Книга выдана пользователю');
        modalClose();
        location.reload();

    } catch (error) {
        console.error('Ошибка:', error.message);
    }
}

function modalBooksOpen(book, username) {
    const modal = document.getElementById('modal');
    if (!modal) return;

    setDefaultDates();
    btn = document.getElementById('btn-give')
    btn.addEventListener('click', () => { acceptRequest(book, username) });
    modal.showModal();
}

function modalClose(){
    const modal = document.getElementById('modal');
    modal.close();
}

function modalUserOpen(user) {
    const modal = document.getElementById('button-add-container');
    localStorage.setItem('userData', user._id);
    modal.showModal();
}

function modalUserClose() {
    const modal = document.getElementById('button-add-container');
    modal.close();
}

async function fillBookSelector() {
    const bookSelect = document.getElementById('book-select');

    if(!bookSelect) return;

    const response = await fetch(`${API_URL}/books`);

    if(!response.ok) return;

    const books = await response.json();
    console.log();

    books.forEach(book => {
        const option = document.createElement('option');
        option.value = book._id || book.id;
        option.textContent = book.title || 'Книга не найдена';
        bookSelect.appendChild(option);
    })
}

// Функция для установки дат по умолчанию
function setDefaultDates() {
    const startInput = document.getElementById('input-date-start');
    const endInput = document.getElementById('input-date-end');

    if (startInput && endInput) {
        const today = new Date();
        const nextWeek = new Date();
        nextWeek.setDate(today.getDate() + 7);

        // Формат YYYY-MM-DD для input type="date"
        startInput.value = today.toISOString().split('T')[0];
        endInput.value = nextWeek.toISOString().split('T')[0];
    }
}

async function loadWishlists() {
    const listContainer = document.getElementById('users-request-scroll-box');
    
    try {
        const [usersRes, booksRes] = await Promise.all([
            fetch(`${API_URL}/users`),
            fetch(`${API_URL}/books`)
        ]);

        if (!usersRes.ok || !booksRes.ok) throw new Error('Ошибка при загрузке данных');
        
        const users = await usersRes.json();
        const allBooks = await booksRes.json();
        
        listContainer.innerHTML = '';

        const usersWithRequests = users.filter(user => user.wishlist && user.wishlist.length > 0);

        if (usersWithRequests.length === 0) {
            listContainer.innerHTML = '<h1>Запросов пока нет</h1>';
            return;
        }

        usersWithRequests.forEach(user => {
            const item = document.createElement('div');
            item.className = 'scroll-box-item';
            item.style.aspectRatio = '3/1';

            const booksHtml = user.wishlist.map(wishId => {
                const bookData = allBooks.find(b => (b._id === wishId || b.id === wishId));
                
                if (bookData) {
                    
                    return `
                            <table class="filter-box-table" style="flex: 0 0 100%; table-layout:fixed;">
                                <tr>
                                    <td style="width:400px;justify-content:left;"><strong>${bookData.title}</strong><br>${bookData.author}</td>
                                    <td><button class="btn btn-primary" style="background-color:#ffffff">Одобрить</button></td>
                                </tr>
                            </table>
                    `;
                }
            }).join('');

            item.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: bold; color: #000;text-align:left;">
                    ${user.username} (${user.email})
                </div>
                <div>
                    ${booksHtml}
                </div>
            `;

            item.querySelectorAll('.btn-primary').forEach((btn, index) => {
            const wishId = user.wishlist[index];
            const bookData = allBooks.find(b => b._id === wishId || b.id === wishId);

            if (bookData) {
                    btn.addEventListener('click', () => {
                        modalBooksOpen(bookData, user.username);
                    });
                }
            });

            listContainer.appendChild(item);
        });

    } catch (error) {
        console.error('Ошибка:', error);
        listContainer.innerHTML = '<li>Ошибка загрузки данных</li>';
    }
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    search();    
    //Обработчик кнопки "Удалить" книгу у пользователя
    const btnRemove = document.getElementById('button-remove');
    if (btnRemove) {
        btnRemove.addEventListener('click', async () => {
            const userId = localStorage.getItem('userData')
            const bookId = document.getElementById('user-borrowed-books-select').value;

            if (!userId || !bookId) return alert("Выберите пользователя и книгу!");

            try {
                const response = await fetch(`${API_URL}/users/${userId}/return/${bookId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert("Книга успешно удалена у пользователя!");
                    location.reload();
                } else {
                    alert("Ошибка при удалении");
                }
            } catch (error) {
                console.error("Ошибка:", error);
            }
        });
    }

    //Экспорт отчета
    const btnExport = document.getElementById('export-users-csv');

if (btnExport) {
    btnExport.addEventListener('click', async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            const users = await response.json();

            let csv = "\uFEFFID;Логин;Книги\n";

            users.forEach(u => {
                if (u.borrowedBooks && u.borrowedBooks.length > 0) {
                    
                    const titles = u.borrowedBooks.map(bookObj => {
                        return bookObj.title || (bookObj.bookId && bookObj.bookId.title) || "Без названия";
                    }).join(", ");

                    csv += `${u._id || u.id};${u.username};"${titles}"\n`;
                }
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "otchet.csv";
            link.click();

        } catch (err) {
            console.error(err);
            alert("Ошибка при чтении данных");
        }
    });
    }



    const currentUser = localStorage.getItem('currentUser');
    const userDisplay = document.getElementById('user-display-name');
    const path = window.location.pathname;

    if (currentUser && userDisplay) {
        userDisplay.innerHTML = `<img src="../resources/User.png" alt=""> ${currentUser}`;
    }

    if (path.includes("Main.html") || path.includes("Books.html")) {
        sort();
        loadBooks();
        populateFilters();
    }

    if (path.includes("/Users.html")) {
        const usersBox = document.getElementById("users-scroll-box");
        
        if (usersBox) {
            loadUsers();
            fillBookSelector();
            setDefaultDates();
        }
    }

    if (path.includes("UserPages")) {
        logOut();
        askToLogin();
        if (currentUser && userDisplay)
            userDisplay.innerHTML = `<img src="../resources/User.png" alt=""> ${currentUser}`;

        if (currentUser) {
            if (document.getElementById('user-books-scroll-box')) 
                loadUserBooks(currentUser);
            
            requestBook();        } 
        else if (path.includes('UsersBooks.html') || path.includes('Waiting.html')) {
            const answer = confirm('Вы не вошли в аккаунт. Хотите войти?')
            if(answer == true) window.location.href = '../Auth.html'; 
            else window.location.href = 'Books.html';
        }
    }

    if (document.getElementById('users-request-scroll-box')) {
        loadWishlists();
    }

    if (document.getElementById('waiting-books-scroll-box')){
        loadWaitingBooks(currentUser).then(() => {
            setupDenyButtonDelegation();
        });
    }

    const btnAddBookToUser = document.getElementById('button-add');

if (btnAddBookToUser) {
    btnAddBookToUser.addEventListener('click', async () => {
        const userId = localStorage.getItem('userData') 
        const bookId = document.getElementById('book-select').value;
        const startDate = document.getElementById('input-date-start').value;
        const returnDate = document.getElementById('input-date-end').value;

        if (!userId) return alert("Сначала выберите пользователя из списка!");
        if (!bookId) return alert("Выберите книгу!");

        const requestData = {
            userId: userId,
            bookId: bookId,
            borrowedDate: new Date(startDate).toISOString(), 
            returnDate: new Date(returnDate).toISOString()
        };

        try {
            const response = await fetch(`${API_URL}/users/borrow`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            });

            if (response.ok) {
                alert("Книга успешно выдана пользователю!");
                loadUsers();
            } else {
                const err = await response.json();
                alert("Ошибка: " + err.message);
            }
        } catch (error) {
            console.error("Ошибка при выдаче книги:", error);
        }
    });
}
});
