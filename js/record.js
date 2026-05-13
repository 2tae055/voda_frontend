const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
let callRecognition;
let isMicRecording = false;
let isCalling = false;
let callTimerInterval;
let callSeconds = 0;

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
            console.log("음성 인식 재시작...");
            recognition.start();
        }
    };

    recognition.onerror = (event) => {
        console.error("음성 인식 오류:", event.error);
        stopMicRecord();
    };
}

function startMicRecord() {
    if (!recognition) {
        alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
        return;
    }
    if (isMicRecording) return;

    isMicRecording = true;
    document.getElementById('mic-status-text').innerText = "듣고 있어요... 말씀해 주세요.";
    recognition.start();
}

function stopMicRecord() {
    if (recognition && isMicRecording) {
        recognition.stop();
        isMicRecording = false;
        document.getElementById('mic-status-text').innerText = "마이크가 꺼졌습니다.";
    }
}

function startCall() {
    if (isCalling) return;
    if (!SpeechRecognition) {
        alert("음성 인식을 지원하지 않는 브라우저입니다.");
        return;
    }

    isCalling = true;
    callSeconds = 0;
    
    document.getElementById('call-timer').innerText = '00:00';
    document.getElementById('call-messages').innerHTML = '<div class="chat-bubble bubble-ai">안녕하세요! 오늘 하루는 어떠셨나요? 😊</div>';
    
    callTimerInterval = setInterval(() => {
        callSeconds++;
        const mins = String(Math.floor(callSeconds / 60)).padStart(2, '0');
        const secs = String(callSeconds % 60).padStart(2, '0');
        document.getElementById('call-timer').innerText = `${mins}:${secs}`;
    }, 1000);

    callRecognition = new SpeechRecognition();
    callRecognition.lang = 'ko-KR';
    
    callRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        appendCallMessage(transcript, "user");
        
        // AI 응답 시뮬레이션 (백엔드 연결 전)
        document.getElementById('call-mic-text').innerText = "AI가 생각 중...";
        setTimeout(() => {
            if (!isCalling) return;
            const response = "정말 멋진 하루를 보내셨네요! 더 자세히 들려주세요.";
            appendCallMessage(response, "ai");
            speakText(response, () => {
                if (isCalling) {
                    document.getElementById('call-mic-text').innerText = "듣고 있어요...";
                    callRecognition.start();
                }
            });
        }, 1500);
    };

    speakText("안녕하세요! 통화가 연결되었습니다. 편하게 말씀해 주세요.", () => {
        if (isCalling) {
            document.getElementById('call-mic-text').innerText = "듣고 있어요...";
            callRecognition.start();
        }
    });
}

function stopCall() {
    isCalling = false;
    clearInterval(callTimerInterval);
    if (callRecognition) callRecognition.abort();
    window.speechSynthesis.cancel();
    document.getElementById('call-mic-text').innerText = "통화 종료";
}

function appendCallMessage(text, sender) {
    const container = document.getElementById('call-messages');
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble bubble-${sender}`;
    bubble.innerText = text;
    container.appendChild(bubble);
    container.scrollTop = container.scrollHeight;
}

function speakText(text, callback) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ko-KR';
    utterance.onend = () => { if (callback) callback(); };
    window.speechSynthesis.speak(utterance);
}