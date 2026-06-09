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
    const container = document.querySelector('.summary-container');
    
    document.querySelectorAll('.dynamic-summary-card').forEach(el => el.remove());
    
    const staticCard = document.getElementById('summary-card');
    if (staticCard) staticCard.style.display = 'none';

    const dayData = monthlyDiaries.find(d => d.date === dateStr);

    if (dayData && dayData.diaries && dayData.diaries.length > 0) {
        emptyText.style.display = 'none'; 
        
        dayData.diaries.forEach(diary => {
            const card = document.createElement('div');
            card.className = 'summary-card dynamic-summary-card'; 
            card.style.display = 'flex';
            card.style.flexDirection = 'column';
            card.style.marginTop = '10px'; 
            card.style.cursor = 'pointer';
            
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div class="summary-date">${currentMonth}월 ${day}일</div>
                    <span class="material-symbols-rounded" style="font-size:18px; color:var(--text-gray);">chevron_right</span>
                </div>
                <div class="summary-content" style="margin-top: 8px;">${diary.title || '제목 없는 일기'}</div>
            `;
            
            card.onclick = () => fetchDiaryDetail(diary.diaryId);
            
            container.appendChild(card);
        });
        
    } else {
        emptyText.style.display = 'block';
        emptyText.innerText = `${currentMonth}월 ${day}일에는 작성된 기록이 없어요.`;
    }
}

async function fetchDiaryDetail(diaryId) {
    try {
        const response = await apiFetch(`/diaries/${diaryId}`);
        const diary = response.data;

        window.currentDiaryDetail = diary;
        window.currentViewingDiaryId = diaryId;

        openInDiaryTab('detail'); 
        
        const dateStr = new Date(diary.createdAt).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
        document.querySelector('#diary-detail-view .sub-title').innerText = `${dateStr}의 기록`;

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = diary.content || '';

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

       
const diaryBox = document.querySelector('.detail-diary-box');
if (diaryBox) {
    diaryBox.innerHTML = `
        <div style="font-size: 12px; color: var(--primary-orange); font-weight: 700; margin-bottom: 12px;">
            ${new Date(diary.createdAt).toLocaleDateString('ko-KR')}
        </div>

        <div style="font-size: 18px; font-weight: 700; color: var(--text-dark); margin-bottom: 12px;">
            ${diary.title || '제목 없는 일기'}
        </div>

        <div style="font-size: 15px; line-height: 1.6; color: var(--text-dark);">
            ${tempDiv.innerHTML}
        </div>
    `;
}

        const conversationSection = document.getElementById('detail-conversation-section');
        const conversationBox = document.getElementById('detail-conversation-box');
        
        if (conversationSection && conversationBox) {
            if (diary.inputType === 'CHAT' || diary.inputType === 'CALL') {
                conversationSection.style.display = 'block'; 
                conversationBox.innerHTML = `<div style="text-align:center; color:#999; font-size:13px; padding: 20px 0;">대화 내역을 불러오는 중...</div>`;

                let historyApiUrl = diary.inputType === 'CHAT' 
                    ? `/chat-rooms/${diary.inputId}` 
                    : `/call-rooms/${diary.inputId}`;

                try {
                    const historyRes = await apiFetch(historyApiUrl);
                    
                    if (historyRes.success && historyRes.data) {
                        conversationBox.innerHTML = ''; 
                        
                        const messages = historyRes.data.chatMessages || historyRes.data.callMessages || historyRes.data.callTexts || historyRes.data.messages || historyRes.data;
                        
                        if (messages && messages.length > 0) {
                            messages.forEach(msg => {
                                let text = msg.textContent || msg.content || msg.message || msg.text || '';
                                
                                let isMe = msg.sender === 'USER' || msg.role === 'USER';
                                if (text.toUpperCase().startsWith('USER:')) isMe = true;

                                if (text.includes('ai_answer')) {
                                    try {
                                        const parsed = JSON.parse(text.substring(text.indexOf('{')));
                                        text = parsed.ai_answer || text;
                                    } catch(e) {}
                                }
                                text = text.replace(/^USER:\s*/i, '').replace(/^AI:\s*/i, '');

                                const bubbleClass = isMe ? 'bubble-user' : 'bubble-ai';
                                
                                conversationBox.innerHTML += `
                                    <div class="chat-bubble ${bubbleClass}" style="max-width: 85%; ${isMe ? 'align-self: flex-end; background: var(--primary-orange); color: white;' : 'align-self: flex-start; background: #EFEFEF; color: black;'} padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.4;">
                                        ${text}
                                    </div>
                                `;
                            });
                        } else {
                            conversationBox.innerHTML = `<div style="text-align:center; color:#999; font-size:13px; padding: 20px 0;">저장된 대화 내역이 없습니다.</div>`;
                        }
                    } else {
                         conversationBox.innerHTML = `<div style="text-align:center; color:red; font-size:13px; padding: 20px 0;">대화 내역을 불러오는데 실패했습니다.</div>`;
                    }
                } catch (err) {
                    conversationBox.innerHTML = `<div style="text-align:center; color:red; font-size:13px; padding: 20px 0;">통신 에러가 발생했습니다.</div>`;
                }
            } else {
                conversationSection.style.display = 'none';
            }
        }
    } catch (error) {
        console.error(error);
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

    if (typeof showConfirmModal === 'function') {
        showConfirmModal("일기를 저장할까요?", async () => {

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
                const response = await apiFetch('/diaries', {
                    method: 'POST',
                    body: JSON.stringify({ 
                        title, 
                        content: combinedContent, 
                        photos: []
                    })
                });

                if (response.success) {
                    renderCalendar(currentYear, currentMonth);
                    
                    if (typeof loadMyProfile === 'function') {
                        loadMyProfile(); 
                    }

                    showSuccessModal("✨ 저장되었습니다!", 1500, () => {
                        titleInput.value = '';
                        contentInput.innerHTML = '';
                        photoBox.innerHTML = ''; 
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
    if (typeof showConfirmModal === 'function') {
        showConfirmModal('이 사진을 지울까요? 🗑️', () => {
            img.remove(); 

            if (typeof closeCustomModal === 'function') {
                closeCustomModal(); 
            }
        });
    } else {
      
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
                closeCustomModal(); 
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
                closeCustomModal(); 
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

async function predictDiary(requestData) {
    return await apiFetch('/diaries/predict', {
        method: 'POST',
        body: JSON.stringify(requestData) 
    });
}

async function voicePredictDiary(requestData) {
    return await apiFetch('/diaries/voice-predict', {
        method: 'POST',
        body: JSON.stringify(requestData) 
    });
}

async function loadAndShowChatDiary(roomId) {
    try {
        const response = await apiFetch(`/chat-rooms/${roomId}`);
        
        if (response.success) {
            const messages = response.data.chatMessages;
            
            if (typeof openInDiaryTab === 'function') openInDiaryTab('detail');
            
            const dateStr = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });
            document.querySelector('#diary-detail-view .sub-title').innerText = `${dateStr}의 대화 기록`;
            document.getElementById('detail-photo-section').style.display = 'none';
            
            const diaryBox = document.querySelector('.detail-diary-box');
            if (diaryBox) {
                diaryBox.innerHTML = '<div style="color:#999; font-size:14px; padding: 20px 0;">작성된 일기가 없습니다.</div>';
            }
            
            let chatHtml = '<div style="display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #fdfbf7; border-radius: 16px;">';
            
            if (!messages || messages.length === 0) {
                chatHtml += '<div style="text-align:center; padding:20px; color:#999;">대화 내역이 없습니다.</div>';
            } else {
                messages.forEach(msg => {
                    let text = msg.textContent;

                    if (text.includes('ai_answer')) {
                        try {
                            const jsonStartIndex = text.indexOf('{');
                            const jsonString = text.substring(jsonStartIndex);
                            const parsed = JSON.parse(jsonString);
                            text = parsed.ai_answer || text;
                        } catch (e) {}
                    }

                    text = text.replace(/^USER:\s*/i, '');
                    text = text.replace(/^AI:\s*/i, '');

                    const timeStr = new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
                    
                    chatHtml += `
                        <div style="padding: 14px; background: white; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.02); border: 1px solid #f0ede9;">
                            <p style="margin: 0; font-size: 15px; color: #333; line-height: 1.5; font-family:'Pretendard';">${text}</p>
                            <small style="color: #bbb; font-size: 11px; display: block; margin-top: 6px; text-align: right;">${timeStr}</small>
                        </div>
                    `;
                });
            }
            chatHtml += '</div>';
            
            const chatBox = document.querySelector('.detail-chat-box');
            if (chatBox) {
                chatBox.innerHTML = chatHtml;
            }
        }
    } catch (error) {
        console.error("대화 내역 렌더링 에러:", error);
    }
}

window.deleteDiary = deleteDiary;
window.openEditView = openEditView;
window.loadAndShowChatDiary = loadAndShowChatDiary;
window.predictDiary = predictDiary;
window.voicePredictDiary = voicePredictDiary;