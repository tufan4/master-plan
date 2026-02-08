import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

const MODEL = "llama-3.3-70b-versatile";

export async function generateFullCurriculum(topic: string, targetCount: number = 500) {
    console.log(`[AI] Starting curriculum generation for: "${topic}" with target count: ${targetCount}`);

    try {
        const prompt = `You are a world-class curriculum designer for engineering education.

TASK: Create a comprehensive, hierarchical curriculum for: "${topic}"

REQUIREMENTS:
1. Generate approximately ${targetCount} topics total
2. Use highly specific, context-aware titles (e.g., "PLC Processor Architecture" NOT just "Processor")
3. Each topic MUST include:
   - id: unique identifier
   - title: Specific, context-aware title in Turkish
   - q_tr: Optimized search query in Turkish (technical terminology)
   - q_en: Optimized search query in English (technical terminology)
   - subtopics: array of nested topics (create deep hierarchies)

4. Make topics progressively detailed - start broad, go extremely deep
5. Use proper technical terminology
6. Ensure search queries are specific and professional

OUTPUT FORMAT (minified JSON):
{
  "title": "Main curriculum title in Turkish",
  "topics": [
    {
      "id": "unique-id-1",
      "title": "${topic} Temelleri ve Giriş",
      "q_tr": "${topic} temel kavramlar mühendislik",
      "q_en": "${topic} fundamentals engineering concepts",
      "subtopics": [
        {
          "id": "unique-id-1-1",
          "title": "Specific sub-concept with context",
          "q_tr": "specific turkish search query",
          "q_en": "specific english search query",
          "subtopics": []
        }
      ]
    }
  ]
}

Return ONLY valid, minified JSON. No explanations.`;

        console.log('[AI] Sending request to GROQ API...');

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 16000,
        });

        console.log('[AI] Received response from GROQ API');

        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) {
            throw new Error("AI returned empty response");
        }

        console.log('[AI] Parsing AI response...');

        const cleanedContent = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedContent);

        if (!parsed.topics || !Array.isArray(parsed.topics)) {
            throw new Error("Invalid curriculum structure - missing or invalid topics array");
        }

        console.log(`[AI] Successfully generated curriculum with ${parsed.topics.length} main topics`);
        return parsed;

    } catch (error: any) {
        console.error('[AI] Generation failed:', error);

        if (error?.message?.includes('API key')) {
            throw new Error('GROQ API anahtarı geçersiz veya eksik. Lütfen .env.local dosyasını kontrol edin.');
        }

        if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
            throw new Error('AI API limiti aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.');
        }

        if (error?.message?.includes('timeout')) {
            throw new Error('AI isteği zaman aşımına uğradı. Lütfen tekrar deneyin.');
        }

        throw new Error(`Müfredat oluşturma hatası: ${error.message || 'Bilinmeyen hata'}`);
    }
}
