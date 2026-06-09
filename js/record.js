const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let callRecognition;
let isMicRecording = false;
let isCalling = false;
let callTimerInterval;
let callSeconds = 0;
let mediaRecorder;
let audioChunks = [];

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR';

    recognition.onresult = (event) => {
        let interim_transcript = '';
        
        const isMicView = document.getElementById('mic-record-view').style.display !== 'none';
        const micStatus = isMicView 
            ? document.getElementById('mic-status-text') 
            : document.getElementById('call-mic-text');
        
        const messageArea = isMicView 
            ? document.getElementById('mic-messages') 
            : document.getElementById('call-messages');

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            const result = event.results[i];
            const transcript = result[0].transcript;

            if (result.isFinal) {
                if (isMicView) {
                    const bubble = document.createElement('div');
                    bubble.className = 'chat-bubble bubble-user';
                    bubble.innerText = transcript;
                    messageArea.appendChild(bubble);
                }
                if (micStatus) micStatus.innerText = "기록 완료!";
            } else {
                interim_transcript += transcript;
                if (micStatus) {
                    micStatus.innerText = `인식 중: ${interim_transcript}`;
                }
            }
        }
        if (messageArea) messageArea.scrollTop = messageArea.scrollHeight;
    };

    recognition.onend = () => {
        if (isMicRecording) {
            try { recognition.start(); } catch(e) {}
        }
    };

    recognition.onerror = (event) => {
        if (event.error !== 'aborted') {
            console.error("음성 인식 오류:", event.error);
        }
    };
}

async function startMicRecord() {
    if (isMicRecording) return;

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunks.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' }); 
            await sendVoiceDiaryAPI(audioBlob);
        };

        mediaRecorder.start();
        isMicRecording = true;
        document.getElementById('mic-status-text').innerText = "듣고 있어요... 말씀해 주세요.";

        if (recognition) {
            try { recognition.start(); } catch(e) {}
        }

    } catch (err) {
        alert("마이크 권한을 허용해 주세요!");
        console.error("마이크 접근 에러:", err);
    }
}

function stopMicRecord() {
    if (!isMicRecording) return;
    isMicRecording = false;

    document.getElementById('mic-status-text').innerText = "마이크가 꺼졌습니다.";

    if (recognition) recognition.stop();
    
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop(); 
    }
}

async function sendVoiceDiaryAPI(audioBlob) {
    if (typeof showLoadingModal === 'function') {
        showLoadingModal("✨ AI가 음성을 분석해서<br>일기를 작성하고 있어요...", 0);
    }

    try {
        const formData = new FormData();
        
        formData.append('file', audioBlob, 'voice_record.webm');

        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        formData.append('targetDate', `${year}-${month}-${day}`);

        const token = localStorage.getItem('accessToken');
        
        const response = await fetch('https://voda-backend.p-e.kr/diaries/voice-predict', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: formData
        });

        const result = await response.json();

        if (typeof closeCustomModal === 'function') closeCustomModal();

        if (result.success) {
            // 1. 달력 갱신
            if (typeof window.renderCalendar === 'function') {
                const now = new Date();
                window.renderCalendar(now.getFullYear(), now.getMonth() + 1);
            }
            
            // 🌟 2. 유저 정보 다시 불러오기
            if (typeof window.loadMyProfile === 'function') {
                window.loadMyProfile();
            }

            if (typeof showSuccessModal === 'function') {
                showSuccessModal("✨ 음성 일기가 예쁘게 저장되었습니다!", 1500, () => {
                    document.getElementById('mic-status-text').innerText = "기록이 완료되었습니다.";

                    if (typeof openInRecordTab === 'function') openInRecordTab('default');
                });
            }
        } else {
            alert("일기 생성 실패: " + (result.message || "알 수 없는 오류"));
        }
    } catch (error) {
        console.error("음성 일기 전송 에러:", error);
        if (typeof closeCustomModal === 'function') closeCustomModal();
        alert("음성 일기 전송 중 오류가 발생했습니다.");
    }
}


