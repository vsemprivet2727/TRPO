//import { disconnect } from "mongoose";

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
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
    gridContainer.style.gap = '20px';
    gridContainer.style.marginTop = '50px';
    
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

document.addEventListener('DOMContentLoaded', function() {
    initModal();
});

function initModal() {
    const modal = document.getElementById('bookModal');
    const closeBtn = document.querySelector('.close');
    const requestBtn = document.querySelector('#bookModal .btn-primary');

    if (!modal) return;

    const closeModal = () => {
        modal.style.display = 'none';
        currentSelectedBookId = null;
    };

    if (closeBtn) closeBtn.onclick = closeModal;
    
    window.onclick = (event) => {
        if (event.target === modal) closeModal();
    };

    document.onkeydown = (event) => {
        if (event.key === 'Escape') closeModal();
    };

    // ОБРАБОТКА КНОПКИ "ЗАПРОСИТЬ"
    if (requestBtn) {
        requestBtn.onclick = async () => {
            const user = localStorage.getItem(AUTH_KEY);

            if (!user || user === "null") {
                alert("Пожалуйста, войдите в систему, чтобы оставить заявку");
                return;
            }

            if (!currentSelectedBookId) return;

            try {
                const response = await fetch(`${API_URL}/users/wishlist`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: user,
                        bookId: currentSelectedBookId
                    })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Книга добавлена в ваши заявки!");
                    closeModal();
                } else {
                    alert(data.message || "Ошибка при создании заявки");
                }
            } catch (error) {
                console.error("Ошибка запроса:", error);
                alert("Сервер не отвечает");
            }
        };
    }
}

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

    // Загрузка книг в выпадающий список
    async function loadBooksForRemoval() {
        // Дополнительная проверка внутри функции
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

    // Запуск загрузки списка книг
    loadBooksForRemoval();

    // Обработчик кнопки "Удалить"
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

    // ID элементов фильтрации, которые нужно сбросить
    const filterIds = [
        'checkbox-is-we-have',
        'genre-select',
        'publisher-select',
        'author-select',
        'input-year'
    ];
    // Сброс фильтров
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
    
    // Получаем элементы прямо в момент вызова функции
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

// Селектор книг у пользователей
async function fillBookSelector(){
    const bookSelect = document.getElementById("book-select")

    if (!bookSelect) return;
    try{
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();

        bookSelect.innerHTML = '<option value="">Выберите книгу</option>';

        books.forEach(book => {
            const option = document.createElement("option");
            option.value = book._id;
            option.textContent = book.title;
            bookSelect.appendChild(option);
        });
        console.log("Селектор книг успешно заполнен");
    }
    catch (err) {
    console.error("Ошибка при подгрузке книг в селектор:", err);
    }
}
// Наполнение селектов
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

        // После того как создали option, вешаем на них события
        setupFilterListeners();
        
    } catch (err) {
        console.error("Ошибка при заполнении фильтров:", err);
    }
}

