
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'dummy_key_for_build',
    dangerouslyAllowBrowser: true // Client-side usage (Not recommended for prod but required for this architecture)
});

/**
 * AI-powered Translation
 * Translates the topic to English to provide dual-language search options.
 * Returns an array containing just the English title.
 */
export async function generateDiverseKeywords(
    topic: string,
    language: 'tr' | 'en' = 'en'
): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        return fallbackKeywords(topic);
    }

    try {
        const prompt = `Translate the engineering topic "${topic}" to English. Return ONLY the translated term. Do not add any extra text, punctuation, or explanations. If it is already in English or proper noun, return it as is.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1,
            max_tokens: 50,
        });

        const englishTitle = completion.choices[0]?.message?.content?.trim();

        if (!englishTitle) return fallbackKeywords(topic);

        return [englishTitle];

    } catch (error) {
        console.error('Translation failed:', error);
        return fallbackKeywords(topic);
    }
}


/**
 * AI Curriculum Generator
 * Generates a full hierarchical learning path for ANY topic using Groq (Llama 3).
 */
export async function generateFullCurriculum(topic: string): Promise<any> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("API Key eksik. Lütfen .env.local dosyasını kontrol edin.");
    }

    try {
        const prompt = `
        Act as a Professor and Curriculum Designer.
        Create a detailed, hierarchical learning path for the topic: "${topic}" in TURKISH.
        
        The output must be a VALID JSON object with the following structure:
        {
            "id": "generated-${Date.now()}",
            "title": "${topic}",
            "categories": [
                {
                    "id": "cat-1",
                    "title": "Modül 1: Temeller",
                    "topics": [
                        {
                            "id": "topic-1-1",
                            "title": "${topic} Giriş",
                            "en": "Introduction to ${topic}",
                            "subtopics": []
                        }
                    ]
                }
            ]
        }

        Rules:
        1. LANGUAGE: The entire content (titles, categories) MUST be in TURKISH.
        2. STRUCTURE: Create exactly 1 main category (Module) representing the whole course if possible, or split into logical Modules like "Modül 1: ...", "Modül 2: ...".
        3. Do NOT include numbering in the 'title' fields (e.g. use "Temeller" instead of "1. Temeller"). The UI handles numbering.
        4. "en" field MUST be the English translation of the title for search purposes.
        5. Return ONLY raw JSON. No markdown formatting, no backticks.
        6. Ensure deep coverage (at least 6-8 main topics per module).
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 4000,
            response_format: { type: "json_object" } // Enforces JSON mode
        });

        const rawText = completion.choices[0]?.message?.content?.trim();

        if (!rawText) throw new Error("AI boş yanıt döndürdü.");

        return JSON.parse(rawText);
    } catch (error) {
        console.error('Curriculum generation failed:', error);
        throw error;
    }
}

function fallbackKeywords(topic: string): string[] {
    return [topic];
}
