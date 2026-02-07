
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
 * Helper: Normalize Acronyms & Professional Casing
 */
function normalizeTopic(text: string): string {
    const acronyms = ["plc", "kpss", "hmi", "scada", "api", "rest", "sql", "html", "css", "js", "vfd", "pid", "cad", "cam", "cnc", "iot", "ai", "ml", "nlp", "aws", "os", "ram", "cpu", "io", "usb", "tcp", "ip", "udp", "http", "https", "ssl", "tls", "git", "npm", "json", "xml", "pdf", "tyt", "ayt", "dgs", "ales", "yds", "yökdil", "lgs"];

    return text.split(' ').map(word => {
        const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
        if (acronyms.includes(lower)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

/**
 * AI Curriculum Generator (Massive Flat Hybrid)
 */
export async function generateFullCurriculum(topic: string): Promise<any> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("API Key eksik.");
    }

    const normalizedTopic = normalizeTopic(topic);

    try {
        const prompt = `Act as an Elite Engineering Professor.
Create a high-granularity technical curriculum for: "${normalizedTopic}" in TURKISH.

STRICT RULES:
1. TITLES: Max 3-4 words. Extremely concise. (e.g., "PLC Donanım Birimleri")
2. VOLUME: Generate exactly 40-60 Micro-Keywords.
3. HIERARCHY: Use "level" (0=Main, 1=Sub, 2=Detail).
4. REPETITION: Every item must be related to "${normalizedTopic}".
5. FORMAT: Return ONLY a valid JSON object.

JSON STRUCTURE:
{
    "id": "gen-path",
    "title": "${normalizedTopic}",
    "isMassive": true,
    "topics": [
        { "id": "1", "level": 0, "title": "Giriş ve Temel", "en": "Introduction" },
        ...
    ]
}`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: "You are a curriculum architect that outputs technical learning paths in valid JSON." },
                { role: "user", content: prompt }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 6000,
            response_format: { type: "json_object" }
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        if (!rawText) throw new Error("AI response was empty.");

        const parsed = JSON.parse(rawText);

        if (parsed.topics && Array.isArray(parsed.topics)) {
            parsed.topics = parsed.topics.map((t: any) => ({
                ...t,
                level: t.level ?? 1,
                subtopics: t.subtopics || []
            }));
        } else {
            throw new Error("Invalid structure: missing topics array.");
        }

        return parsed;
    } catch (error) {
        console.error('Curriculum generation failed:', error);
        throw error;
    }
}

function fallbackKeywords(topic: string): string[] {
    return [topic];
}
