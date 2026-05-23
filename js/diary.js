window.currentDiaryDetail = null;
let selectedRange = null;
let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth() + 1;
let monthlyDiaries = [];

document.addEventListener('DOMContentLoaded', () => {
    const diaryInputEl = document.getElementById('diary-input');
    const aiTooltip = document.getElementById('ai-polish-tooltip');

    if (diaryInputEl && aiTooltip) {
        diaryInputEl.addEventListener('mouseup', handleTextSelection);
        diaryInputEl.addEventListener('touchend', handleTextSelection);
        diaryInputEl.addEventListener('keyup', handleTextSelection);
        diaryInputEl.addEventListener('input', () => { 
            aiTooltip.style.display = 'none'; 
        });
    }

    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    if (prevBtn) {
        prevBtn.onclick = () => {
            currentMonth--;
            if (currentMonth < 1) { currentMonth = 12; currentYear--; }
            renderCalendar(currentYear, currentMonth);
        };
    }
    if (nextBtn) {
        nextBtn.onclick = () => {
            currentMonth++;
            if (currentMonth > 12) { currentMonth = 1; currentYear++; }
            renderCalendar(currentYear, currentMonth);
        };
    }

    //renderCalendar(currentYear, currentMonth);
});

async function loadDiaries(year, month) {
    try {
        const response = await apiFetch(`/diaries/monthly-summary?year=${year}&month=${month}`);
        monthlyDiaries = response.data.dates || []; 
        markDiariesOnCalendar(monthlyDiaries);
    } catch (error) {
        console.error("일기 로드 실패:", error);
    }
}

function renderCalendar(year, month) {
    const grid = document.getElementById('calendar-grid');
    const monthTitle = document.getElementById('calendar-month-title');
    const navTitle = document.getElementById('calendar-nav-title');


    if (!grid) return;

    const dateText = `${year}년 ${month}월`;

    if (monthTitle) monthTitle.innerText = dateText;
    if (navTitle) navTitle.innerText = dateText;


    grid.innerHTML = `
        <div class="calendar-day-name">일</div><div class="calendar-day-name">월</div>
        <div class="calendar-day-name">화</div><div class="calendar-day-name">수</div>
        <div class="calendar-day-name">목</div><div class="calendar-day-name">금</div>
        <div class="calendar-day-name">토</div>
    `;

    const firstDay = new Date(year, month - 1, 1).getDay();
    const lastDate = new Date(year, month, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyDiv = document.createElement('div');
        emptyDiv.className = 'calendar-date other-month';
        grid.appendChild(emptyDiv);
    }

    for (let i = 1; i <= lastDate; i++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dateDiv = document.createElement('div');
        dateDiv.className = 'calendar-date';
        dateDiv.setAttribute('data-date', dateStr);
        dateDiv.innerText = i;

        dateDiv.onclick = function() {
            document.querySelectorAll('.calendar-date').forEach(el => el.classList.remove('selected'));
            this.classList.add('selected');
            checkDateRecord(dateStr, i);
        };
        grid.appendChild(dateDiv);
    }
    
    loadDiaries(year, month);
}

function markDiariesOnCalendar(dates) {
    document.querySelectorAll('.record-dot').forEach(dot => dot.remove());
    document.querySelectorAll('.calendar-date').forEach(el => el.classList.remove('has-diary'));

    dates.forEach(item => {
        const targetEl = document.querySelector(`.calendar-date[data-date="${item.date}"]`);
        if (targetEl) {
            targetEl.classList.add('has-diary');
            const dot = document.createElement('div');
            dot.className = 'record-dot';
            targetEl.appendChild(dot);
        }
    });
}

function checkDateRecord(dateStr, day) {
    const emptyText = document.getElementById('summary-empty-text');
    const card = document.getElementById('summary-card');
    
    const dayData = monthlyDiaries.find(d => d.date === dateStr);

    if (dayData && dayData.diaries && dayData.diaries.length > 0) {
        const firstDiary = dayData.diaries[0];
        emptyText.style.display = 'none';
        card.style.display = 'flex';
        
        document.getElementById('summary-card-date').innerText = `${currentMonth}월 ${day}일`;
        document.getElementById('summary-card-content').innerText = firstDiary.title;
        
        card.onclick = () => fetchDiaryDetail(firstDiary.diaryId);
    } else {
        emptyText.style.display = 'block';
        emptyText.innerText = `${currentMonth}월 ${day}일에는 작성된 기록이 없어요.`;
        card.style.display = 'none';
    }
}

