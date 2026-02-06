// Gemini AI Client for Smart Content Discovery and Keyword Generation

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

/**
 * AI-powered Translation
 * Translates the topic to English to provide dual-language search options.
 * Returns an array containing just the English title.
 */
export async function generateDiverseKeywords(
    topic: string,
    language: 'tr' | 'en' = 'en'
): Promise<string[]> {
    if (!GEMINI_API_KEY) {
        return fallbackKeywords(topic);
    }

    try {
        const prompt = `Translate the engineering topic "${topic}" to English. Return ONLY the translated term. Do not add any extra text, punctuation, or explanations. If it is already in English or proper noun, return it as is.`;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.1, maxOutputTokens: 50 } // Low temp for precision
            })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data = await response.json();
        const englishTitle = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

        if (!englishTitle) return fallbackKeywords(topic);

        // Return only the English title as a single-item array
        return [englishTitle];

    } catch (error) {
        console.error('Translation failed:', error);
        return fallbackKeywords(topic);
    }
}


/**
 * AI Curriculum Generator
 * Generates a full hierarchical learning path for ANY topic using Gemini.
 */
export async function generateFullCurriculum(topic: string): Promise<any> {
    if (!GEMINI_API_KEY) {
        throw new Error("API Key eksik. Lütfen .env.local dosyasını kontrol edin.");
    }

    try {
        const prompt = `
        Act as a Professor and Curriculum Designer.
        Create a detailed, hierarchical learning path for the topic: "${topic}".
        
        The output must be a VALID JSON object with the following structure:
        {
            "id": "generated-${Date.now()}",
            "title": "${topic} (AI Generated)",
            "categories": [
                {
                    "id": "cat-1",
                    "title": "Module 1: Foundations",
                    "topics": [
                        {
                            "id": "topic-1-1",
                            "title": "Introduction to ${topic}",
                            "en": "Introduction to ${topic}",
                            "subtopics": []
                        }
                    ]
                }
            ]
        }

        Rules:
        1. Create at least 4 main modules (Categories).
        2. Each module should have at least 5 sub-topics.
        3. Use nested subtopics where necessary for complex concepts.
        4. "en" field should be the English translation of the title.
        5. Return ONLY raw JSON. No markdown formatting, no backticks.
        `;

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 4000 },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
                ]
            })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

        const data = await response.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!rawText) throw new Error("AI boş yanıt döndürdü.");

        return JSON.parse(rawText.replace(/```json/g, "").replace(/```/g, "").trim());
    } catch (error) {
        console.error('Curriculum generation failed:', error);
        throw error;
    }
}

function fallbackKeywords(topic: string): string[] {
    return [topic];
}
