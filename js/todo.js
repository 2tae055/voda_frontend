async function loadTodos() {
    try {
        const response = await apiFetch('/todo');
        const todos = response.data.todos || [];

        document.getElementById('todo-list-daily').innerHTML = '<h3 class="todo-title daily">매일</h3>';
        document.getElementById('todo-list-weekly').innerHTML = '<h3 class="todo-title weekly">매주</h3>';
        document.getElementById('todo-list-monthly').innerHTML = '<h3 class="todo-title monthly">매월</h3>';

        todos.forEach(todo => {
            const section = getTodoSection(todo.dueTo);
            const targetSection = document.getElementById('todo-list-' + section);
            if (!targetSection) return;

            const newLabel = document.createElement('label');
            newLabel.className = 'todo-item ' + section;
            newLabel.innerHTML = `
                <div class="todo-content">
                    <span class="todo-text">${todo.content}</span>
                    <span style="font-size:12px; color:var(--text-gray); display:block; margin-top:4px;">
                        ${formatDueTo(todo.dueTo)}
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
    
    if (!text) { 
        showSuccessModal('할 일 내용을 입력해주세요! ✍️', 1500); 
        return; 
    }

    const routine = document.querySelector('input[name="todoRoutine"]:checked').value;
    const dueTo = getDueToFromRoutine(routine);

    try {
        const response = await apiFetch('/todo', {
            method: 'POST',
            body: JSON.stringify({
                content: text,
                dueTo: dueTo
            })
        });

        if (response.success) {
            showSuccessModal('✨ 새로운 할 일이 추가되었습니다!', 1500, () => {
                input.value = ''; 
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
                    
                    if (typeof loadTodos === 'function') {
                        loadTodos();
                    }
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

function getDueToFromRoutine(routine) {
    const now = new Date();
    if (routine === 'daily') {
        now.setHours(23, 59, 59, 0);
    } else if (routine === 'weekly') {
        const dayNames = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
        const targetDay = dayNames.indexOf(document.getElementById('todo-week-val').value);
        const currentDay = now.getDay();
        const diff = (targetDay - currentDay + 7) % 7 || 7;
        now.setDate(now.getDate() + diff);
    } else if (routine === 'monthly') {
        const d = document.getElementById('todo-month-val').value;
        now.setDate(d || 1);
        now.setMonth(now.getMonth() + 1);
    }
    return now.toISOString();
}

function getTodoSection(dueTo) {
    if (!dueTo) return 'daily';
    const due = new Date(dueTo);
    const now = new Date();
    const diffDays = (due - now) / (1000 * 60 * 60 * 24);
    if (diffDays <= 1) return 'daily';
    if (diffDays <= 7) return 'weekly';
    return 'monthly';
}

function formatDueTo(dueTo) {
    if (!dueTo) return '';
    return new Date(dueTo).toLocaleDateString('ko-KR', {
        month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
}

//window.addEventListener('DOMContentLoaded', loadTodos);
window.loadTodos = loadTodos;
window.addNewTodo = addNewTodo;
window.deleteTodo = deleteTodo;
window.toggleTodoStatus = toggleTodoStatus;