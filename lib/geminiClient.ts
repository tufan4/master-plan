
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
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
            model: "llama3-70b-8192",
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

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama3-70b-8192",
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
