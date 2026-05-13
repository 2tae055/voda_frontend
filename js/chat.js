async function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const userText = chatInput.value.trim();

    if (!userText) return;

    appendMessage('user', userText);
    chatInput.value = '';

    try {
        const response = await sendChatMessageToServer(userText);
        
        const aiReply = response.reply;

        appendMessage('ai', aiReply);

        if (typeof speak === 'function') {
            speak(aiReply);
        }

    } catch (error) {
        console.error("AI 채팅 오류:", error);
        appendMessage('ai', "죄송해요, 서버와 연결할 수 없어요. 잠시 후 다시 시도해주세요.");
    }
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