async function fetchDiaryDetail(diaryId) {
    try {
        const response = await apiFetch(`/diaries/${diaryId}`);
        const detail = response.data;

        window.currentDiaryDetail = detail;

        if (typeof openInDiaryTab === 'function') {
            openInDiaryTab('detail');
            const dateStr = new Date(detail.createdAt)
                .toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            document.querySelector('#diary-detail-view .sub-title').innerText = `${dateStr}의 기록`;
            
            // 이미지 분리 로직입니다
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = detail.content;

            const images = tempDiv.querySelectorAll('img');
            const photoSection = document.getElementById('detail-photo-section');
            const photoBox = document.querySelector('.detail-photo-box');

            if (images.length > 0) {
                photoBox.innerHTML = ''; 
                images.forEach(img => {
                    img.style.height = '140px';
                    img.style.width = 'auto';
                    img.style.borderRadius = '12px';
                    img.style.objectFit = 'cover';
                    img.style.flexShrink = '0';
                    img.style.boxShadow = '0 4px 10px rgba(0,0,0,0.05)';
                    img.style.margin = '0';
                    
                    photoBox.appendChild(img);
                });
                photoSection.style.display = 'block';
            } else {
                photoSection.style.display = 'none';
            }

            // -----------------------------------
            document.querySelector('.detail-diary-box').innerHTML = tempDiv.innerHTML;
            window.currentViewingDiaryId = diaryId;
        }
    } catch (error) {
        alert("상세 내용을 불러오지 못했습니다.");
    }
}

async function finishDiary() {
    const titleInput = document.getElementById('diary-title-input');
    const contentInput = document.getElementById('diary-input');
    const photoBox = document.getElementById('diary-write-photo-box'); 

    const title = titleInput.value.trim();
    let combinedContent = contentInput.innerHTML;

    if (!title || (!combinedContent.trim() && photoBox.children.length === 0)) { 
        alert('내용이나 사진을 입력해주세요!'); 
        return; 
    }

    // 🌟 1. 서버에 보내기 전에 "저장할까요?" 모달 띄우기
    if (typeof showConfirmModal === 'function') {
        showConfirmModal("일기를 저장할까요?", async () => {
            
            // '예'를 눌렀을 때만 아래의 진짜 저장 로직이 실행됩니다!
            
            // 사진함에 있는 사진들을 본문에 합치기
            const images = photoBox.querySelectorAll('img');
            images.forEach(img => {
                const cloneImg = img.cloneNode(true);
                cloneImg.style.maxWidth = "100%";
                cloneImg.style.height = "auto";
                cloneImg.style.borderRadius = "8px";
                cloneImg.removeAttribute('onclick'); 
                combinedContent += `<br>${cloneImg.outerHTML}`;
            });

            try {
                // 서버에 일기 저장 요청
                const response = await apiFetch('/diaries', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        title, 
                        content: combinedContent, 
                        photos: []
                    })
                });

                if (response.success) {
                    // 🌟 2. 저장이 완료되면 "저장되었습니다!" 성공 모달 띄우기
                    showSuccessModal("✨ 저장되었습니다!", 1500, () => {
                        // 모달이 닫히고 나서 화면 초기화 및 이동
                        titleInput.value = '';
                        contentInput.innerHTML = '';
                        photoBox.innerHTML = ''; 
                        
                        if (typeof openInRecordTab === 'function') openInRecordTab('default');
                        renderCalendar(currentYear, currentMonth);
                    });
                }
            } catch (error) {
                alert('저장 실패: ' + error.message);
            }
            
        });
    } else {
        alert('모달 함수를 찾을 수 없습니다.');
    }
}

