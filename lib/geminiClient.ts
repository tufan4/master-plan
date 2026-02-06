
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
Create an extremely detailed, high-level technical learning path for: "${topic}" in TURKISH.

Your goal is to provide a "Master Plan" where every title is a professional search query.

The output must be a VALID JSON object:
{
    "id": "gen-${Date.now()}",
    "title": "${topic}",
    "categories": [
        {
            "id": "lvl-1",
            "title": "TEMEL TEKNİKLER VE MANTIKSAL YAPI",
            "topics": [
                {
                    "id": "t-1",
                    "title": "PLC Donanım Mimarisi ve CPU İşleyişi",
                    "en": "PLC Hardware Architecture and CPU Operation",
                    "subtopics": [
                        { "id": "st-1", "title": "Giriş Çıkış (I/O) Görüntü Belleği", "en": "I/O Image Memory" }
                    ]
                }
            ]
        }
    ]
}

STRICT RULES:
1. LANGUAGE: Use professional Turkish engineering terminology ONLY.
2. DEPTH: You MUST generate at least 3 main levels (Basics, Intermediate, Advanced).
3. VOLUME: Each level must contain at least 10-15 high-precision technical topics. Total topics (Category -> Topic -> Subtopic) should be around 35-45.
4. SEARCH OPTIMIZATION: Do NOT use generic words like "Giriş", "Nedir", "Basit". 
   INSTEAD use: "Ladder Logic Sinyal Akış Diyagramları", "STL Komut Listesi ve Akümülatör Yapısı".
5. NO PREFIXES: DO NOT include prefixes like "Modül 1:", "Seviye 2:", "Bölüm:", or any numbering. Titles must be 100% pure keywords.
6. "en" field: Provide the absolute most accurate English engineering equivalent for international searches.
7. RELEVANCE: Every single topic must be a viable search query that leads to deep technical PDFs or videos.
8. No markdown, no backticks, ONLY raw JSON. Ensure it is a valid object.`;

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
