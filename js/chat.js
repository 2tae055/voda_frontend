// js/chat.js

const socket = io('https://voda-backend.p-e.kr', {
    transports: ['websocket'] 
}); 

let currentChatRoomId = null;
let currentConversationType = 'chat'; 

window.socket = socket;

socket.on('conversation:started', (data) => {
    currentChatRoomId = data.roomId;
    currentConversationType = data.type; 
    window.currentChatRoomId = currentChatRoomId;
    
    if (typeof closeCustomModal === 'function') closeCustomModal();
    
    const messageArea = document.getElementById('chat-messages');
    if (messageArea && currentConversationType === 'chat') {
        messageArea.innerHTML = `
            <div class="chat-bubble bubble-ai">
                안녕하세요! 오늘 하루는 어떠셨나요? 😊
            </div>
        `;
    }
    
    if (typeof openInRecordTab === 'function') openInRecordTab(currentConversationType); 
});

socket.on('conversation:reply', (data) => {
    console.log("✅ [소켓 수신] AI 답장 도착! 데이터:", data);

    let aiMessage = "";

    if (data.message && typeof data.message === 'string' && data.message.includes('ai_answer')) {
        try {
            const parsedData = JSON.parse(data.message);
            aiMessage = parsedData.ai_answer; 
        } catch (e) {
            aiMessage = data.message;
        }
    } 
    else if (data.ai_answer) {
        aiMessage = data.ai_answer;
    } 
    else {
        aiMessage = data.message;
    }

    if (aiMessage) {
        if (currentConversationType === 'chat') {
            appendMessage('ai', aiMessage);
        } 
        else if (currentConversationType === 'call') {
            if (typeof window.appendCallMessage === 'function') {
                window.appendCallMessage(aiMessage, 'ai');
            }
            if (typeof window.speakText === 'function') {
                window.speakText(aiMessage); 
            }
        }
    }
});

socket.on('conversation:ended', async (data) => {
    console.log("✅ [소켓 수신] 대화 종료! API로 일기 생성 요청 시작... 데이터:", data);
    
    try {
        if (typeof showLoadingModal === 'function') {
            showLoadingModal("✨ AI가 대화를 바탕으로<br>일기를 작성하고 있어요...", 0);
        }

        const response = await apiFetch('/diaries/conversation', {
            method: 'POST',
            body: JSON.stringify({ 
                roomId: data.roomId, 
                conversationType: currentConversationType 
            })
        });

        if (typeof closeCustomModal === 'function') closeCustomModal();

        if (response.success) {
            if (typeof window.renderCalendar === 'function') {
                const now = new Date();
                window.renderCalendar(now.getFullYear(), now.getMonth() + 1);
            }
            
            if (typeof window.loadMyProfile === 'function') {
                window.loadMyProfile();
            }

            if (typeof showSuccessModal === 'function') {
                showSuccessModal('✨ 대화가 일기로 예쁘게 저장되었습니다!', 1500, () => {
                    const chatInput = document.getElementById('chat-input');
                    if (chatInput) chatInput.value = ''; 

                    if (typeof openInRecordTab === 'function') openInRecordTab('default');
                });
            }
        } else {
            alert("일기 생성에 실패했습니다: " + (response.message || "알 수 없는 오류"));
        }
        
    } catch (error) {
        console.error("❌ 일기 변환 API 에러:", error);
        if (typeof closeCustomModal === 'function') closeCustomModal();
        alert("일기를 생성하는 중 오류가 발생했습니다.");
    }
});

function startChatDiary(type = 'chat') {
    if (typeof showLoadingModal === 'function') showLoadingModal("⏳ 준비하고 있어요...", 0);
    
    socket.emit('conversation:start', { type: type });
}

function sendMessage() {
    if (!currentChatRoomId) return alert("방이 없습니다.");

    const chatInput = document.getElementById('chat-input');
    const userText = chatInput.value.trim();
    if (!userText) return;

    appendMessage('user', userText);
    chatInput.value = ''; 

    socket.emit('conversation:message', {
        type: currentConversationType,
        roomId: currentChatRoomId,
        message: userText
    });
}

function appendMessage(sender, text) {
    const messageArea = document.getElementById('chat-messages');
    if (!messageArea) return;

    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bubble-${sender}`;
    bubble.innerText = text;

    messageArea.appendChild(bubble);
    messageArea.scrollTop = messageArea.scrollHeight; 
}

function handleEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        sendMessage();
    }
}

function endChatDiary() {
    console.log("버튼 눌림! 현재 방 번호:", currentChatRoomId);

    if (!currentChatRoomId) {
        return alert("현재 진행 중인 대화가 없습니다.");
    }

    console.log("🚀 [소켓 발신] 대화 종료 요청!");
    socket.emit('conversation:end', {
        roomId: currentChatRoomId
    });

    try {
        if (typeof showLoadingModal === 'function') {
            showLoadingModal("⏳ 일기를 정리하고 있어요...<br>잠시만 기다려주세요.", 0);
        }
    } catch (e) {
        console.error("로딩창 띄우다가 에러 발생:", e);
    }
}


window.startChatDiary = startChatDiary;
window.sendMessage = sendMessage;
window.handleEnter = handleEnter; 
window.endChatDiary = endChatDiary; 