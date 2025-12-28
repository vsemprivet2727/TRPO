const API_URL = 'http://localhost:3000/api';
const AUTH_KEY = 'currentUser';

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
    } catch (error) {
        console.log('Ошибка: ', error)
    }
}

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
    if (stockCb) stockCb.addEventListener("change", applyFilters);
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

document.addEventListener('DOMContentLoaded', () => {
    if(location.href.includes('/Books.html') || location.href.includes('/Main.html')) {
        populateFilters();
    }
});

