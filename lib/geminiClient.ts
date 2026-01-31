// Gemini AI Client for Smart Content Discovery and Keyword Generation

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * AI-powered keyword expansion
 * Generates 20 diverse keywords for a given engineering topic
 */
export async function generateDiverseKeywords(
    topic: string,
    language: 'tr' | 'en' = 'en'
): Promise<string[]> {
    if (!GEMINI_API_KEY) {
        return fallbackKeywords(topic, language);
    }

    try {
        const prompt = `Generate exactly 20 distinct, high-quality search keywords for the engineering topic: "${topic}". 
        
        Rules:
        1. Diversity: Don't just repeat the topic name. Focus on sub-concepts, specific algorithms, real-world applications, and related technical terms.
        2. Relevance: Keywords must be deeply related to "${topic}".
        3. Language: ${language === 'tr' ? 'Turkish (but keep universal technical terms in English if commonly used)' : 'English'}.
        4. Format: Return ONLY a comma-separated list. No numbers, no bullets.
        5. Avoid Redundancy: Do NOT generate phrases like "${topic} examples", "${topic} tutorial" repeatedly. Use specific terms like "PID tuning" instead of "PID Controller tuning".`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 500 }
            })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!aiText) return fallbackKeywords(topic, language);

        const keywords = aiText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        return keywords.length >= 5 ? keywords.slice(0, 20) : fallbackKeywords(topic, language);

    } catch (error) {
        console.error('Keyword expansion failed:', error);
        return fallbackKeywords(topic, language);
    }
}

function fallbackKeywords(topic: string, language: string): string[] {
    const isTr = language === 'tr';
    return [
        topic,
        `${topic} ${isTr ? 'nedir' : 'explained'}`,
        `${topic} ${isTr ? 'eğitimi' : 'tutorial'}`,
        `${topic} ${isTr ? 'örnekleri' : 'examples'}`,
        `${topic} ${isTr ? 'uygulamaları' : 'applications'}`,
        `${topic} ${isTr ? 'temelleri' : 'basics'}`,
        `${topic} ${isTr ? 'ileri seviye' : 'advanced'}`,
        `${topic} ${isTr ? 'notları' : 'notes'}`,
        `${topic} ${isTr ? 'mühendislik' : 'engineering'}`,
        `${topic} ${isTr ? 'nasıl çalışır' : 'how it works'}`
    ];
}
