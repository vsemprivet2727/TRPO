import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

export async function initProfilePage(pageType) {    
    const currentUser = localStorage.getItem('username');
    if (!currentUser) {
        document.querySelector('.scroll-box').innerHTML = '<p>Пожалуйста, войдите в аккаунт.</p>';
        return;
    }

    const scrollBoxId = pageType === 'active' ? 'user-books-scroll-box' : 'waiting-books-scroll-box';
    const scrollBox = document.getElementById(scrollBoxId);

    if(!scrollBox) return; 

    try {
        let books = [];
        
        if (pageType === 'active') {
            books = await ApiService.get('/user-books', { username: currentUser });
        } else {
            books = await ApiService.get('/user-wishlist', { username: currentUser });
        }

        scrollBox.innerHTML = '';
        scrollBox.style.display = 'grid';
        scrollBox.style.gridTemplateColumns = 'repeat(3, 1fr)';
        scrollBox.style.gap = '15px';

        if (books.length === 0) {
            scrollBox.innerHTML = '<p>Список пуст.</p>';
            return;
        }

        books.forEach(book => {
            const actions = [];
            
            const card = UiRenderer.createBookCard(book, actions);

            if (pageType === 'waiting') {
                const status = document.createElement('div');
                status.innerHTML = '<small style="color:orange; font-weight:bold;">🕒 Ожидает одобрения</small>';
                status.style.marginTop = '10px';
                card.appendChild(status);
            }
                        
            scrollBox.appendChild(card);
        });

    } catch (e) {
        console.error(e);
        scrollBox.innerHTML = `<p style="color:red">Ошибка: ${e.message}</p>`;
    }
}