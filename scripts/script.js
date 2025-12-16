//import { disconnect } from "mongoose";

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
            <li style= "display: flex; flex-direction: row; justify-content: space-between;">
            <div style="display: flex; flex-direction: column; text-align: left;">
            <span style="font-weight: bold;">${book.title}</span>
            <small align="left">${book.author}</small>
            </div>
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
                
                // Очистить поля ввода после успеха
                formElementIds.forEach(id => {
                    document.getElementById(id).value = '';
                });
                document.getElementById('new-book-inStock').value = '';
            } else {
                alert("Ошибка при добавлении");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Ошибка сети");
        }
    });

    //////////////////////
    //Удаление книги из бд
    //////////////////////
    
    const removeSelect = document.getElementById('select-for-remove');
    const removeButton = document.getElementById('remove-book-btn');
    const removeMessageDiv = document.getElementById('remove-message');

    //Загрузка книг в выпадающий список
    async function loadBooksForRemoval() {
        try {
            const response = await fetch("http://localhost:3000/api/books");
            if (!response.ok) {
                throw new Error('Не удалось загрузить книги');
            }
            const books = await response.json();
            
            removeSelect.innerHTML = '<option value="">Выберите книгу</option>';

            // Добавляем каждую книгу как опцию
            books.forEach(book => {
                const option = document.createElement('option');
                option.value = book._id; // в value храним ID книги
                option.textContent = `${book.title} (${book.author})`;
                removeSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Ошибка загрузки книг:", error);
            removeMessageDiv.textContent = 'Ошибка загрузки списка книг.';
            removeMessageDiv.style.color = 'red';
        }
    }

    // Запуск загрузки книг при старте
    loadBooksForRemoval();

    // Обработчик кнопки "Удалить"
    removeButton.addEventListener('click', async () => {
        const bookId = removeSelect.value;
        removeMessageDiv.textContent = '';

        if (!bookId) {
            removeMessageDiv.textContent = 'Пожалуйста, выберите книгу для удаления.';
            removeMessageDiv.style.color = 'orange';
            return;
        }

        const confirmation = confirm(`Вы уверены, что хотите удалить книгу?`);
        if (!confirmation) {
            return;
        }
        
        try {
            // Отправка DELETE-запрос, используя ID в URL
            const response = await fetch(`http://localhost:3000/api/books/${bookId}`, {
                method: "DELETE" 
            });

            if (response.ok) {
                const result = await response.json();
                removeMessageDiv.textContent = `Успешно: ${result.message}`;
                removeMessageDiv.style.color = 'green';
                
                // Перезагрузка списка, чтобы удаленная книга исчезла
                loadBooksForRemoval(); 

            } else {
                const errorData = await response.json();
                removeMessageDiv.textContent = `Ошибка: ${errorData.message || response.statusText}`;
                removeMessageDiv.style.color = 'red';
            }

        } catch (error) {
            console.error("Ошибка сети:", error);
            removeMessageDiv.textContent = 'Ошибка сети. Проверьте запуск сервера.';
            removeMessageDiv.style.color = 'red';
        }
    });

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
                    Взятые книги: ${user.borrowedBooks.map(b => b.bookId.title + " (до " + new Date(b.returnDate).toLocaleDateString() + ")").join("<br>")}
                </li>
            `;

            scrollBox.appendChild(userItem);
        });

    } catch (err) {
        console.error(err);
        scrollBox.innerHTML += '<p>Не удалось загрузить пользователей</p>';
    }
}

function tabClicked(){
    if (window.location.pathname.includes("Main.html")) {
        const tabFilters = document.getElementById("tab-filters");
        const tabAddBook = document.getElementById("tab-add-book");
        const tabRemoveBook = document.getElementById("tab-remove-book");

        if (tabFilters) {
        tabFilters.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("filters").style.display = "flex";
            document.getElementById("add-book").style.display = "none";
            document.getElementById('remove-book').style.display = 'none';
            tabFilters.classList.add('active');
            tabAddBook.classList.remove('active');
            tabRemoveBook.classList.remove('active');
        });
    }

    if (tabAddBook) {
        tabAddBook.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("add-book").style.display = "flex";
            document.getElementById("filters").style.display = "none";
            document.getElementById('remove-book').style.display = 'none'
            tabAddBook.classList.add('active');
            tabFilters.classList.remove('active');
            tabRemoveBook.classList.remove('active');
        });
    }

    if (tabRemoveBook) {
        tabRemoveBook.addEventListener("click", (e) => {
            e.preventDefault();
            document.getElementById("remove-book").style.display = "flex";
            document.getElementById("add-book").style.display = "none";
            document.getElementById("filters").style.display = "none";
            tabRemoveBook.classList.add('active');
            tabFilters.classList.remove('active');
            tabAddBook.classList.remove('active');
    });
    }
}
    if(window.location.pathname.includes("Users.html")) {
        const tabAdd = document.getElementById('tab-add');
        const tabRemove = document.getElementById('tab-remove');

        if(tabRemove) {
            tabRemove.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('button-add').style.display = 'none';
                document.getElementById('button-remove').style.display = 'flex';
                tabRemove.classList.add('active');
                tabAdd.classList.remove('active');
            });
        if(tabAdd) {
                tabAdd.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('button-add').style.display = 'flex';
                document.getElementById('button-remove').style.display = 'none';
                tabAdd.classList.add('active');
                tabRemove.classList.remove('active');
            });
        }
    }
}
}

async function expandMenu() {
    //!!!!!!!
    const menu = document.getElementById('expanded-menu');
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
    } else {
        menu.classList.add('active');
    }
}

async function clearFilters() {
    //params = new URLSearchParams();
    loadBooks();
}

// DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {

    tabClicked();
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

        if (window.location.pathname.includes("Books.html")) {
        populateFilters();
        loadBooks();
        initModal();
    }
});