function openEditView() {
    const detail = window.currentDiaryDetail;
    if (detail) {
        document.getElementById('diary-edit-title-input').value = detail.title || "";
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = detail.content || "";
        
        const images = tempDiv.querySelectorAll('img');
        const editPhotoSection = document.getElementById('diary-edit-photo-section');
        const editPhotoBox = document.querySelector('.edit-photo-box');
        editPhotoBox.innerHTML = ''; 
        
        if (images.length > 0) {
            images.forEach(img => {
                img.style.height = '100px'; 
                img.style.width = 'auto';
                img.style.borderRadius = '8px';
                img.style.objectFit = 'cover';
                img.style.flexShrink = '0';
                img.style.cursor = "pointer";
                img.onclick = () => {
                    const photoId = img.dataset.photoId; 
                    if (photoId && photoId !== 'undefined' && photoId !== 'null') {
                    deleteDiaryPhoto(photoId, img);
                    } else {
    // 투박한 기본 창 대신, 우리가 만든 예쁜 확인 모달 띄우기
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('이 사진을 지울까요? 🗑️', () => {
            img.remove(); // '예'를 눌렀을 때만 사진 삭제!

            if (typeof closeCustomModal === 'function') {
                closeCustomModal(); // 2. 🌟 [추가] 열려있는 모달창을 닫아줍니다!
            }
        });
    } else {
        // 혹시라도 모달 함수를 못 찾을 때를 대비한 안전장치
        if (confirm('이 사진을 지울까요?')) img.remove();
    }
}
};
                editPhotoBox.appendChild(img);
            });
            editPhotoSection.style.display = 'block';
        } else {
            editPhotoSection.style.display = 'none';
        }

        document.getElementById('diary-edit-input').innerHTML = tempDiv.innerHTML;
    }
    openInDiaryTab('edit');
}

async function updateDiary(diaryId) {
    const titleInput = document.getElementById('diary-edit-title-input');
    const contentInput = document.getElementById('diary-edit-input');
    const editPhotoBox = document.querySelector('.edit-photo-box');

    let finalContent = contentInput.innerHTML;

    if (editPhotoBox && editPhotoBox.children.length > 0) {
        const images = Array.from(editPhotoBox.children);
        images.forEach(img => {
            const clonedImg = img.cloneNode(true);
            
            clonedImg.removeAttribute('style');
            clonedImg.style.maxWidth = "100%";
            clonedImg.style.borderRadius = "8px";
            clonedImg.style.display = "block";
            clonedImg.style.margin = "10px 0";
            
            finalContent += '<br>' + clonedImg.outerHTML;
        });
    }

    try {
        const response = await apiFetch(`/diaries/${diaryId}`, {
            method: 'PATCH',
            body: JSON.stringify({
                title: titleInput.value.trim(),
                content: finalContent 
            })
        });

        if (response.success) {
    showSuccessModal('✨ 일기가 수정되었습니다.', 1500, () => {
        
        if (typeof loadDiaries === 'function') loadDiaries(currentYear, currentMonth);
        if (typeof fetchDiaryDetail === 'function') fetchDiaryDetail(diaryId);
        
    });

        }
    } catch (error) {
        alert('수정에 실패했습니다: ' + error.message);
    }
}

function submitEditDiary() {
    if (window.currentViewingDiaryId) {
        updateDiary(window.currentViewingDiaryId);
    }
}

