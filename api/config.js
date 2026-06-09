// api/config.js
export default function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    res.status(200).json({
        kakaoRestApiKey: process.env.KAKAO_REST_API_KEY
    });
}