import Groq from "groq-sdk";

const groq = new Groq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    dangerouslyAllowBrowser: true
});

const MODEL = "llama-3.3-70b-versatile";

export async function generateFullCurriculum(topic: string, targetCount: number = 500) {
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

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: MODEL,
            temperature: 0.7,
            max_tokens: 16000,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) throw new Error("No content generated");

        const cleanedContent = content
            .replace(/```json\n?/g, '')
            .replace(/```\n?/g, '')
            .trim();

        const parsed = JSON.parse(cleanedContent);

        if (!parsed.topics || !Array.isArray(parsed.topics)) {
            throw new Error("Invalid curriculum structure");
        }

        return parsed;
    } catch (error) {
        console.error("Curriculum generation error:", error);
        throw error;
    }
}
