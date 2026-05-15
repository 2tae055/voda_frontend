// js/navigation.js

function switchTab(tabIndex) {
    document.getElementById('tab-container').style.transform =
        `translateX(-${tabIndex * 25}%)`;

    const navItems = document.querySelectorAll('.bottom-nav .nav-item');

    navItems.forEach(btn => btn.classList.remove('active'));
    navItems[tabIndex].classList.add('active');

    if (window.isCalling) stopCall();
    if (window.isMicRecording) stopMicRecord();

    if (tabIndex === 0) openInRecordTab('default');
    if (tabIndex === 1) openInDiaryTab('main');
}

async function openInRecordTab(viewType) {
    if (viewType !== 'default') {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;
            const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            
            const response = await apiFetch(`/diaries/monthly-summary?year=${year}&month=${month}`);
            const dates = response.data.dates || [];
            const todayData = dates.find(d => d.date === todayStr);
            
            if (todayData && todayData.diaries && todayData.diaries.length > 0) {
                alert('오늘은 이미 일기를 작성했어요! 다이어리 탭에서 내용을 확인하고 수정해 보세요. 😊');
                return; 
            }
        } catch (error) {
            console.error("일기 기록 확인 중 오류:", error);
        }
    }

    const views = ['default', 'chat', 'diary', 'call', 'mic'];

    views.forEach(v => {
        const el = document.getElementById(v + '-record-view');
        if (el) el.style.display = 'none';
    });

    if (viewType === 'chat') {
        document.getElementById('chat-record-view').style.display = 'flex';
        setTimeout(() => { document.getElementById('chat-input').focus(); }, 100);

    } else if (viewType === 'diary') {
        document.getElementById('diary-record-view').style.display = 'flex';
        const today = new Date();
        document.getElementById('diary-date-header').innerText =
            `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        setTimeout(() => { document.getElementById('diary-title-input').focus(); }, 100);

    } else if (viewType === 'call') {
        document.getElementById('call-record-view').style.display = 'flex';
        if (typeof startCall === 'function') startCall();

    } else if (viewType === 'mic') {
        document.getElementById('mic-record-view').style.display = 'flex';
        if (typeof startMicRecord === 'function') startMicRecord();

    } else {
        document.getElementById('default-record-view').style.display = 'flex';
    }
}

function openInDiaryTab(viewType) {
    document.getElementById('diary-main-view').style.display = 'none';
    document.getElementById('diary-search-view').style.display = 'none';
    document.getElementById('diary-detail-view').style.display = 'none';
    
    const editView = document.getElementById('diary-edit-view');
    if (editView) editView.style.display = 'none';

    if (viewType === 'search') {
        document.getElementById('diary-search-view').style.display = 'flex';
    } else if (viewType === 'detail') {
        document.getElementById('diary-detail-view').style.display = 'flex';
    } else if (viewType === 'edit') {
        if (editView) editView.style.display = 'flex';
    } else {
        document.getElementById('diary-main-view').style.display = 'flex';
    }
}

function triggerEndSessionFlow(type) {
    showConfirmModal("기록을 마칠까요?", () => {
        if (type === 'call') stopCall();
        if (type === 'mic') stopMicRecord();

        showLoadingModal(
            "⏳ 기록을 저장합니다...<br>잠시만 기다려주세요.",
            1500,
            () => {
                showSuccessModal(
                    "✨ 기록을 성공적으로 저장했습니다!",
                    800,
                    () => { openInRecordTab('default'); }
                );
            }
        );
    });
}

async function triggerAutoDiary() {
    try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1;
        const todayStr = `${year}-${String(month).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        
        const response = await apiFetch(`/diaries/monthly-summary?year=${year}&month=${month}`);
        const dates = response.data.dates || [];
        const todayData = dates.find(d => d.date === todayStr);
        
        if (todayData && todayData.diaries && todayData.diaries.length > 0) {
            alert('오늘은 이미 일기를 작성했어요! 다이어리 탭에서 내용을 확인해 보세요. 😊');
            return; 
        }
    } catch (error) {
        console.error("일기 기록 확인 중 오류:", error);
    }

    showConfirmModal(
        "사용자님의 일정과 그 동안의 대화를 종합해서<br>일기를 작성할까요?",
        () => {
            showLoadingModal(
                "⏳ 일기를 기록하는 중...<br>잠시만 기다려주세요.",
                3000,
                () => {
                    showSuccessModal(
                        "✨ 일기 작성 완료!",
                        1000,
                        () => { openInRecordTab('default'); }
                    );
                }
            );
        }
    );
}

window.switchTab = switchTab;
window.openInRecordTab = openInRecordTab;
window.openInDiaryTab = openInDiaryTab;
window.triggerEndSessionFlow = triggerEndSessionFlow;
window.triggerAutoDiary = triggerAutoDiary;