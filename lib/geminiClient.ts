<<<<<<< HEAD
// Gemini AI Client for Smart Content Discovery and Keyword Generation
=======
// Gemini AI Client for Smart Content Discovery
>>>>>>> 4d2467a10146d7e69c6e98a1274d1b2410b6b3e9

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export interface AIContentResult {
    url: string;
    title: string;
    platform: string;
    description?: string;
}

/**
<<<<<<< HEAD
 * AI-powered keyword expansion
 * Generates 20 diverse keywords for a given engineering topic
 */
export async function generateDiverseKeywords(
    topic: string,
    language: 'tr' | 'en' = 'en'
): Promise<string[]> {
    if (!GEMINI_API_KEY) {
        return fallbackKeywords(topic, language);
    }

    try {
        const prompt = `Generate exactly 20 diverse, highly relevant search keywords/phrases for the engineering topic "${topic}". 
        Include both basic concepts and advanced technical terms. 
        Format: Return ONLY a comma-separated list of the 20 keywords. 
        Language: ${language === 'tr' ? 'Turkish' : 'English'}. 
        Don't include numbers or bullets.`;
=======
 * AI-powered content discovery
 * Finds the best matching content (YouTube video, PDF, Reddit post, etc.) for a given topic
 */
export async function findSmartContent(
    topic: string,
    platform: 'youtube' | 'pdf' | 'reddit' | 'pinterest' | 'wikipedia',
    language: 'tr' | 'en' = 'en'
): Promise<AIContentResult | null> {
    if (!GEMINI_API_KEY) {
        console.warn('Gemini API key not found, using fallback search');
        return fallbackSearch(topic, platform, language);
    }

    try {
        const prompt = buildPrompt(topic, platform, language);
>>>>>>> 4d2467a10146d7e69c6e98a1274d1b2410b6b3e9

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
<<<<<<< HEAD
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 300 }
            })
        });

        if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);
=======
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 200
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }
>>>>>>> 4d2467a10146d7e69c6e98a1274d1b2410b6b3e9

        const data = await response.json();
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;

<<<<<<< HEAD
        if (!aiText) return fallbackKeywords(topic, language);

        const keywords = aiText.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
        return keywords.length >= 5 ? keywords.slice(0, 20) : fallbackKeywords(topic, language);

    } catch (error) {
        console.error('Keyword expansion failed:', error);
        return fallbackKeywords(topic, language);
    }
}

function fallbackKeywords(topic: string, language: string): string[] {
    const isTr = language === 'tr';
    return [
        topic,
        `${topic} ${isTr ? 'nedir' : 'explained'}`,
        `${topic} ${isTr ? 'eğitimi' : 'tutorial'}`,
        `${topic} ${isTr ? 'örnekleri' : 'examples'}`,
        `${topic} ${isTr ? 'uygulamaları' : 'applications'}`,
        `${topic} ${isTr ? 'temelleri' : 'basics'}`,
        `${topic} ${isTr ? 'ileri seviye' : 'advanced'}`,
        `${topic} ${isTr ? 'notları' : 'notes'}`,
        `${topic} ${isTr ? 'mühendislik' : 'engineering'}`,
        `${topic} ${isTr ? 'nasıl çalışır' : 'how it works'}`
    ];
=======
        if (!aiText) {
            return fallbackSearch(topic, platform, language);
        }

        // Parse AI response to extract URL
        const result = parseAIResponse(aiText, platform);
        return result || fallbackSearch(topic, platform, language);

    } catch (error) {
        console.error('AI search failed:', error);
        return fallbackSearch(topic, platform, language);
    }
}

function buildPrompt(topic: string, platform: string, language: string): string {
    const langSuffix = language === 'tr' ? 'Türkçe' : 'English';

    const platformInstructions = {
        youtube: `Find the BEST YouTube video URL about "${topic}" in ${langSuffix}. Return ONLY the full YouTube URL (https://youtube.com/watch?v=...), nothing else. Prioritize: educational, high quality, recent content.`,

        pdf: `Find a high-quality PDF document or academic paper about "${topic}" in ${langSuffix}. Return ONLY the direct PDF URL (must end with .pdf or be a Google Scholar link), nothing else.`,

        reddit: `Find the most relevant Reddit discussion post about "${topic}" in ${langSuffix}. Return ONLY the full Reddit post URL (https://reddit.com/r/.../comments/...), nothing else. Prefer active discussions with good upvotes.`,

        pinterest: `Find the best Pinterest pin/board about "${topic}" visual schematics or diagrams. Return ONLY the full Pinterest URL (https://pinterest.com/pin/...), nothing else.`,

        wikipedia: `Find the Wikipedia article about "${topic}" in ${langSuffix}. Return ONLY the full Wikipedia URL (https://en.wikipedia.org/wiki/... or https://tr.wikipedia.org/wiki/...), nothing else.`
    };

    return platformInstructions[platform as keyof typeof platformInstructions] || platformInstructions.youtube;
}

function parseAIResponse(aiText: string, platform: string): AIContentResult | null {
    // Extract URL from AI response
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g;
    const urls = aiText.match(urlRegex);

    if (!urls || urls.length === 0) return null;

    const url = urls[0].trim();

    // Validate platform-specific URL
    const validations: Record<string, RegExp> = {
        youtube: /youtube\.com\/watch|youtu\.be/,
        reddit: /reddit\.com/,
        pinterest: /pinterest\.(com|fr|de|co\.uk)/,
        wikipedia: /wikipedia\.org/,
        pdf: /\.pdf$|scholar\.google/
    };

    const isValid = validations[platform]?.test(url) ?? true;

    if (!isValid) return null;

    return {
        url,
        title: `AI-Found: ${platform}`,
        platform,
        description: aiText.substring(0, 100)
    };
}

function fallbackSearch(topic: string, platform: string, language: string): AIContentResult {
    // Fallback: Direct Google/platform search
    const encodedTopic = encodeURIComponent(topic);
    const langCode = language === 'tr' ? 'tr' : 'en';

    const fallbackUrls: Record<string, string> = {
        youtube: `https://www.youtube.com/results?search_query=${encodedTopic}+tutorial`,
        pdf: `https://www.google.com/search?q=${encodedTopic}+filetype:pdf`,
        reddit: `https://www.reddit.com/search/?q=${encodedTopic}`,
        pinterest: `https://www.pinterest.com/search/pins/?q=${encodedTopic}+schematic`,
        wikipedia: `https://${langCode}.wikipedia.org/wiki/${encodedTopic.replace(/\s+/g, '_')}`
    };

    return {
        url: fallbackUrls[platform] || fallbackUrls.youtube,
        title: `Search: ${topic}`,
        platform
    };
>>>>>>> 4d2467a10146d7e69c6e98a1274d1b2410b6b3e9
}
