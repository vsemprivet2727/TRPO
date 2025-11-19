const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
});

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
    const scrollBox = document.querySelector('.scroll-box');
    scrollBox.innerHTML = '';
    if (books.length === 0) {
        scrollBox.innerHTML = '<p>Книги не найдены</p>';
        return;
    }
    
    

    // title author publishDate publisher genre pages language
    
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
/*
document.addEventListener('DOMContentLoaded', function(){
    const bookItems = document.querySelectorAll('.scroll-box-item');

    bookItems.forEach(item=> {
        item.addEventListener(cancelIdleCallback, function(){
            const bookId = this.getAttribute('data-book-id');
            
        })
    })
})
*/

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


//ПЕРЕДЕЛАТЬ ПОТОМ НЕСЧАСТНУЮ ЗАТЫЧКУ!!1!!
/*const testBooks = [
    { id: 1, title: "Война и мир", author: "Лев Толстой", year: 1869, genre: "Роман" },
    { id: 2, title: "Преступление и наказание", author: "Федор Достоевский", year: 1866, genre: "Роман" },
    { id: 3, title: "Мастер и Маргарита", author: "Михаил Булгаков", year: 1967, genre: "Фантастика" },
    { id: 4, title: "1984", author: "Джордж Оруэлл", year: 1949, genre: "Антиутопия" },
    { id: 5, title: "Гарри Поттер", author: "Дж. К. Роулинг", year: 1997, genre: "Фэнтези" }
];*/

const modal = document.getElementById('bookModal');
const closeBtn = document.querySelector('.close');

document.addEventListener('DOMContentLoaded', function() {
    //loadTestBooks();
    initModal();
});
/*
function loadTestBooks() {
    const scrollBox = document.querySelector('.scroll-box');
    
    testBooks.forEach(book => {
        const bookElement = document.createElement('ul');
        bookElement.className = 'scroll-box-item book-card';
        bookElement.innerHTML = `
            <li>
                
                <span class="item-label">${book.title}</span>
                <img src="resources/Book open.png" alt="Книга" align="right">
            </li>
        `;
        
        bookElement.addEventListener('click', function() {
            openBookModal(book);
        });
        
        scrollBox.appendChild(bookElement);
    });
}
*/
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

// Назначаем слушатели
authorSelect.addEventListener("change", applyFilters);
publisherSelect.addEventListener("change", applyFilters);
genreSelect.addEventListener("change", applyFilters);
yearInput.addEventListener("input", applyFilters);
inStockCheckbox.addEventListener("change", applyFilters);

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



// --------------------------------------------
// ЕДИНСТВЕННЫЙ DOMContentLoaded
// --------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
    populateFilters();  // сначала заполняем селекты
    loadBooks();        // затем загружаем книги
    initModal();        // и только потом подключаем модалку
});
