
// Helper for Deep Random Discovery (Direct Content Links)
// Uses public APIs (Piped for YouTube, Reddit JSON, Wiki Opensearch) to bypass generic search pages.

interface DeepLinkResult {
    url: string;
    platform: string;
    success: boolean;
}

/**
 * Performs a "Deep Search" to find a specific random content URL 
 * instead of just a generic search results page.
 */
export async function getDeepDiscoveryLink(
    platform: string,
    query: string,
    language: 'tr' | 'en'
): Promise<DeepLinkResult | null> {

    try {
        switch (platform) {
            case 'reddit':
                return await searchRedditDeep(query);
            case 'wikipedia':
                return await searchWikiDeep(query, language);
            case 'youtube':
                return await searchYouTubeDeep(query);
            case 'google': // PDF
                return await searchPdfDeep(query);
            default:
                return null;
        }
    } catch (error) {
        console.error(`Deep discovery failed for ${platform}:`, error);
        return null; // Fallback to generic search will happen in UI
    }
}

// --- REDDIT ---
async function searchRedditDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=30&sort=relevance&type=link`;
    const res = await fetch(endpoint);
    if (!res.ok) return null;

    const data = await res.json();
    const posts = data?.data?.children;

    if (!posts || posts.length === 0) return null;

    // Pick strictly random
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const permalink = randomPost?.data?.permalink;

    if (!permalink) return null;

    return {
        url: `https://www.reddit.com${permalink}`,
        platform: 'reddit',
        success: true
    };
}

// --- WIKIPEDIA ---
async function searchWikiDeep(query: string, language: string): Promise<DeepLinkResult | null> {
    const lang = language === 'tr' ? 'tr' : 'en';
    const endpoint = `https://${lang}.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(query)}&limit=20&namespace=0&format=json&origin=*`;

    const res = await fetch(endpoint);
    if (!res.ok) return null;

    const data = await res.json();
    const urls = data[3];

    if (!urls || urls.length === 0) return null;

    const randomUrl = urls[Math.floor(Math.random() * urls.length)];

    return {
        url: randomUrl,
        platform: 'wikipedia',
        success: true
    };
}

// --- YOUTUBE (via Piped API - No Key Required) ---
async function searchYouTubeDeep(query: string): Promise<DeepLinkResult | null> {
    // Piped is a privacy-friendly YouTube frontend with public API.
    // Using a reliable instance.
    const endpoint = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=all`;

    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;

        const data = await res.json();
        const items = data.items;

        if (!items || items.length === 0) return null;

        // Filter only videos (exclude channels/playlists)
        const videos = items.filter((item: any) => item.type === 'stream');

        if (videos.length === 0) return null;

        // Pick random video
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        const videoId = randomVideo.url.split('/watch?v=')[1];

        return {
            url: `https://www.youtube.com/watch?v=${videoId}`,
            platform: 'youtube',
            success: true
        };
    } catch (e) {
        console.warn("Piped API failed, falling back to standard search");
        return null;
    }
}

// --- PDF/ACADEMIC (via Semantic Scholar) ---
async function searchPdfDeep(query: string): Promise<DeepLinkResult | null> {
    // Semantic Scholar API to find papers with open access PDFs
    const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=url,openAccessPdf`;

    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;

        const data = await res.json();
        const papers = data.data;

        if (!papers || papers.length === 0) return null;

        // Filter papers that have a direct PDF link
        const pdfPapers = papers.filter((p: any) => p.openAccessPdf?.url);

        if (pdfPapers.length === 0) {
            // Still good to return the paper abstract page if no direct PDF
            const randomPaper = papers[Math.floor(Math.random() * papers.length)];
            return {
                url: randomPaper.url,
                platform: 'google', // mapped to PDF
                success: true
            };
        }

        const randomPdf = pdfPapers[Math.floor(Math.random() * pdfPapers.length)];

        return {
            url: randomPdf.openAccessPdf.url,
            platform: 'google',
            success: true
        };

    } catch (e) {
        return null;
    }
}
