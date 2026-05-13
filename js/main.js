// js/main.js

async function initializeApp() {

    try {

        if (typeof loadMyProfile === 'function') {
            await loadMyProfile();
        }

        if (typeof loadTodos === 'function') {
            await loadTodos();
        }

        if (typeof renderCalendar === 'function') {

            await renderCalendar(
                currentYear,
                currentMonth
            );
        }

        console.log('앱 초기화 완료');

    } catch (error) {

        console.error(
            '앱 초기화 실패:',
            error
        );
    }
}

document.addEventListener(
    'DOMContentLoaded',
    async () => {

        const token =
            localStorage.getItem('accessToken');

        if (token) {

            await initializeApp();

            enterMainApp();
        }
    }
);

window.initializeApp =
    initializeApp;