async function deleteDiary(diaryId) {
    if (!confirm('정말 이 일기를 삭제하시겠습니까?')) return;

    try {
        const response = await apiFetch(`/diaries/${diaryId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            alert('일기가 삭제되었습니다.');
            if (typeof openInDiaryTab === 'function') openInDiaryTab('main');
            renderCalendar(currentYear, currentMonth);
        }
    } catch (error) {
        alert('삭제에 실패했습니다: ' + error.message);
    }
}

function deleteDiaryPhoto(diaryPhotoId, imgElement) {
    
    showConfirmModal('이 사진을 정말 삭제하시겠습니까? 🗑️', async () => {
        
        try {
            const response = await apiFetch(`/diaries/photos/${diaryPhotoId}`, {
                method: 'DELETE'
            });

            if (response.success) {
                showSuccessModal('✨ 사진이 성공적으로 삭제되었습니다.', 1500, () => {
                    if (imgElement) imgElement.remove();
                });
            }
        } catch (error) {
            showSuccessModal('❌ 사진 삭제에 실패했습니다.', 2000);
            console.error('사진 삭제 에러:', error);
        }
        
    });
}

async function insertDiaryPhoto(inputElement) {
    if (inputElement.files && inputElement.files[0]) {
        const file = inputElement.files[0];
        const formData = new FormData();
        
        formData.append('file', file); 

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('https://voda-backend.p-e.kr/common/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) throw new Error('사진 업로드 실패');
            
            const result = await response.json();
            const imageUrl = result.data.url; 

            const img = document.createElement('img');
            img.src = imageUrl;
            img.dataset.photoId = result.data.photoId; 
            img.style.height = "100px";
            img.style.width = "auto";
            img.style.borderRadius = "8px";
            img.style.objectFit = "cover";
            img.style.flexShrink = "0";
            img.style.cursor = "pointer";
            img.onclick = () => {
                const pid = img.dataset.photoId;
                if (pid && pid !== 'undefined' && pid !== 'null') {
                    deleteDiaryPhoto(pid, img);
                } else {
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('이 사진을 지울까요? 🗑️', () => {
            img.remove();

            if (typeof closeCustomModal === 'function') {
                closeCustomModal(); // 2. 🌟 [추가] 열려있는 모달창을 닫아줍니다!
            }
        });
    } else {
        if (confirm('이 사진을 지울까요?')) {
            img.remove();
        }
    }
}
};

            const photoBox = document.getElementById('diary-write-photo-box');
            photoBox.appendChild(img);
            
        } catch (error) {
            alert("사진 업로드 중 오류가 발생했습니다: " + error.message);
        }
        
        inputElement.value = ''; 
    }
}

async function insertEditDiaryPhoto(inputElement) {
    if (inputElement.files && inputElement.files[0]) {
        const file = inputElement.files[0];
        const formData = new FormData();
        formData.append('file', file); 

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch('https://voda-backend.p-e.kr/common/upload', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) throw new Error('사진 업로드 실패');
            const result = await response.json();
            
            const imageUrl = result.data.url; 
            const photoId = result.data.photoId; 
            const img = document.createElement('img');
            img.src = imageUrl;
            img.dataset.photoId = photoId; 
            img.style.height = '100px'; 
            img.style.width = 'auto';
            img.style.borderRadius = '8px';
            img.style.objectFit = 'cover';
            img.style.flexShrink = '0';
            img.style.cursor = "pointer";

            img.onclick = () => {
                if (img.dataset.photoId) {
                    deleteDiaryPhoto(img.dataset.photoId, img);
                } else {
                    showConfirmModal('이 사진을 지울까요? 🗑️', () => {
                        img.remove(); 

                        if (typeof closeCustomModal === 'function') {
                closeCustomModal(); // 2. 🌟 [추가] 열려있는 모달창을 닫아줍니다!
            }
                    });
                }
            };

            const editPhotoSection = document.getElementById('diary-edit-photo-section');
            const editPhotoBox = document.querySelector('.edit-photo-box');
            
            editPhotoBox.appendChild(img);
            editPhotoSection.style.display = 'block'; 

        } catch (error) {
            showSuccessModal("❌ 사진 업로드 중 오류가 발생했습니다.", 2000);
            console.error("사진 업로드 에러:", error);
        }
        
        inputElement.value = ''; 
    }
}
function handleTextSelection() {
    const diaryInputEl = document.getElementById('diary-input');
    const aiTooltip = document.getElementById('ai-polish-tooltip');

    setTimeout(() => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
            aiTooltip.style.display = 'none';
            return;
        }

        const text = selection.toString().trim();
        if (text.length > 0 && diaryInputEl.contains(selection.anchorNode)) {
            selectedRange = selection.getRangeAt(0).cloneRange();
            
            const rect = selectedRange.getBoundingClientRect();
            
            aiTooltip.style.left = (rect.left + rect.width / 2) + 'px';
            aiTooltip.style.top = (rect.top + window.scrollY - 3) + 'px';
            aiTooltip.style.display = 'flex';
        } else {
            aiTooltip.style.display = 'none';
        }
    }, 50);
}

async function polishSelectedText() {
    if (!selectedRange) return;
    
    const diaryInputEl = document.getElementById('diary-input');
    const aiTooltip = document.getElementById('ai-polish-tooltip');
    const originalText = selectedRange.toString();
    
    aiTooltip.style.display = 'none'; 
    
    if (typeof showLoadingModal === 'function') {
        showLoadingModal("✨ 문장을 예쁘게 다듬고 있어요...", null, null);
    }
    
    // 임시 교정 로직 (나중에 API 연결)
    setTimeout(() => {
        const polishedText = `✨ ${originalText} (교정됨)`; 
        
        if (typeof closeCustomModal === 'function') closeCustomModal();
        
        selectedRange.deleteContents();
        const newNode = document.createTextNode(polishedText);
        selectedRange.insertNode(newNode);
        
        window.getSelection().removeAllRanges();
        selectedRange = null; 
        
        diaryInputEl.focus();
        
    }, 1200);
}

async function addKeywords(diaryId, keywords) {
    if (keywords.length < 1) {
        alert('키워드는 최소 1개 이상 입력해주세요.');
        return;
    }

    try {
        const response = await apiFetch(`/diaries/${diaryId}/keywords`, {
            method: 'POST',
            body: JSON.stringify({ keywords })
        });

        if (response.success) {
            return response.data.keywords;
        }
    } catch (error) {
        alert('키워드 저장에 실패했습니다: ' + error.message);
    }
}