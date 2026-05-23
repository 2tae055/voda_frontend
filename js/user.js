// js/user.js

async function loadMyProfile() {

    try {
        const response = await apiFetch('/users/me');
        console.log(response);

        const user = response.data.profile;
        const stats = response.data.stats;

        const streakNum = document.getElementById('streak-num');
        if (streakNum) {
            streakNum.innerText = stats.streak;
        }

        const streakText = document.getElementById('streak-text');
        if (streakText) {
            streakText.innerText = `${stats.streak}일 연속 작성`;
        } 

        const blobImageEl = document.querySelector('.visual-blob .blob-image');
        if (blobImageEl) {
            const streakDays = stats.streak || 0; 

            if (streakDays === 0) {
                // 0일 차 이미지
                blobImageEl.src = 'boda15.png'; 
            } else {
                // 1일 이상 연속 달성 이미지
                blobImageEl.src = 'boda12.png'; 
            }
        }

        const profileName = 
            document.querySelector('.profile-name');
        if (profileName) {
            profileName.innerText = 
                `${user.nickname}님`;
        }
        // 이메일
        const profileEmail = 
            document.querySelector('.profile-email');
        if (profileEmail) {
            profileEmail.innerText = 
                user.email;
        }
        // 홈 인사말
        const greeting = 
            document.querySelector('.greeting h1');
        if (greeting) {
            greeting.innerText = 
                `안녕하세요, ${user.nickname}님!`;
        }
        // 통계
        const statNumbers = 
            document.querySelectorAll('.stat-number');
        if (statNumbers[0]) {
            statNumbers[0].innerHTML = 
                `${stats.total_diaries}<span class="stat-unit">장</span>`;
        }
        if (statNumbers[1]) {
            statNumbers[1].innerHTML = 
                `${stats.streak}<span class="stat-unit">일</span>`;
        }

    } catch (error) {
        console.error(
            '유저 정보 로드 실패:', 
            error
        );
    }
}

window.loadMyProfile = 
    loadMyProfile;