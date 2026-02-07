
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
        const prompt = `Act as an Elite Engineering Professor and Curriculum Architect.
Limitless Knowledge Curator.
Create an extremely detailed, high-precision technical learning path for: "${topic}" in TURKISH.

Your goal is to provide a "Master Plan" where EVERY SINGLE TITLE (including categories) is a professional, specific search query.

The output must be a VALID JSON object:
{
    "id": "gen-${Date.now()}",
    "title": "${topic}",
    "categories": [
        {
            "id": "cat-1",
            "title": "Hassas Teknik Ana Başlık (Örn: PLC Donanım Mimarisi ve Bellek Yapısı)",
            "topics": [
                {
                    "id": "t-1",
                    "title": "Spesifik Teknik Detay (Örn: I/O Görüntü Belleği ve CPU Tarama Döngüsü)",
                    "en": "Specific Technical Detail (EN)",
                    "subtopics": [
                        { "id": "st-1", "title": "Mikro Teknik Detay", "en": "Micro Detail" }
                    ]
                }
            ]
        }
    ]
}

STRICT RULES:
1. LANGUAGE: Use professional Turkish engineering terminology ONLY.
2. DEPTH: You MUST generate at least 3 main Category blocks.
3. VOLUME: Each category must contain at least 10-15 high-precision technical topics. Total topics should be around 35-45.
4. SEARCH OPTIMIZATION: NEVER use generic words like "Giriş", "Temel", "Orta", "İleri", "Teknikler", "Nedir", "Basit". 
   INSTEAD use extremely specific engineering terms: "S7-1200 Donanım Konfigürasyonu", "Modbus TCP/IP Haberleşme Protokolü Detayları".
5. NO PREFIXES: DO NOT include prefixes like "Modül 1:", "Bölüm:", "1.", or any numbering. 
6. CONTEXTUAL TITLES: Every title must be self-contained enough to return technical results on Google/YouTube even without the context of the main topic.
7. "en" field: Provide the absolute most accurate English engineering equivalent.
8. No markdown, no backticks, ONLY raw JSON.`;

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
