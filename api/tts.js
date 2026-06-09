// api/tts.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 가능합니다.' });
    }

    const { text } = req.body;
    const GOOGLE_TTS_API_KEY = process.env.GOOGLE_TTS_API_KEY; 

    try {
        const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_TTS_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: text },
                voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-A' }, 
                audioConfig: { audioEncoding: 'MP3' }
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        res.status(200).json({ audioContent: data.audioContent });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}