function startCall() {
    if (isCalling) return;
    if (!SpeechRecognition) {
        alert("음성 인식을 지원하지 않는 브라우저입니다.");
        return;
    }

    if (typeof window.startChatDiary === 'function') {
        window.startChatDiary('call');
    }

    isCalling = true;
    callSeconds = 0;
    
    document.getElementById('call-timer').innerText = '00:00';
    document.getElementById('call-messages').innerHTML = ''; 
    
    callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const secs = String(callSeconds % 60).padStart(2, '0');
        document.getElementById('call-timer').innerText = `${mins}:${secs}`;
    }, 1000);

    callRecognition = new SpeechRecognition();
    callRecognition.lang = 'ko-KR';
    
    callRecognition.onerror = (event) => {
        if (event.error === 'aborted') {
            console.log("🎙️ 마이크가 정상적으로 종료되었습니다.");
            return;
        }
        console.error("🎙️ 통화 마이크 에러 발생:", event.error);
        if (event.error === 'not-allowed') {
            alert("브라우저 설정에서 마이크 권한을 허용해 주세요!");
        }
    };

    callRecognition.onend = () => {
        const currentStatus = document.getElementById('call-mic-text').innerText;
        if (isCalling && currentStatus === "듣고 있어요...") {
            try { callRecognition.start(); } catch(e) {}
        }
    };
    
    callRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        
        appendCallMessage(transcript, "user");
        document.getElementById('call-mic-text').innerText = "AI가 생각 중...";
        
        if (window.socket && window.currentChatRoomId) {
            window.socket.emit('conversation:message', {
                type: 'call',
                roomId: window.currentChatRoomId,
                message: transcript
            });
        }
    };

    speakText("안녕하세요! 통화가 연결되었습니다. 편하게 말씀해 주세요.", () => {
        if (isCalling) {
            document.getElementById('call-mic-text').innerText = "듣고 있어요...";
            try { callRecognition.start(); } catch(e) {}
        }
    });
}

function stopCall() {
    isCalling = false;
    clearInterval(callTimerInterval);
    if (callRecognition) callRecognition.abort();
    window.speechSynthesis.cancel();
    document.getElementById('call-mic-text').innerText = "통화 종료";
    
    if (typeof window.endChatDiary === 'function') {
        window.endChatDiary();
    }
}

function appendCallMessage(text, sender) {
    const container = document.getElementById('call-messages');
    if (!container) return;
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bubble-${sender}`;
    bubble.innerText = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

let currentAudio = null; 

async function speakText(text, callback) {
    window.speechSynthesis.cancel();
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    try {
        const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok || !data.audioContent) {
            throw new Error("TTS 변환 실패");
        }

        const audioSrc = 'data:audio/mp3;base64,' + data.audioContent;
        currentAudio = new Audio(audioSrc);

        currentAudio.onended = () => {
            if (callback) callback();
            
            if (isCalling && callRecognition) {
                document.getElementById('call-mic-text').innerText = "듣고 있어요...";
                try {
                    callRecognition.start();
                } catch(e) {}
            }
        };

        currentAudio.play();

    } catch (error) {
        console.error("구글 TTS 에러, 기본 목소리로 대체합니다:", error);
        fallbackSpeakText(text, callback); 
    }
}

function fallbackSpeakText(text, callback) {
    window.speechSynthesis.cancel(); 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    
    utterance.onend = () => {
        if (callback) callback();
        if (isCalling && callRecognition) {
            document.getElementById('call-mic-text').innerText = "듣고 있어요...";
            try { callRecognition.start(); } catch(e) {}
        }
    };
    
    setTimeout(() => { window.speechSynthesis.speak(utterance); }, 100);
}

window.appendCallMessage = appendCallMessage;
window.speakText = speakText;
window.startMicRecord = startMicRecord;
window.stopMicRecord = stopMicRecord;