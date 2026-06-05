// js/todo.js

async function loadTodos() {
    try {
        const response = await apiFetch('/todo');
        const todos = response.data.todos || [];

        const container = document.querySelector('.todo-container');
        if (!container) return;

        container.innerHTML = `
            <div class="todo-section" id="todo-list-main">
                <h3 class="todo-title" style="color: var(--text-dark); margin-bottom: 10px;">나의 할 일</h3>
            </div>
        `;
        const targetSection = document.getElementById('todo-list-main');

        if (todos.length === 0) {
            targetSection.innerHTML += `<div style="text-align:center; color:var(--text-gray); padding:40px 0;">등록된 할 일이 없습니다.</div>`;
        }

        todos.forEach(todo => {
            const newLabel = document.createElement('label');
            newLabel.className = 'todo-item'; 
            newLabel.innerHTML = `
                <div class="todo-content">
                    <span class="todo-text">${todo.content}</span>
                    <span style="font-size:12px; color:var(--text-gray); display:block; margin-top:4px;">
                        ${formatDueTo(todo.dueTo)} 까지
                    </span>
                </div>
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="checkbox" class="todo-check" ${todo.status ? 'checked' : ''}
                           onchange="toggleTodoStatus('${todo.todoId}', this.checked)">
                    <span class="check-mark material-symbols-rounded"></span>
                    <button onclick="deleteTodo('${todo.todoId}')" 
                            style="background:none; border:none; cursor:pointer; color:var(--text-gray); padding: 4px; display: flex; align-items: center;">
                        <span class="material-symbols-rounded" style="font-size:18px;">delete</span>
                    </button>
                </div>
            `;
            targetSection.appendChild(newLabel);
        });

        console.log("할 일 로드 완료!");
    } catch (error) {
        console.error("데이터 로드 중 오류:", error);
    }
}

async function addNewTodo() {
    const input = document.getElementById('new-todo-input');
    const text = input.value.trim();
    const dateInput = document.getElementById('todo-due-date'); // 새로운 날짜 입력창
    const dueToValue = dateInput ? dateInput.value : '';

    if (!text) { 
        showSuccessModal('할 일 내용을 입력해주세요! ✍️', 1500); 
        return; 
    }
    if (!dueToValue) {
        showSuccessModal('마감 일시를 선택해주세요! 🗓️', 1500); 
        return; 
    }

    try {
        const response = await apiFetch('/todo', {
            method: 'POST',
            body: JSON.stringify({
                content: text,
                dueTo: new Date(dueToValue).toISOString() 
            })
        });

        if (response.success) {
            showSuccessModal('✨ 새로운 할 일이 추가되었습니다!', 1500, () => {
                input.value = ''; 
                if (dateInput) dateInput.value = '';
                if (typeof closeSubPage === 'function') closeSubPage(); 
                if (typeof loadTodos === 'function') loadTodos(); 
            });
        }
    } catch (error) {
        showSuccessModal('❌ 데이터 저장에 실패했습니다.', 2000);
        console.error('할 일 추가 에러:', error);
    }
}

function deleteTodo(todoId) {
    showConfirmModal('이 할 일을 삭제하시겠습니까?', async () => {
        try {
            const response = await apiFetch(`/todo/${todoId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                showSuccessModal('✨ 할 일이 삭제되었습니다.', 1500, () => {
                    if (typeof loadTodos === 'function') loadTodos();
                });
            }
        } catch (error) {
            showSuccessModal('❌ 삭제에 실패했습니다.', 2000);
            console.error('할 일 삭제 에러:', error);
        }
    });
}

async function toggleTodoStatus(todoId) {
    try {
        const response = await apiFetch(`/todo/${todoId}/status`, {
            method: 'PATCH'
        });

        if (!response.success) {
            alert("상태 변경에 실패했습니다.");
        }
    } catch (error) {
        console.error("상태 변경 실패:", error);
        alert("상태 변경에 실패했습니다.");
    }
}

function formatDueTo(dueTo) {
    if (!dueTo) return '';
    return new Date(dueTo).toLocaleDateString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

window.loadTodos = loadTodos;
window.addNewTodo = addNewTodo;
window.deleteTodo = deleteTodo;
window.toggleTodoStatus = toggleTodoStatus;