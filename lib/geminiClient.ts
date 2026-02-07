
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'dummy_key_for_build',
    dangerouslyAllowBrowser: true // Client-side usage
});

/**
 * AI-powered Translation
 */
export async function generateDiverseKeywords(
    topic: string,
    language: 'tr' | 'en' = 'en'
): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        return fallbackKeywords(topic);
    }

    try {
        const prompt = `Translate the engineering topic "${topic}" to English. Return ONLY the translated term.`;

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
 * AI Curriculum Generator (Massive Flat Hybrid)
 */
export async function generateFullCurriculum(topic: string): Promise<any> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("API Key eksik.");
    }

    try {
        const prompt = `Act as an Elite Engineering Professor and High-Granularity Knowledge Indexer.
Create an EXTREMELY MASSIVE, atomized learning path for: "${topic}" in TURKISH.

Your goal is to break this subject down into at least 80-100 distinct, sequential technical learning atoms.
Every item must be a complete, self-contained search query.

The output must be a VALID JSON object:
{
    "id": "gen-${Date.now()}",
    "title": "${topic}",
    "isMassive": true,
    "topics": [
        {
            "id": "t-1",
            "title": "${topic}: Donanım Bileşenleri ve CPU Tarama Döngüsü (Scan Cycle)",
            "en": "${topic}: Hardware Components and CPU Scan Cycle",
            "subtopics": []
        }
    ]
}

STRICT ARCHITECTURE RULES:
1. NO CATEGORIES: Return a single flat array in the "topics" field. Do NOT wrap them in categories or modules.
2. SEQUENTIAL ORDER: Order the topics strictly from absolute basics to extreme advanced mastery.
3. SEARCH ATOMIZATION: Every "title" MUST be a professional search query. NEVER use generic words like "Giriş", "Nedir", "Basit". 
4. MASSIVE SCALE: Be as exhaustive as possible. Break down every sub-detail into its own topic. 
5. CONTEXTUAL: Every title MUST contain "${topic}" or related context so it is self-sufficient for search.
6. Return ONLY raw JSON. Use max tokens to provide as many entries as possible.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 8000, // Maximizing output
            response_format: { type: "json_object" }
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
