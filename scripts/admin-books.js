import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

export async function initAdminBooksPage() {
    const scrollBox = document.getElementById('books-scroll-box');
    const searchInput = document.getElementById('input-search');
    const addBookModal = document.getElementById('add-book');
    const removeBookModal = document.getElementById('remove-book');
    const selectRemove = document.getElementById('select-for-remove');

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

                const card = UiRenderer.createBookCard(book, []);
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
            console.error("Ошибка при загрузке книг:", e);
            gridContainer.innerHTML = `<p style="color: red; grid-column: span 3;">Ошибка связи с сервером: ${e.message}</p>`;
        }
    }


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

    document.getElementById('add-new-book')?.addEventListener('click', async () => {
        const title = document.getElementById('new-book-name').value;
        const author = document.getElementById('new-book-author').value;
        
        if (!title || !author) return alert("Введите название и автора");

        const newBook = {
            title,
            author,
            publisher: document.getElementById('new-book-publisher').value,
            genre: document.getElementById('new-book-genres').value.split(' ').filter(g => g),
            publishDate: new Date(document.getElementById('new-book-year').value || new Date().getFullYear(), 0, 1),
            inStock: document.getElementById('new-book-inStock').value === 'true'
        };

        try {
            await ApiService.post('/books', newBook);
            alert('Книга добавлена!');
            addBookModal.style.display = 'none';
            loadBooks();
        } catch (e) {
            alert('Ошибка: ' + e.message);
        }
    });

    document.getElementById('remove-book-btn')?.addEventListener('click', async () => {
        const id = selectRemove.value;
        if (!id) return alert("Выберите книгу");
        
        if (confirm('Удалить эту книгу навсегда?')) {
            try {
                await ApiService.delete(`/books/${id}`);
                alert('Книга удалена');
                removeBookModal.style.display = 'none';
                loadBooks();
            } catch (e) {
                alert('Ошибка: ' + e.message);
            }
        }
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

initAdminBooksPage();