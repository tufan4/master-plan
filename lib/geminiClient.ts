
import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY || 'dummy_key_for_build',
    dangerouslyAllowBrowser: true // Client-side usage
});

// Helper to strip Markdown code blocks
function cleanJson(text: string): string {
    return text.replace(/```json/g, '').replace(/```/g, '').trim();
}

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
export function normalizeTopic(text: string): string {
    const acronyms = ["plc", "kpss", "hmi", "scada", "api", "rest", "sql", "html", "css", "js", "vfd", "pid", "cad", "cam", "cnc", "iot", "ai", "ml", "nlp", "aws", "os", "ram", "cpu", "io", "usb", "tcp", "ip", "udp", "http", "https", "ssl", "tls", "git", "npm", "json", "xml", "pdf", "tyt", "ayt", "dgs", "ales", "yds", "yökdil", "lgs"];

    return text.split(' ').map(word => {
        const lower = word.toLowerCase().replace(/[.,!?;:]/g, '');
        if (acronyms.includes(lower)) return word.toUpperCase();
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
}

/**
 * AI Curriculum Generator (Deep Recursive Tree Mode)
 */
export async function generateFullCurriculum(topic: string, count: number = 50): Promise<any> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("API Key eksik.");
    }

    const normalizedTopic = normalizeTopic(topic);

    try {
        const systemPrompt = `Sen bir uzman mühendislik müfredat mimarısın. "${normalizedTopic}" konusu için devasa ve ultra-spesifik bir ağaç oluştur.

KRİTİK KURALLAR (ÖNEMLİ):
1. KONTEKST BAĞIMLILIĞI: Alt başlıklar ASLA tek başına ("İşlemci", "Bellek", "Giriş") bırakılmamalı. Her zaman ana konuyu içermeli. 
   ✅ Örnek: "PLC İşlemci Mimarisi", "PLC RAM ve ROM Bellek Yapısı", "PLC Dijital Giriş Modülleri".
2. GENEL BAŞLIK YASAĞI: "Giriş", "Tarihçe", "Özet", "Sonuç" gibi kelimeleri ASLA kullanma.
3. HİYERARŞİ: TOPLAM ${count} adet madde içerecek şekilde en az 5 katmanlı bir derinlik oluştur.
4. ARAMA ODAKLI: q_tr ve q_en alanları, arama motorunda en iyi sonucu verecek şekilde "Konu + Teknik Detay" şeklinde olmalı.

ÇIKTI FORMATI (JSON):
{
  "title": "${normalizedTopic}",
  "topics": [
    {
      "title": "${normalizedTopic} Donanım Bileşenleri",
      "q_tr": "${normalizedTopic} hardware architecture details",
      "q_en": "${normalizedTopic} hardware architecture technical guide",
      "subtopics": [...]
    }
  ]
}
Sadece minified JSON döndür. Boşluk bırakma.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `"${normalizedTopic}" için ${count} başlıktan oluşan, her başlığı kendi bağlamında (context-aware) isimlendirilmiş devasa müfredat.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.2,
            max_tokens: 8000,
            response_format: { type: "json_object" }
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        if (!rawText) throw new Error("AI response was empty.");
        const parsed = JSON.parse(cleanJson(rawText));

        const fixStructure = (items: any[], parentLevel: number = 0): any[] => {
            return items.map((item) => ({
                id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                title: normalizeTopic(item.title),
                q_tr: item.q_tr || item.title,
                q_en: item.q_en || item.title,
                level: parentLevel + 1,
                keywords: [item.title.toLowerCase()],
                subtopics: item.subtopics && Array.isArray(item.subtopics) ? fixStructure(item.subtopics, parentLevel + 1) : []
            }));
        };

        return {
            title: parsed.title || normalizedTopic,
            topics: fixStructure(parsed.topics || [], 0)
        };
    } catch (error) {
        console.error('Curriculum generation failed:', error);
        throw error;
    }
}

/**
 * AI Branch Expander
 */
export async function generateSubtopicTree(parentTopic: string): Promise<any[]> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) return [];

    try {
        const systemPrompt = `Sen bir uzman mühendissin. "${parentTopic}" başlığı altına 30-50 adet ultra-teknik alt başlık üret.
KURALLAR:
1. Her başlık "${parentTopic}" kelimesini veya bağlamını içermeli.
   ✅ Örnek: "Modbus TCP Paket Yapısı", "Modbus Register Haritalama".
2. Çıktı JSON olmalı. q_tr ve q_en anahtarları teknik ve temiz olmalı.
3. Hiyerarşi kur.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: systemPrompt }],
            model: "llama-3.1-8b-instant",
            temperature: 0.4,
            max_tokens: 4000,
            response_format: { type: "json_object" }
        });

        const parsed = JSON.parse(cleanJson(completion.choices[0]?.message?.content || "{}"));
        return parsed.topics || [];
    } catch (e) {
        console.error("Branch expansion failed:", e);
        return [];
    }
}

function fallbackKeywords(topic: string): string[] {
    return [topic];
}

/**
 * AI Related Topics Generator
 */
export async function generateRelatedTopics(topic: string): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) return [];
    try {
        const systemPrompt = `Sen bir mühendislik danışmanısın. "${topic}" için 20 adet profesyonel teknik başlık öner. JSON array döndür.`;
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 1500,
            response_format: { type: "json_object" }
        });
        const parsed = JSON.parse(cleanJson(completion.choices[0]?.message?.content || "{}"));
        return Array.isArray(parsed) ? parsed : (parsed.topics || []);
    } catch (e) {
        return [];
    }
}
