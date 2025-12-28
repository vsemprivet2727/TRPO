import { ApiService } from './api.js';
import { UiRenderer } from './rendering.js';

export async function initAdminUsersPage() {
    const scrollBox = document.getElementById('users-scroll-box');
    const userModal = document.getElementById('button-add-container');
    const userBooksSelect = document.getElementById('user-borrowed-books-select');
    const searchInput = document.getElementById('input-search');
    
    let selectedUserId = null;

    async function loadUsers() {
        const emailFilter = searchInput?.value || '';
        
        let listContainer = document.getElementById('users-list-container');
        if (!listContainer) {
            listContainer = document.createElement('div');
            listContainer.id = 'users-list-container';
            listContainer.style.display = 'grid';
            listContainer.style.marginTop = '40px'
            listContainer.style.gap = '10px';
            listContainer.style.gridTemplateColumns = 'repeat(3, 1fr)'
            scrollBox.appendChild(listContainer);
        }

        try {
            const users = await ApiService.get('/users', { email: emailFilter });
            listContainer.innerHTML = '';
            
            users.forEach(user => {
                if(user.username !== 'admin') {
                const card = UiRenderer.createUserCard(user, (selectedUser, cardElement) => {
                    document.querySelectorAll('.user-card').forEach(c => c.style.border = '1px solid #ddd');
                    selectedUserId = selectedUser._id;

                    cardElement.ondblclick = () => openUserManageModal(selectedUser);
                });
                listContainer.appendChild(card);
            }
            });    
        } catch (e) {
            listContainer.innerHTML = 'Ошибка: ' + e.message;
        }
    }

    function openUserManageModal(user) {
        if (userModal.showModal) userModal.showModal(); else userModal.style.display = 'block';
        
        userBooksSelect.innerHTML = '';
        if (user.borrowedBooks && user.borrowedBooks.length > 0) {
            user.borrowedBooks.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item.bookId;
                opt.textContent = `Книга ID: ${item.bookId} (до ${new Date(item.returnDate).toLocaleDateString()})`;
                userBooksSelect.appendChild(opt);
            });
        } else {
            userBooksSelect.innerHTML = '<option disabled>Нет взятых книг</option>';
        }

        document.getElementById('button-remove').onclick = async () => {
            const bookId = userBooksSelect.value;
            if (!bookId) return alert("Выберите книгу из списка");
            
            try {
                await ApiService.delete(`/users/${user._id}/return/${bookId}`);
                alert("Книга успешно возвращена");
                window.modalUserClose();
                loadUsers(); 
            } catch (e) {
                alert("Ошибка: " + e.message);
            }
        };
    }

    searchInput?.addEventListener('input', loadUsers);

    document.getElementById('export-users-csv')?.addEventListener('click', () => {
        alert("Генерация отчета по должникам...");
    });

    window.modalUserClose = () => {
        if (userModal.close) userModal.close(); else userModal.style.display = 'none';
    };

    await loadUsers();
}

initAdminUsersPage();