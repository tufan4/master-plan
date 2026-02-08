import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force dynamic to avoid stale results
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const lang = searchParams.get('lang') || 'tr'; // Default to Turkish Wikipedia

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        console.log(`[WikiCurriculum] Searching for: ${query} in ${lang}`);

        // 1. Search Wikipedia for the most relevant page
        const searchApiUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json`;
        const searchRes = await fetch(searchApiUrl);
        const searchData = await searchRes.json();

        if (!searchData.query?.search?.length) {
            // Fallback to English if Turkish fails
            if (lang === 'tr') {
                console.log('[WikiCurriculum] No TR results, falling back to EN...');
                return GET(new NextRequest(req.url.replace('lang=tr', 'lang=en')));
            }
            return NextResponse.json({ error: 'No Wikipedia page found' }, { status: 404 });
        }

        const bestMatch = searchData.query.search[0];
        const pageTitle = bestMatch.title;
        const pageUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

        console.log(`[WikiCurriculum] Found page: ${pageTitle} (${pageUrl})`);

        // 2. Fetch the actual page content (HTML) for parsing structure
        // We use HTML scraping instead of API because the TOC structure is better in HTML
        const pageRes = await fetch(pageUrl);
        const html = await pageRes.text();
        const $ = cheerio.load(html);

        // 3. Smart Parsing Logic
        // Wikipedia structure: H2 (Section) -> H3 (Subsection)
        // We need to build a hierarchical tree

        const topics: any[] = [];
        let currentSection: any = null;

        // Wikipedia Content Div
        const contentDiv = $('#mw-content-text');

        // Iterate through headings
        contentDiv.find('h2, h3').each((i, el) => {
            const tag = $(el).get(0)?.tagName.toLowerCase();
            if (!tag) return;
            const $el = $(el);

            // Clean title (remove [edit] links)
            const title = $el.find('.mw-headline').text().trim() || $el.text().trim().replace(/\[.*?\]/g, '');

            // Skip irrelevant sections
            if (['Kaynakça', 'References', 'See also', 'Ayrıca bakınız', 'External links', 'Dış bağlantılar', 'Notes', 'Notlar'].includes(title)) {
                return;
            }

            if (tag === 'h2') {
                // New Main Section
                currentSection = {
                    id: crypto.randomUUID(),
                    title: title,
                    keywords: [title.toLowerCase(), query.toLowerCase()],
                    subtopics: []
                };
                topics.push(currentSection);
            } else if (tag === 'h3' && currentSection) {
                // Warning: Sometimes H3 appears before H2? Unlikely in Wiki but possible.
                // Add as subtopic to current H2
                currentSection.subtopics.push({
                    id: crypto.randomUUID(),
                    title: title,
                    keywords: [title.toLowerCase()],
                    subtopics: [] // Wiki rarely goes deeper than H3 meaningful for curriculum
                });
            }
        });

        // 4. Fallback if no sections found (e.g. short article)
        if (topics.length === 0) {
            // Try to use the summary as a single topic
            const summary = $('#mw-content-text p').first().text().trim();
            if (summary) {
                topics.push({
                    id: crypto.randomUUID(),
                    title: pageTitle,
                    keywords: [query.toLowerCase()],
                    subtopics: [{
                        id: crypto.randomUUID(),
                        title: 'Genel Bakış',
                        keywords: ['overview'],
                        subtopics: []
                    }]
                });
            }
        }

        return NextResponse.json({
            success: true,
            source: 'Wikipedia',
            url: pageUrl,
            title: pageTitle,
            curriculum: topics
        });

    } catch (error: any) {
        console.error('[WikiCurriculum] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
