const API_URL = 'http://localhost:3000/api';

document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
});

async function loadBooks() {
    try {
        const response = await fetch(`${API_URL}/books`);
        
        if (!response.ok) {
            throw new Error('Ошибка загрузки книг');
        }
        
        const books = await response.json();
        displayBooks(books);
    }
     catch (error) {
    console.error('Error loading books: ', error);
}
}

function displayBooks(books) {
    const scrollBox = document.querySelector('.scroll-box');
    
    if (books.length === 0) {
        scrollBox.innerHTML = '<p>Книги не найдены</p>';
        return;
    }
    scrollBox.innerHTML = '';
    

    // title author publishDate publisher genre pages language
    books.forEach(book => {
        const bookItem = document.createElement('ul');
        bookItem.className = 'scroll-box-item';
        bookItem.innerHTML = `
            <li>
                <img src="resources/Book open.png" alt="Книга">
                <span class="item-label">${book.title}</span>
                <small>${book.author}</small>
            </li>
        `;
        scrollBox.appendChild(bookItem);
    });
}

document.addEventListener('DOMContentLoaded', function(){
    const bookItems = document.querySelectorAll('.scroll-box-item');

    bookItems.forEach(item=> {
        item.addEventListener(cancelIdleCallback, function(){
            const bookId = this.getAttribute('data-book-id');
            
        })
    })
})