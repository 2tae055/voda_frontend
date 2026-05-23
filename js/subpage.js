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
                    루틴 설정
                </div>

                <div style="display:flex; gap:10px;">

                    <label style="flex:1;">
                        <input
                            type="radio"
                            name="todoRoutine"
                            value="daily"
                            checked
                            onchange="window.toggleTodoTime('daily')"
                            style="display:none;"
                        >

                        <div class="routine-btn daily-btn">
                            매일
                        </div>
                    </label>

                    <label style="flex:1;">
                        <input
                            type="radio"
                            name="todoRoutine"
                            value="weekly"
                            onchange="window.toggleTodoTime('weekly')"
                            style="display:none;"
                        >

                        <div class="routine-btn weekly-btn">
                            매주
                        </div>
                    </label>

                    <label style="flex:1;">
                        <input
                            type="radio"
                            name="todoRoutine"
                            value="monthly"
                            onchange="window.toggleTodoTime('monthly')"
                            style="display:none;"
                        >

                        <div class="routine-btn monthly-btn">
                            매월
                        </div>
                    </label>

                </div>
            </div>

            <div>

                <div style="font-size:14px; color:var(--text-gray); font-weight:600; margin-bottom:12px;">
                    기한 설정
                </div>

                <div id="todo-time-daily"
                     style="display:flex; gap:10px; align-items:center;">

                    <span style="font-size:14px; font-weight:600; color:var(--text-gray);">
                        시간 제한 없음
                    </span>

                </div>

                <div id="todo-time-weekly"
                     style="display:none; gap:10px; align-items:center;">

                    <select id="todo-week-val"
                            class="todo-date-input"
                            style="flex:1;">

                        <option value="월요일">월요일</option>
                        <option value="화요일">화요일</option>
                        <option value="수요일">수요일</option>
                        <option value="목요일">목요일</option>
                        <option value="금요일">금요일</option>
                        <option value="토요일">토요일</option>
                        <option value="일요일">일요일</option>

                    </select>

                    <span style="font-size:14px; font-weight:600; color:var(--text-dark);">
                        까지
                    </span>

                </div>

                <div id="todo-time-monthly"
                     style="display:none; gap:10px; align-items:center;">

                    <input
                        type="number"
                        id="todo-month-val"
                        class="todo-date-input"
                        min="1"
                        max="31"
                        placeholder="몇 일?"
                        style="flex:1;"
                    >

                    <span style="font-size:14px; font-weight:600; color:var(--text-dark);">
                        일까지
                    </span>

                </div>

            </div>

            <div>

                <div style="font-size:14px; color:var(--text-gray); font-weight:600; margin-bottom:12px;">
                    할 일 내용
                </div>

                <input
                    type="text"
                    id="new-todo-input"
                    placeholder="어떤 일을 해야 하나요?"
                    class="todo-date-input"
                    style="background-color:white;"
                >

            </div>

            <button
                onclick="addNewTodo()"
                style="background:var(--primary-orange); color:white; border:none; padding:16px; border-radius:14px; font-size:16px; font-weight:700; cursor:pointer; font-family:'Pretendard'; margin-top:10px; box-shadow: 0 4px 10px rgba(242,140,40,0.2);"
            >
                추가하기
            </button>

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
        content: `<div>설정</div>`
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