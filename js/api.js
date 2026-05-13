// js/api.js

const API_BASE_URL = 'http://52.79.241.23:3000';

async function apiFetch(endpoint, options = {}) {

    const url = `${API_BASE_URL}${endpoint}`;

    const accessToken = localStorage.getItem('accessToken');

    const headers = {
        ...(options.headers || {})
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    try {

        let response = await fetch(url, {
            ...options,
            headers
        });

        // access token 만료 처리
        if (response.status === 401) {

            const refreshed = await refreshAccessToken();

            if (refreshed) {

                const newAccessToken =
                    localStorage.getItem('accessToken');

                headers['Authorization'] =
                    `Bearer ${newAccessToken}`;

                response = await fetch(url, {
                    ...options,
                    headers
                });

            } else {

                logout();

                throw new Error('로그인이 만료되었습니다.');
            }
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API 에러');
        }

        return data;

    } catch (error) {

        console.error('API ERROR:', error);

        throw error;
    }
}

async function refreshAccessToken() {

    const refreshToken =
        localStorage.getItem('refreshToken');

    if (!refreshToken) {
        return false;
    }

    try {

        const response = await fetch(
            `${API_BASE_URL}/auth/refresh`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refreshToken
                })
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        localStorage.setItem(
            'accessToken',
            data.data.accessToken
        );

        return true;

    } catch (error) {

        console.error('토큰 재발급 실패:', error);

        return false;
    }
}

function logout() {

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

}