// Отдельная функция для навешивания слушателей
function setupFilterListeners() {
    const ids = ["author-select", "publisher-select", "genre-select"];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("change", applyFilters);
    });

    const yearInput = document.getElementById("input-year");
    if (yearInput) yearInput.addEventListener("input", applyFilters);

    const stockCb = document.getElementById("checkbox-is-we-have");
    if (stockCb) stockCb.addEventListener("change", applyFilters);
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
        const userList = document.createElement('div');
        userList.style.marginTop = '40px'; 
        users.forEach(user => {
            if (user.username != 'admin') {
                const userItem = document.createElement('div');
                userItem.className = 'scroll-box-item';
                userItem.style.margin = '10px';
                userItem.style.cursor = 'pointer';
                userItem.style.aspectRatio = '3/1';

                userItem.addEventListener('click', () => {
                    document.getElementById('selected-user-id').value = user._id;
                    document.getElementById('selected-user-name').textContent = `👤 Выбран: ${user.username}`;

                    const removeSelect = document.getElementById('user-borrowed-books-select');
                    if (removeSelect) {
                        removeSelect.innerHTML = '<option value="">Выберите книгу для удаления</option>';
                        if (user.borrowedBooks && user.borrowedBooks.length > 0) {
                            user.borrowedBooks.forEach(b => {
                                const option = document.createElement('option');
                                option.value = b.bookId._id || b.bookId; 
                                option.textContent = b.bookId.title || "Книга без названия";
                                removeSelect.appendChild(option);
                            });
                        } else {
                            removeSelect.innerHTML = '<option value="">У пользователя нет книг</option>';
                        }
                    }
                    });

                    userItem.innerHTML = `
                        <div style="display: flex; flex-direction: column; width: 100%">
                            <div><strong>${user.username}</strong> (${user.email})</div>
                            Взятые книги: ${
                        user.borrowedBooks && user.borrowedBooks.length > 0 
                        ? user.borrowedBooks.map(b => 
                            b.bookId 
                                ? b.bookId.title + " (до " + new Date(b.returnDate).toLocaleDateString() + ")"
                                : "Книга удалена или не найдена"
                        ).join(", ")
                        : "Книг нет"
            }
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
            bookItem.innerHTML = `
                <div style="display: flex; flex-direction: row; justify-content: space-between; align-items: center;">
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
                item.style.aspectRatio = '7/1'
                item.innerHTML = `
                <div style="display: flex; flex-direction: row; justify-content: space-between; width:100%">
                    <div style="display: flex; flex-direction: column; text-align: left;">
                        <span class="title">${book.title}</span>
                        <small>${book.author}</span>
                    </div>
                    <img src="../resources/Book open.png" alt="Книга">
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
            displayBooks(sortedBooks);
        }
        if (param.value === 'author') {
            sortedBooks.sort((a, b) =>
                a.author.toLowerCase().localeCompare(b.author.toLowerCase())
            );
        }
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
    window.style.display = 'flex';
    window.classList.add('active');
}
function closeAddBook() {
    const window = document.getElementById('add-book');
    window.classList.remove('active');
    setTimeout(() => {
        window.style.display = 'none'
    }, 300)
}
function openRemoveBook() {
    const window = document.getElementById('remove-book');
    closeAddBook();
    window.style.display = 'flex';
    window.classList.add('active');
}
function closeRemoveBook() {
    const window = document.getElementById('remove-book');
    window.classList.remove('active');
    setTimeout(() => {
        window.style.display = 'none'
    }, 300)
}

function inStockClicked() {
    const thumblerBtn = document.getElementById('checkbox-is-we-have');
    if(thumblerBtn.classList.contains('on')) thumblerBtn.classList.remove('on');
    else thumblerBtn.classList.add('on')
}

function logOut() {
    const loginBtn = document.getElementById('user-display-name');
    loginBtn.addEventListener('click', (e)=>{
        e.preventDefault();
        const answer = confirm('Вы уверены что хотите выйти с аккаунта?')
        if (answer == true) {
            localStorage.removeItem('currentUser')
            window.location.href('UserPages/Books.html');
        }
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
            item.onclick = 'openModal()';
            item.className = 'scroll-box-item';
            item.style.margin = '10px';
            item.style.aspectRatio = '3/1';
            item.style.display = 'flex';
            item.style.flexDirection = 'column'
            item.style.justifyContent = 'center';

            const booksHtml = user.wishlist.map(wishId => {
                const bookData = allBooks.find(b => (b._id === wishId || b.id === wishId));
                
                if (bookData) {
                    return `
                        <div style="margin-left: 20px; color: #555;">
                            <span><strong>${bookData.title}</strong> — ${bookData.author}</span>
                        </div>
                    `;
                } else {
                    return `<div style="margin-left: 20px; color: #999;">Книга удалена или не найдена (ID: ${wishId})</div>`;
                }
            }).join('');

            item.innerHTML = `
                <div style="font-size: 1.1rem; font-weight: bold; color: #000;">
                    ${user.username} (${user.email})
                </div>
                <div class="user-books-request">
                    ${booksHtml}
                </div>
            `;
            
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
            const userId = document.getElementById('selected-user-id').value;
            const bookId = document.getElementById('user-borrowed-books-select').value;

            if (!userId || !bookId) return alert("Выберите пользователя и книгу!");

            try {
                const response = await fetch(`${API_URL}/users/${userId}/return/${bookId}`, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert("Книга успешно удалена у пользователя!");
                    loadUsers();
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
    //Конец экспорта


    const currentUser = localStorage.getItem('currentUser');
    const userDisplay = document.getElementById('user-display-name');
    const path = window.location.pathname;

    const storedUser = localStorage.getItem('username'); 

    if (storedUser && userDisplay) {
        userDisplay.innerHTML = `<img src="../resources/User.png" alt=""> ${storedUser}`;
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

            const nameInput = document.getElementById('search-input-name');
            const emailInput = document.getElementById('search-input-email');

            if (nameInput) nameInput.addEventListener('input', loadUsers);
            if (emailInput) emailInput.addEventListener('input', loadUsers);
        }
    }

    if (path.includes("UserPages")) {
        logOut();
        if (currentUser && userDisplay) {
        userDisplay.innerHTML = `<img src="../resources/User.png" alt=""> ${currentUser}`;
    }
        if (currentUser) {
            if (document.getElementById('user-books-scroll-box')) {
                loadUserBooks(currentUser);
                
            }
        } else {
            window.location.href = '../Auth.html'; 
        }
    }

    if (document.getElementById('bookModal')) {
        initModal();
    }

    if (document.getElementById('users-request-scroll-box')) {
        loadWishlists();
    }

    if (document.getElementById('waiting-books-scroll-box')){
        loadWaitingBooks(currentUser);
    }

    const btnAddBookToUser = document.getElementById('button-add');

if (btnAddBookToUser) {
    btnAddBookToUser.addEventListener('click', async () => {
        const userId = document.getElementById('selected-user-id').value;
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
                loadUsers(); // Обновляем список, чтобы увидеть изменения
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
