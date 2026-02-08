
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
 * Improved Prompt System by User Request (Technical & Detailed)
 */
export async function generateFullCurriculum(topic: string, count: number = 50): Promise<any> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) {
        throw new Error("API Key eksik.");
    }

    const normalizedTopic = normalizeTopic(topic);

    try {
        const systemPrompt = `Sen bir uzman öğrenme yolu tasarımcısısın. Görevin, "${normalizedTopic}" konusunu derinlemesine analiz edip, sıfırdan ileri seviyeye kadar yapılandırılmış, akademik ve teknik bir müfredat ağacı oluşturmak.

TEMEL KURALLAR:
1. Her alt başlık MUTLAKA teknik ve detaylı olmalı.
2. Genel başlıklar ASLA KULLANMA (❌ "Giriş", "Temel Bilgiler", "Tarihçe", "Avantajlar", "İleri Seviye", "Sonuç").
3. Her başlık spesifik bir teknik kavramı veya beceriyi temsil etmeli.
4. Hiyerarşik yapı kur: Ana Konu -> Alt Konu -> Detay Konu (En az 3 derinlik).
5. Kapsamlı olmalı: TOPLAM EN AZ ${count} adet başlık üretmelisin. Konu bütünlüğünü koruyarak ${count} maddeye ulaş.
6. HER BAŞLIK İÇİN iki farklı arama alanı ekle:
   - "q_tr": O başlığı Türkçe kaynaklarda (ders notları, eğitim videoları) aratacak teknik kelimeler.
   - "q_en": O başlığı küresel kaynaklarda (documentation, official papers) aratacak profesyonel İngilizce kelimeler.

BAŞLIK FORMATI ÖRNEKLERİ:
✅ DOĞRU: "PLC Ladder Logic Programlama Temelleri"
✅ DOĞRU: "Siemens S7-1200 Timer ve Counter Fonksiyonları"

ÇIKTI FORMATI (JSON):
{
  "title": "${normalizedTopic}",
  "topics": [
    {
      "id": "uuid-1",
      "title": "Spesifik Alt Başlık 1",
      "q_tr": "S7-1200 PLC ladder diyagramı dersleri",
      "q_en": "Siemens S7-1200 ladder logic programming guide",
      "subtopics": [
        { "id": "uuid-1-1", "title": "Teknik Detay 1", "q_tr": "...", "q_en": "...", "subtopics": [] }
      ]
    }
  ]
}
Sadece JSON döndür.`;

        const completion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `"${normalizedTopic}" için detaylı müfredat ağacını oluştur.` }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.3,
            max_tokens: 7000,
            response_format: { type: "json_object" }
        });

        const rawText = completion.choices[0]?.message?.content?.trim();
        if (!rawText) throw new Error("AI response was empty.");

        const parsed = JSON.parse(cleanJson(rawText));

        // Recursive ID fixer helper (ensures unique IDs and levels for frontend)
        const fixStructure = (items: any[], parentLevel: number = 0): any[] => {
            return items.map((item, idx) => ({
                id: item.id || `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                title: item.title,
                q_tr: item.q_tr || item.title,
                q_en: item.q_en || item.title,
                level: parentLevel + 1,
                keywords: [item.title.toLowerCase()],
                subtopics: item.subtopics && Array.isArray(item.subtopics) ? fixStructure(item.subtopics, parentLevel + 1) : []
            }));
        };

        let topics = [];
        if (parsed.topics && Array.isArray(parsed.topics)) {
            topics = fixStructure(parsed.topics, 0);
        } else if (Array.isArray(parsed)) {
            topics = fixStructure(parsed, 0);
        } else {
            topics = [];
        }

        return {
            title: parsed.title || normalizedTopic,
            topics: topics
        };

    } catch (error) {
        console.error('Curriculum generation failed:', error);
        throw error;
    }
}

function fallbackKeywords(topic: string): string[] {
    return [topic];
}

/**
 * AI Related Topics Generator (Ghost Mode)
 */
export async function generateRelatedTopics(topic: string): Promise<string[]> {
    if (!process.env.NEXT_PUBLIC_GROQ_API_KEY) return [];

    try {
        const systemPrompt = `Sen bir müfredat danışmanısın.
Konu: "${topic}"
Görev: Bu konuyu çalışmak isteyen birine önerilecek 10 adet TAMAMLAYICI veya BENZER teknik eğitim başlığı öner.
Örnek: "Python" -> ["Django Web Framework", "Veri Bilimi için Pandas", "Makine Öğrenmesi Temelleri", ...]
Sadece JSON string array döndür. Markdown block kullanma.`;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: systemPrompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.4,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        });

        const raw = completion.choices[0]?.message?.content?.trim();
        if (!raw) return [];

        const clean = cleanJson(raw);
        const parsed = JSON.parse(clean);

        if (Array.isArray(parsed)) return parsed;
        if (parsed.topics) return parsed.topics;
        return [];

    } catch (e) {
        console.error("Related topics failed:", e);
        return [];
    }
}
