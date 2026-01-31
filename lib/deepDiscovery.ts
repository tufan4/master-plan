
// Helper for Deep Random Discovery (Direct Content Links)
// Uses public APIs to bypass generic search pages where possible.

interface DeepLinkResult {
    url: string;
    platform: string;
    success: boolean;
}

export async function getDeepDiscoveryLink(
    platform: string,
    query: string,
    language: 'tr' | 'en'
): Promise<DeepLinkResult | null> {

    try {
        switch (platform) {
            case 'reddit': return await searchRedditDeep(query);
            case 'wikipedia': return await searchWikiDeep(query, language);
            case 'youtube': return await searchYouTubeDeep(query);
            case 'google': return await searchPdfDeep(query); // PDF
            case 'github': return await searchGithubDeep(query);
            case 'stackoverflow': return await searchStackOverflowDeep(query);
            case 'arxiv': return await searchArxivDeep(query);
            default: return null;
        }
    } catch (error) {
        console.error(`Deep discovery failed for ${platform}:`, error);
        return null;
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
    const randomPost = posts[Math.floor(Math.random() * posts.length)];
    const permalink = randomPost?.data?.permalink;
    if (!permalink) return null;
    return { url: `https://www.reddit.com${permalink}`, platform: 'reddit', success: true };
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
    return { url: randomUrl, platform: 'wikipedia', success: true };
}

// --- YOUTUBE (Piped API) ---
async function searchYouTubeDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query)}&filter=all`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();
        const items = data.items;
        if (!items || items.length === 0) return null;
        const videos = items.filter((item: any) => item.type === 'stream');
        if (videos.length === 0) return null;
        const randomVideo = videos[Math.floor(Math.random() * videos.length)];
        const videoId = randomVideo.url.split('/watch?v=')[1];
        return { url: `https://www.youtube.com/watch?v=${videoId}`, platform: 'youtube', success: true };
    } catch (e) { return null; }
}

// --- PDF/ACADEMIC (Semantic Scholar) ---
async function searchPdfDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query)}&limit=10&fields=url,openAccessPdf`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();
        const papers = data.data;
        if (!papers || papers.length === 0) return null;
        const pdfPapers = papers.filter((p: any) => p.openAccessPdf?.url);
        const paper = pdfPapers.length > 0 ? pdfPapers[Math.floor(Math.random() * pdfPapers.length)] : papers[Math.floor(Math.random() * papers.length)];
        return { url: paper.openAccessPdf?.url || paper.url, platform: 'google', success: true };
    } catch (e) { return null; }
}

// --- GITHUB ---
async function searchGithubDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=10`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();
        const repos = data.items;
        if (!repos || repos.length === 0) return null;
        const randomRepo = repos[Math.floor(Math.random() * repos.length)];
        return { url: randomRepo.html_url, platform: 'github', success: true };
    } catch (e) { return null; }
}

// --- STACKOVERFLOW ---
async function searchStackOverflowDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${encodeURIComponent(query)}&site=stackoverflow`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const data = await res.json();
        const items = data.items;
        if (!items || items.length === 0) return null;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        return { url: randomItem.link, platform: 'stackoverflow', success: true };
    } catch (e) { return null; }
}

// --- ARXIV ---
async function searchArxivDeep(query: string): Promise<DeepLinkResult | null> {
    const endpoint = `http://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&start=0&max_results=10`;
    try {
        const res = await fetch(endpoint);
        if (!res.ok) return null;
        const text = await res.text();
        // Simple regex to parse XML response for generic ID or link
        const matches = text.match(/<id>http:\/\/arxiv\.org\/abs\/(.*?)<\/id>/g);
        if (!matches || matches.length === 0) return null;
        const randomMatch = matches[Math.floor(Math.random() * matches.length)];
        const id = randomMatch.replace(/<\/?id>|http:\/\/arxiv\.org\/abs\//g, '');
        return { url: `https://arxiv.org/pdf/${id}.pdf`, platform: 'arxiv', success: true };
    } catch (e) { return null; }
}
