import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

export async function initCataloguePage() {
    const scrollBox = document.getElementById('books-scroll-box');
    const searchInput = document.getElementById('input-search');
    const addBookModal = document.getElementById('add-book');
    const removeBookModal = document.getElementById('remove-book');
    const selectRemove = document.getElementById('select-for-remove');
    const bookModal = document.getElementById('bookModal');

    let gridContainer = document.getElementById('books-grid-container');
    if (!gridContainer) {
        gridContainer = document.createElement('div');
        gridContainer.id = 'books-grid-container';
        gridContainer.style.display = 'grid';
        gridContainer.style.gridTemplateColumns = 'repeat(3, 1fr)';
        gridContainer.style.gap = '10px';
        gridContainer.style.width = '100%';
        gridContainer.style.marginTop = '40px';
        scrollBox.appendChild(gridContainer);
    }

    async function loadBooks() {
        const filters = {
            author: document.getElementById('author-select')?.value || '',
            publisher: document.getElementById('publisher-select')?.value || '',
            genre: document.getElementById('genre-select')?.value || '',
            year: document.getElementById('input-year')?.value || '',
            inStock: document.getElementById('checkbox-is-we-have')?.classList.contains('active') ? 'true' : ''
        };
        
        try {
            const books = await ApiService.get('/books', filters);
            const searchText = searchInput ? searchInput.value.toLowerCase() : '';
            
            gridContainer.innerHTML = '';
            if (selectRemove) selectRemove.innerHTML = '<option value="">Выберите книгу</option>';

            books.forEach(book => {
                if (searchText && !book.title.toLowerCase().includes(searchText)) return;

                const card = UiRenderer.createBookCard(book, [
                    {
                        label: 'Подробнее',
                        onClick: () => UiRenderer.openBookModal(book)
                    }
                ]);
                gridContainer.appendChild(card);

                if (selectRemove) {
                    const option = document.createElement('option');
                    option.value = book._id;
                    option.textContent = `${book.title} (${book.author})`;
                    selectRemove.appendChild(option);
                }
            });

            if (gridContainer.children.length === 0) {
                gridContainer.innerHTML = '<p style="grid-column: span 3; text-align: center;">Книги не найдены</p>';
            }
        } catch (e) {
            console.error(e);
        }
    }

    async function requestBook() {
    const bookId = bookModal.dataset.currentBookId;
    const userRaw = localStorage.getItem('currentUser');
    
    if (!userRaw) {
        alert('Пожалуйста, войдите в систему');
        return;
    }

    let username;
    try {
        const userData = JSON.parse(userRaw);
        username = userData.username || userData;
    } catch (e) {
        username = userRaw;
    }

    try {
        const users = await ApiService.get('/users', { username: username });
        if (!users || users.length === 0) throw new Error('Пользователь не найден');
        
        const userId = users[0]._id;

        // Формируем данные. 
        // Если это просто wishlist (список ожидания), отправляем ID.
        // Если ваш бэкенд сразу требует даты (как в borrowedBooks), добавляем их:
        const requestData = {
            userId: userId,
            bookId: bookId,
            // Добавляем даты на случай, если сервер их требует сразу
            borrowedDate: new Date().toISOString(),
            returnDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 дней
        };

        await ApiService.post('/users/wishlist', requestData);

        alert('Заявка отправлена!');
        if (bookModal.close) bookModal.close();
        else bookModal.style.display = 'none';
        
    } catch (e) {
        console.error(e);
        alert('Ошибка: ' + e.message);
    }
    }

    document.getElementById('request-btn')?.addEventListener('click', requestBook);

    if (searchInput) {
        searchInput.addEventListener('input', loadBooks);
    }

    document.querySelectorAll('.filter-box-table select, .filter-box-table input').forEach(el => {
        el.addEventListener('change', loadBooks);
    });

    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
        document.querySelectorAll('.filter-box-table input').forEach(i => i.value = '');
        document.querySelectorAll('.filter-box-table select').forEach(s => s.value = '');
        document.getElementById('checkbox-is-we-have')?.classList.remove('active');
        if (searchInput) searchInput.value = '';
        loadBooks();
    });

    window.inStockClicked = () => {
        document.getElementById('checkbox-is-we-have')?.classList.toggle('active');
        loadBooks();
    };

    window.openAddBook = () => addBookModal.style.display = 'block';
    window.closeAddBook = () => addBookModal.style.display = 'none';
    window.openRemoveBook = () => removeBookModal.style.display = 'block';
    window.closeRemoveBook = () => removeBookModal.style.display = 'none';
    window.modalClose = () => document.getElementById('bookModal').close();

    await loadBooks();
}
console.log(localStorage.getItem('currentUser'))
initCataloguePage();