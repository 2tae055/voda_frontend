// js/subpage.js

let subPage;
let subPageTitle;
let genericContent;

document.addEventListener('DOMContentLoaded', () => {

    subPage = document.getElementById('sub-page');
    subPageTitle = document.getElementById('sub-page-title');
    genericContent = document.getElementById('generic-content');

});

window.toggleTodoTime = function(type) {

    document.getElementById('todo-time-daily').style.display = 'none';
    document.getElementById('todo-time-weekly').style.display = 'none';
    document.getElementById('todo-time-monthly').style.display = 'none';

    document.getElementById('todo-time-' + type).style.display = 'flex';
};

const subPageData = {
    notifications: {
        title: '알림',
        content: `<div class="noti-list">알림 페이지</div>`
    },

    addTodo: {
        title: '새 할 일 추가',
        content: `
            <div style="width:100%; display:flex; flex-direction:column; gap:24px; text-align:left; padding: 24px; box-sizing: border-box;">

                <div>
                    <div style="font-size:14px; color:var(--text-gray); font-weight:600; margin-bottom:12px;">
                        할 일 내용
                    </div>
                    <input type="text" id="new-todo-input" class="search-input-box" placeholder="무엇을 해야 하나요?" style="background:#FAFAFA;">
                </div>

                <div>
                    <div style="font-size:14px; color:var(--text-gray); font-weight:600; margin-bottom:12px;">
                        언제까지 해야 하나요?
                    </div>
                    <input type="datetime-local" id="todo-due-date" class="todo-date-input" style="width:100%;">
                </div>

                <div style="margin-top: 20px;">
                    <button class="login-btn" style="background:var(--text-dark); color:white;" onclick="addNewTodo()">추가하기</button>
                </div>
            </div>
        `
    },

    report: {
        title: '나의 레포트',
        content: `
            <div style="width:100%; background:#f7f7f7; min-height:100%;">
                <div style="display:flex; background:white; padding:0 16px; border-bottom:1px solid #f0f0f0;">
                    <button id="tab-monthly" onclick="switchReportTab('monthly')"
                            style="flex:1; background:none; border:none; border-bottom:2px solid var(--primary-orange); padding:14px 0; font-size:15px; font-weight:700; color:var(--primary-orange); cursor:pointer; font-family:'Pretendard';">
                        월간
                    </button>
                    <button id="tab-weekly" onclick="switchReportTab('weekly')"
                            style="flex:1; background:none; border:none; border-bottom:2px solid transparent; padding:14px 0; font-size:15px; font-weight:600; color:var(--text-gray); cursor:pointer; font-family:'Pretendard';">
                        주간
                    </button>
                </div>
                <div id="report-list" style="padding:16px; display:flex; flex-direction:column; gap:12px;">
                    <div style="text-align:center; color:var(--text-gray); padding:40px 0;">불러오는 중...</div>
                </div>
            </div>
        `
    },

    settings: {
        title: '앱 설정',
        content: `
            <div style="padding: 20px; display: flex; flex-direction: column; gap: 15px;">
                <div style="padding: 16px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02);">
                    <div style="font-size: 13px; color: var(--text-gray); margin-bottom: 4px;">현재 버전</div>
                    <div style="font-size: 16px; font-weight: 600; color: var(--text-dark);">v 1.0.0</div>
                </div>

                <!-- 로그아웃 버튼 -->
                <button onclick="handleLogout()" style="margin-top: 20px; padding: 16px; background: white; border: 1px solid #ff4d4d; color: #ff4d4d; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 6px;">
                    <span class="material-symbols-rounded">logout</span>
                    로그아웃
                </button>
            </div>
        `
    }
};

function openSubPage(pageId) {

    if (pageId === 'addTodo') {

    const radios =
        document.querySelectorAll(
            'input[name="todoRoutine"]'
        );

    radios.forEach(radio => {

        radio.addEventListener(
            'change',
            (e) => {

                document.getElementById(
                    'todo-time-weekly'
                ).style.display = 'none';

                document.getElementById(
                    'todo-time-monthly'
                ).style.display = 'none';

                if (e.target.value === 'weekly') {

                    document.getElementById(
                        'todo-time-weekly'
                    ).style.display = 'block';
                }

                if (e.target.value === 'monthly') {

                    document.getElementById(
                        'todo-time-monthly'
                    ).style.display = 'block';
                }
            }
        );
    });
}

    if (pageId === 'notifications') {

        const badge = document.getElementById('noti-badge');

        if (badge) {
            badge.style.display = 'none';
        }
    }

    subPageTitle.innerText = subPageData[pageId].title;

    genericContent.innerHTML = subPageData[pageId].content;

    genericContent.style.padding = '0';

    subPage.classList.add('show');

    if (pageId === 'report') {
        loadReportPage();
    }
}

function closeSubPage() {
    subPage.classList.remove('show');
}

window.openSubPage = openSubPage;
window.closeSubPage = closeSubPage;