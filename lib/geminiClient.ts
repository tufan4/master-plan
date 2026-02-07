
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
        const prompt = `Act as an Elite Engineering Professor and High-Granularity Knowledge Indexer.
Create an EXTREMELY MASSIVE, hierarchical learning path for: "${normalizedTopic}" in TURKISH.

Your goal is to provide a "Staircase Table of Contents" where every concept is a MICRO-KEYWORD.

STRICT WORD COUNT RULES:
- EVERY TITLE MUST BE MAX 3-5 WORDS.
- Use extreme conciseness. Only technical "keys". 
- WRONG: "PLC Programlama İçin Gereken Temel Giriş ve Çıkış Üniteleri" (9 words)
- RIGHT: "PLC Giriş/Çıkış Üniteleri" (3 words)

FORMAT RULES:
- Titles MUST be clean, keyword-style technical terms.
- Use the "level" field to indicate hierarchy: 0 for main, 1 for sub, 2 for detail.

The output must be a VALID JSON object:
{
    "id": "gen-${Date.now()}",
    "title": "${normalizedTopic}",
    "isMassive": true,
    "topics": [
        {
            "id": "t-1",
            "level": 0,
            "title": "[${normalizedTopic}] Donanım Mimarisi",
            "en": "${normalizedTopic} Hardware Architecture",
            "subtopics": []
        }
    ]
}

STRICT ARCHITECTURE RULES:
1. NO CATEGORIES: Return a single flat array in the "topics" field.
2. SEARCH PRECISION: Titles must be optimized "Key Concepts" for finding PDF/Videos.
3. MASSIVE VOLUME: Generate at least 80-100 micro-keywords.
4. REPETITION: Every title MUST mention or imply "${normalizedTopic}".
5. Return ONLY raw JSON.`;

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
