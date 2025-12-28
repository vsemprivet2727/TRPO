export class UiRenderer {
    static createBookCard(book, actions = []) {
        const div = document.createElement('div');
        div.className = 'scroll-box-item book-card';
        div.style.width = '16vw';
        div.style.height = '8vw';
        div.innerHTML = `
            <div style="display:flex; flex-direction:row; gap:10px">
                <div style="display:flex;flex-direction:column; flex:1">
                    <h4 style="margin-top:0; text-align:left;">${book.title}</h4>
                    <p style="margin: 5px 0; text-align:left; font-size: 0.9em; opacity: 0.8;">${book.author}</p>
                </div>
                <div style="flex-shrink:0">
                    <img src="../resources/Book open.png" style="width: 40px; height: 40px; object-fit: contain;">
                </div>
            </div>
        `;

        if (actions.length > 0) {
            const btnContainer = document.createElement('div');
            btnContainer.style.marginTop = "10px";
            btnContainer.style.display = "flex";
            btnContainer.style.gap = "5px";
            
            actions.forEach(action => {
                const btn = document.createElement('button');
                btn.textContent = action.label;
                btn.className = action.class || 'btn btn-primary';
                btn.style.padding = "2px 8px";
                btn.style.fontSize = "0.8em";
                btn.onclick = (e) => {
                    e.stopPropagation();
                    action.onClick(book);
                };
                btnContainer.appendChild(btn);
            });
            div.appendChild(btnContainer);
        }
        
        div.style.cursor = "pointer";
        div.addEventListener('click', () => UiRenderer.openBookModal(book));

        return div;
    }

    static createUserCard(user, onClick) {
        const div = document.createElement('div');
        div.className = 'user-card';
        div.style.border = "1px solid #ccc";
        div.style.borderRadius = '15px';
        div.style.padding = "10px";
        div.style.marginBottom = "10px";
        div.style.cursor = "pointer";
        div.style.backgroundColor = '#fdefd9';
        div.style.transition = 'all 0.2s ease';

        const borrowedCount = user.borrowedBooks ? user.borrowedBooks.length : 0;
        
        div.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <h4 style="margin:0">${user.username || 'Без имени'}</h4>
                    <small style="color:#666">${user.email}</small>
                </div>
                <div style="text-align:right">
                    <span style="background: #fff; padding: 4px 8px; border-radius: 8px; font-weight: bold; font-size: 0.85em;">
                        Книг: ${borrowedCount}
                    </span>
                </div>
            </div>
        `;
        
        div.onclick = () => onClick(user, div);
        return div;
    }

    static createRequestCard(user, bookInfo, onApprove) {
         const div = document.createElement('div');
         div.className = 'scroll-box-item book-card';
         div.style.border = "1px solid #ccc";
         div.style.display = 'flex';
         div.style.flexDirection = 'column';
         div.style.aspectRatio = '5/1'

         div.innerHTML = `
            <h4>Пользователь: <span>${user.username}</span></h4>
            <div style="padding: 10px; background: #f9f9f9; border-radius:10px; width:100%">
                <strong style="display:block; margin-bottom:4px;">Запрос на книгу:</strong>
                <span style="font-size:1.1em">"${bookInfo.title}"</span><br>
                <small style="color:#555">${bookInfo.author}</small>
            </div>
         `;

         const btn = document.createElement('button');
         btn.className = 'btn btn-primary';
         btn.style.alignSelf = 'flex-start';
         btn.textContent = 'Оформить выдачу';
         btn.onclick = () => onApprove(user, bookInfo._id);
         
         div.appendChild(btn);
         return div;
    }

    static openBookModal(book) {
        const modal = document.getElementById('bookModal');
        if (!modal) return;

        const setText = (id, val) => {
            const el = document.getElementById(id);
            if(el) el.textContent = val;
        };

        setText('modalTitle', book.title);
        setText('modalAuthor', book.author);
        setText('modalYear', book.publishDate ? new Date(book.publishDate).getFullYear() : '—');
        setText('modalGenre', Array.isArray(book.genre) ? book.genre.join(', ') : (book.genre || '—'));
        setText('modalPublisher', book.publisher || '—');

        modal.dataset.currentBookId = book._id;

        if (modal.showModal) {
            modal.showModal();
        } else {
            modal.style.display = 'block';
        }

        const closeBtn = modal.querySelector('.close');
        if (closeBtn) {
            closeBtn.onclick = () => modal.close ? modal.close() : (modal.style.display = 'none');
        }
    }
}