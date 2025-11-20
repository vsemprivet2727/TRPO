const API_URL = 'http://localhost:3000/api';


async function loadBooks() {
    console.log('Загрузка книг с API...');
    try {
        
        const response = await fetch(`${API_URL}/books`);
        console.log('Ответ от сервера:', response);

        if (!response.ok) throw new Error('Ошибка загрузки книг');
        
        const books = await response.json();
        displayBooks(books);
    }
     catch (error) {
        console.error('Error loading books: ', error);
     }
}

function displayBooks(books) {
    const scrollBox = document.getElementById('books-scroll-box');
    scrollBox.innerHTML = `
        <div class="scroll-box-item">
            <h2>Книги у нас</h2>
        </div>
    `;
    
    if (books.length === 0) {
        scrollBox.innerHTML = '<p>Книги не найдены</p>';
        return;
    }
    
    
    books.forEach(book => {
        const bookItem = document.createElement('ul');
        bookItem.className = 'scroll-box-item book-card';
        bookItem.innerHTML = `
            <li>
            <span class="item-label">${book.title}</span>
            <small>${book.author}</small>
            <img src="../resources/Book open.png" alt="Книга">
            </li>

        `;


        // Привязываем модалку
        bookItem.addEventListener('click', () => openBookModal(book));
        
        scrollBox.appendChild(bookItem);
    });
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
    closeBtn.addEventListener('click', closeModal);
    
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
}

function openBookModal(book) {
    document.getElementById('modalTitle').textContent = book.title;
    document.getElementById('modalAuthor').textContent = book.author;
    document.getElementById('modalYear').textContent = new Date(book.publishDate).getFullYear();
    document.getElementById('modalGenre').textContent = book.genre.join(', ');
    document.getElementById('modalPublisher').textContent = book.publisher;
    modal.style.display = 'block';
}

function closeModal() {
    modal.style.display = 'none';
}

function setupBookClicks() {
    const bookItems = document.querySelectorAll('.scroll-box-item');
    
    bookItems.forEach(item => {
        item.addEventListener('click', function() {
            openBookModal(testBooks[0]);
        });
    });
}
// -----------------------------------------------------------
// ФИЛЬТРАЦИЯ
// -----------------------------------------------------------

// Элементы фильтров
const authorSelect = document.getElementById("author-select");
const publisherSelect = document.getElementById("publisher-select");
const genreSelect = document.getElementById("genre-select");
const yearInput = document.getElementById("input-year");
const inStockCheckbox = document.getElementById("checkbox-is-we-have");

// Назначаем слушателя события
if (authorSelect) authorSelect.addEventListener("change", applyFilters);
if (publisherSelect) publisherSelect.addEventListener("change", applyFilters);
if (genreSelect) genreSelect.addEventListener("change", applyFilters);
if (yearInput) yearInput.addEventListener("input", applyFilters);
if (inStockCheckbox) inStockCheckbox.addEventListener("change", applyFilters);


// Функция фильтрации
async function applyFilters() {
    const params = new URLSearchParams();

    if (authorSelect.value) params.append("author", authorSelect.value);
    if (publisherSelect.value) params.append("publisher", publisherSelect.value);
    if (genreSelect.value) params.append("genre", genreSelect.value);
    if (yearInput.value) params.append("year", yearInput.value);
    if (inStockCheckbox.checked) params.append("inStock", "true");

    const response = await fetch(`${API_URL}/books?` + params.toString());
    const books = await response.json();
    displayBooks(books);
}


// Наполнение селектов
async function populateFilters() {
    try {
        const response = await fetch(`${API_URL}/books`);
        const books = await response.json();

        const authors = new Set();
        const publishers = new Set();
        const genres = new Set();

        // Чистим перед добавлением
        authorSelect.innerHTML = '<option value="">Все авторы</option>';
        publisherSelect.innerHTML = '<option value="">Все издатели</option>';
        genreSelect.innerHTML = '<option value="">Все жанры</option>';

        // Собираем данные из книг
        books.forEach(book => {
            if (book.author) authors.add(book.author);
            if (book.publisher) publishers.add(book.publisher);
            if (book.genre) book.genre.forEach(g => genres.add(g));
        });

        // Заполняем авторов
        authors.forEach(author => {
            const opt = document.createElement("option");
            opt.value = author;
            opt.textContent = author;
            authorSelect.appendChild(opt);
        });

        // Заполняем издателей
        publishers.forEach(pub => {
            const opt = document.createElement("option");
            opt.value = pub;
            opt.textContent = pub;
            publisherSelect.appendChild(opt);
        });

        // Заполняем жанры
        genres.forEach(g => {
            const opt = document.createElement("option");
            opt.value = g;
            opt.textContent = g;
            genreSelect.appendChild(opt);
        });

    } catch (err) {
        console.error("Ошибка при заполнении фильтров:", err);
    }
}

async function loadUsers() {
    const scrollBox = document.getElementById('users-scroll-box')
    scrollBox.innerHTML = `
        <div class="scroll-box-item">
            <h2>Список читателей</h2>
        </div>
    `;
     try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error('Ошибка загрузки пользователей');

        const users = await response.json();

        users.forEach(user => {
            const userItem = document.createElement('ul');
            userItem.className = 'scroll-box-item user-card';
            userItem.innerHTML = `
                <li>
                    <strong>${user.username}</strong> (${user.email})<br>
                    Взятые книги: ${user.borrowedBooks.map(b => b.bookId + " (до " + new Date(b.returnDate).toLocaleDateString() + ")").join(", ")}
                </li>
            `;

            scrollBox.appendChild(userItem);
        });

    } catch (err) {
        console.error(err);
        scrollBox.innerHTML += '<p>Не удалось загрузить пользователей</p>';
    }
}



// --------------------------------------------
// DOMContentLoaded
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // Если на странице книг (Main.html)
    if (window.location.pathname.includes("Main.html")) {
        populateFilters();
        loadBooks();
        initModal();
    }

    // Если на странице пользователей (Users.html или ReturnBooks.html)
    if (document.getElementById("users-scroll-box")) {
        loadUsers();
    }
});

