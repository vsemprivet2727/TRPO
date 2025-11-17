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
                <img src="resources/Book open.png" alt="Книга">
                <span class="item-label">${book.title}</span>
                <small>${book.author}</small>
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
/*
document.addEventListener('DOMContentLoaded', function() {
    loadTestBooks();
    initModal();
});

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