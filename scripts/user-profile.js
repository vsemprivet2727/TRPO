import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

function getCurrentUsername() {
    const userRaw = localStorage.getItem('currentUser');
    if (!userRaw) return null;
    try {
        const userObj = JSON.parse(userRaw);
        return userObj.username || userObj;
    } catch (e) {
        return userRaw;
    }
}

async function initUserProfile() {
    const username = getCurrentUsername();
    if (!username) return;

    try {
        const users = await ApiService.get(`/users`, { username: username });
        if (!users || users.length === 0) return;
        
        const currentUser = users[0];

        if (location.href.includes('UsersBooks.html')) {
            await renderMyBooks(currentUser);
        } else if (location.href.includes('Waiting.html')) {
            await renderWaitingBooks(currentUser);
        }

    } catch (error) {
        console.error(error);
    }
}

async function renderMyBooks(user) {
    const container = document.getElementById('user-books-scroll-box');
    if (!container) return;
    container.innerHTML = '';

    const borrowedList = user.borrowedBooks || [];

    if (borrowedList.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Нет взятых книг.</p>';
        return;
    }

    for (const item of borrowedList) {
        try {
            const bookId = item.bookId?._id || item.bookId;
            if (!bookId) continue;

            const bookDetails = await ApiService.get(`/books/${bookId}`);

            const card = UiRenderer.createBookCard(bookDetails, [
                {
                    label: 'Вернуть',
                    onClick: () => returnBook(user._id, bookId)
                }
            ]);

            const dateInfo = document.createElement('div');
            dateInfo.style.fontSize = '0.8em';
            dateInfo.style.color = 'gray';
            dateInfo.style.padding = '0 10px 10px 10px';
            const rDate = new Date(item.returnDate).toLocaleDateString();
            dateInfo.innerText = `Вернуть до: ${rDate}`;
            card.appendChild(dateInfo);

            container.appendChild(card);
        } catch (e) {
            continue;
        }
    }
}

async function renderWaitingBooks(user) {
    const container = document.getElementById('waiting-books-scroll-box');
    if (!container) return;
    container.innerHTML = '';

    const wishlist = user.wishlist || [];

    if (wishlist.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:20px;">Список ожидания пуст.</p>';
        return;
    }

    for (const item of wishlist) {
        try {
            const bookId = item._id || item;
            const bookDetails = await ApiService.get(`/books/${bookId}`);

            const card = UiRenderer.createBookCard(bookDetails, []);
            
            const badge = document.createElement('div');
            badge.innerHTML = '<span style="background:orange; color:white; padding:2px 6px; border-radius:4px; font-size:12px;">Ждет подтверждения</span>';
            badge.style.padding = "0 10px 10px 10px";
            card.appendChild(badge);

            container.appendChild(card);
        } catch (e) {
            continue;
        }
    }
}

async function returnBook(userId, bookId) {
    if (!confirm('Вернуть книгу в библиотеку?')) return;
    try {
        await ApiService.post('/users/return', { userId, bookId });
        alert('Книга возвращена!');
        location.reload();
    } catch (e) {
        alert('Ошибка возврата: ' + e.message);
    }
}

document.addEventListener('DOMContentLoaded', initUserProfile);