import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

export async function initRequestsPage() {
    const scrollBox = document.getElementById('users-request-scroll-box');
    const modal = document.getElementById('modal');
    
    let requestContext = null; 

    async function loadRequests() {
        let listContainer = document.getElementById('requests-list-container');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.id = 'requests-list-container';
            listContainer.style.display = 'flex';
            listContainer.style.flexDirection = 'column';
            listContainer.style.gap = '10px';
            listContainer.style.width = '100%';
            scrollBox.appendChild(listContainer);
        }
        listContainer.innerHTML = '<p style="padding:20px;">Загрузка запросов...</p>';
        
        try {
            const users = await ApiService.get('/users'); 
            const books = await ApiService.get('/books');
            const booksMap = {};
            books.forEach(b => booksMap[b._id] = b);

            listContainer.innerHTML = '';
            let hasRequests = false;

            users.forEach(user => {
                if (user.wishlist && user.wishlist.length > 0) {
                    user.wishlist.forEach(bookId => {
                        hasRequests = true;
                        const bookInfo = booksMap[bookId] || { title: 'Книга удалена', author: '?', _id: bookId };

                        const card = UiRenderer.createRequestCard(user, bookInfo, (u, bId) => {
                            requestContext = { userId: u._id, bookId: bId };
                            if (modal.showModal) modal.showModal(); else modal.style.display = 'block';
                            
                            const today = new Date().toISOString().split('T')[0];
                            const nextWeek = new Date();
                            nextWeek.setDate(nextWeek.getDate() + 7);
                            
                            document.getElementById('input-date-start').value = today;
                            document.getElementById('input-date-end').value = nextWeek.toISOString().split('T')[0];
                        });
                        
                        listContainer.appendChild(card);
                    });
                }
            });

            if (!hasRequests) {
                listContainer.innerHTML = '<p style="padding:20px; text-align:center;">Активных запросов нет.</p>';
            }

        } catch (e) {
            listContainer.innerHTML = '<p style="color:red; padding:20px;">Ошибка: ' + e.message + '</p>';
        }
    }

    document.getElementById('btn-give')?.addEventListener('click', async () => {
        if (!requestContext) return;
        
        const start = document.getElementById('input-date-start').value;
        const end = document.getElementById('input-date-end').value;

        try {
            await ApiService.post('/users/accept-wishlist', {
                userId: requestContext.userId,
                bookId: requestContext.bookId,
                borrowedDate: start,
                returnDate: end
            });
            alert("Книга успешно выдана пользователю!");
            window.modalBooksClose();
            loadRequests();
        } catch (e) {
            alert("Ошибка при выдаче: " + e.message);
        }
    });

    window.modalBooksClose = () => {
        if (modal.close) modal.close(); else modal.style.display = 'none';
    };

    await loadRequests();
}

initRequestsPage();