// js/api-local.js

// 기존 apiFetch와 이름이 같아야 교체가 쉽습니다.
async function apiFetch(endpoint, options = {}) {
    return new Promise((resolve) => {
        // 실제 서버 통신처럼 약간의 지연 시간을 줍니다 (0.3초)
        setTimeout(() => {
            const method = options.method || 'GET';
            
            // --- 일기(Diaries) 로직 ---
            if (endpoint.includes('/diaries')) {
                let items = JSON.parse(localStorage.getItem('boda_diaries') || '[]');
                if (method === 'POST') {
                    const data = JSON.parse(options.body);
                    const newItem = { ...data, id: Date.now() };
                    items.push(newItem);
                    localStorage.setItem('boda_diaries', JSON.stringify(items));
                    resolve(newItem);
                } else {
                    resolve(items);
                }
            }
            
            // --- 할 일(Todos) 로직 ---
            else if (endpoint.includes('/todos')) {
                let items = JSON.parse(localStorage.getItem('boda_todos') || '[]');
                if (method === 'POST') {
                    const data = JSON.parse(options.body);
                    const newItem = { ...data, id: Date.now() };
                    items.push(newItem);
                    localStorage.setItem('boda_todos', JSON.stringify(items));
                    resolve(newItem);
                } else {
                    resolve(items);
                }
            }

            // api-local.js 내부의 apiFetch 함수 조건문 안에 추가
            else if (endpoint.includes('/todos')) {
                let items = JSON.parse(localStorage.getItem('boda_todos') || '[]');
                
                if (method === 'POST') {
                    const data = JSON.parse(options.body);
                    const newItem = { 
                        ...data, 
                        id: Date.now(), // 고유 ID 생성
                        createdAt: new Date().toISOString() 
                    };
                    items.push(newItem);
                    localStorage.setItem('boda_todos', JSON.stringify(items));
                    resolve(newItem);
                } 
                else if (method === 'GET') {
                    resolve(items);
                }
            }
            else if (endpoint.includes('/chat')) {
                if (method === 'POST') {
                    const userData = JSON.parse(options.body);
                    const msg = userData.message; // 사용자가 보낸 메시지
                    let reply = "";

                    // 키워드 기반 조건부 답변 (간이 AI 로직)
                    if (msg.includes("안녕")) {
                        reply = "안녕하세요! 오늘 하루는 어떠셨나요? 제가 곁에서 도와드릴게요.";
                    } else if (msg.includes("일기") || msg.includes("기록")) {
                        reply = "오늘의 소중한 순간을 일기로 남겨보세요. 달력에 주황색 점이 찍히면 뿌듯할 거예요!";
                    } else if (msg.includes("할 일") || msg.includes("투두") || msg.includes("계획")) {
                        reply = "할 일을 잊지 않도록 제가 챙겨드릴게요. 루틴별로 정리해 보시는 건 어떨까요?";
                    } else if (msg.includes("고마워") || msg.includes("감사")) {
                        reply = "도움이 되어 기뻐요! 언제든 궁금한 게 있으면 말씀해 주세요.";
                    } else if (msg.includes("배고파") || msg.includes("음식")) {
                        reply = "맛있는 걸 먹으면 기분이 좋아지죠! 오늘 저녁은 좋아하는 음식을 드시는 게 어때요?";
                    } else {
                        // 특별한 키워드가 없을 때 나가는 기본 답변
                        reply = `'${msg}'라고 말씀하셨군요! 더 자세히 이야기해주시면 제가 더 잘 도와드릴 수 있어요.`;
                    }

                    resolve({
                        reply: reply,
                        timestamp: new Date().toISOString()
                    });
                }
            }            
        }, 300);
    });
}

