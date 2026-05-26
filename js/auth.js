function openEmailLogin() {

    const emailScreen =
        document.getElementById('email-login-screen');

    toggleEmailForm('login');

    emailScreen.style.display = 'flex';

    setTimeout(() => {
        emailScreen.style.opacity = '1';
    }, 10);
}

function closeEmailLogin() {

    const emailScreen =
        document.getElementById('email-login-screen');

    emailScreen.style.opacity = '0';

    setTimeout(() => {
        emailScreen.style.display = 'none';
    }, 300);
}

function toggleEmailForm(type) {

    const loginForm =
        document.getElementById('login-form-wrapper');

    const signupForm =
        document.getElementById('signup-form-wrapper');

    const title =
        document.getElementById('email-screen-title');

    if (type === 'signup') {

        loginForm.style.display = 'none';
        signupForm.style.display = 'flex';

        title.innerText = '이메일로 가입하기';

    } else {

        loginForm.style.display = 'flex';
        signupForm.style.display = 'none';

        title.innerText = '이메일로 로그인';
    }
}

async function submitEmailLogin(btnElement) {

    const email =
        document.querySelector(
            '#login-form-wrapper input[type="email"]'
        ).value.trim();

    const password =
        document.querySelector(
            '#login-form-wrapper input[type="password"]'
        ).value.trim();

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/login`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            }
        );

        const data = await response.json();

        console.log(data);

        if (!response.ok) {

            throw new Error(
                data.message || '로그인 실패'
            );
        }

        localStorage.setItem(
            'accessToken',
            data.data.accessToken
        );

        localStorage.setItem(
            'refreshToken',
            data.data.refreshToken
        );


        showSuccessModal("✨ 로그인 성공!", 1500, () => {
        enterMainApp();
        setTimeout(async () => {

    await initializeApp();

}, 100); });
        loadMyProfile();
        

    } catch (error) {

        console.error(error);

        alert(error.message);
    }
}

async function submitSignup(btnElement) {

    const email =
        document.getElementById('signup-email')
            .value.trim();

    const password =
        document.getElementById('signup-password')
            .value.trim();

    const name =
        document.getElementById('signup-name')
            .value.trim();

    const nickname =
        document.getElementById('signup-nickname')
            .value.trim();

    const birthDate =
        document.getElementById('signup-birthdate')
            .value;

    const genderEl =
        document.querySelector(
            'input[name="loginGender"]:checked'
        );

    if (
        !email ||
        !password ||
        !name ||
        !nickname ||
        !birthDate ||
        !genderEl
    ) {

        alert('모든 정보를 입력해주세요.');

        return;
    }

    const gender = genderEl.value;

    const originalText =
        btnElement.innerText;

    btnElement.innerText = '가입 중...';

    try {

        const response = await fetch(
    `${API_BASE_URL}/auth/signup`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email,
            password,
            name,
            nickname,
            birthDate,
            gender,
            registrationType: 'EMAIL',
            oauthId: ''
        })
    }
);
        const data = await response.json();

        console.log(data);

        if (!response.ok) {

            throw new Error(
                data.message || '회원가입 실패'
            );
        }

        alert('회원가입 성공!');

        toggleEmailForm('login');

    } catch (error) {

        console.error(error);

        alert(error.message);

    } finally {

        btnElement.innerText =
            originalText;
    }
}

function enterMainApp() {

    const splash =
        document.getElementById('splash-screen');

    const emailScreen =
        document.getElementById('email-login-screen');

    splash.style.opacity = '0';
    emailScreen.style.opacity = '0';

    setTimeout(() => {

        splash.style.display = 'none';
        emailScreen.style.display = 'none';

    }, 500);
}




/* 전역 등록 */
window.openEmailLogin = openEmailLogin;
window.closeEmailLogin = closeEmailLogin;
window.toggleEmailForm = toggleEmailForm;
window.submitEmailLogin = submitEmailLogin;
window.submitSignup = submitSignup;