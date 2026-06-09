// api/gemini.js
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'POST 요청만 허용합니다.' });
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

    try {
        const { text } = req.body; 
        
        res.status(200).json({ 
            success: true, 
            result: `[AI 교정 완료된 문장] ${text}` 
        });

    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}