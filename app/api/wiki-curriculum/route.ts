import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Force dynamic to avoid stale results
export const dynamic = 'force-dynamic';

const fetchAndParse = async (url: string, lang: string): Promise<any[]> => {
    try {
        const res = await fetch(url);
        const html = await res.text();
        const $ = cheerio.load(html);
        const topics: any[] = [];
        let currentH2: any = null;
        let currentH3: any = null;

        $('#mw-content-text').find('h2, h3, h4').each((i, el) => {
            const tag = $(el).get(0)?.tagName.toLowerCase();
            if (!tag) return;
            const $el = $(el);
            let title = $el.find('.mw-headline').text().trim() || $el.text().trim().replace(/\[.*?\]/g, '');
            title = title.replace(/^\d+(\.\d+)*\s*/, '');

            // Clean specific chars
            title = title.replace(/¶/g, '').trim();

            if (['Kaynakça', 'References', 'See also', 'Ayrıca bakınız', 'External links', 'Dış bağlantılar', 'Notes', 'Notlar', 'Further reading', 'Konuyla ilgili yayınlar', 'Gallery', 'Galeri'].includes(title)) return;

            // Check for Main Article link immediately after heading (recursive expansion trigger)
            let mainArticleUrl = null;
            let nextNode = $el.next();
            // Scan next few elements to find a "hatnote" or "main article" link
            let scanLimit = 5;
            while (nextNode.length && scanLimit > 0 && !['h2', 'h3', 'h4'].includes(nextNode.get(0)?.tagName.toLowerCase() || '')) {
                if (nextNode.hasClass('hatnote') || nextNode.find('.hatnote').length || nextNode.text().includes('Main article:') || nextNode.text().includes('Ana madde:')) {
                    const link = nextNode.find('a').first().attr('href');
                    if (link && link.startsWith('/wiki/')) {
                        mainArticleUrl = `https://${lang}.wikipedia.org${link}`;
                    }
                    break;
                }
                nextNode = nextNode.next();
                scanLimit--;
            }

            const newItem: any = {
                id: crypto.randomUUID(),
                title: title,
                keywords: [title.toLowerCase()],
                subtopics: [],
                mainArticleUrl: mainArticleUrl // Tag for expansion
            };

            if (tag === 'h2') {
                newItem.level = 1;
                currentH2 = newItem;
                currentH3 = null;
                topics.push(currentH2);
            } else if (tag === 'h3') {
                if (!currentH2) return;
                newItem.level = 2;
                currentH3 = newItem;
                currentH2.subtopics.push(currentH3);
            } else if (tag === 'h4') {
                newItem.level = 3;
                if (currentH3) currentH3.subtopics.push(newItem);
                else if (currentH2) currentH2.subtopics.push(newItem);
            }
        });
        return topics;
    } catch (e) {
        console.error('Sub-fetch error', e);
        return [];
    }
};

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('query');
    const lang = searchParams.get('lang') || 'tr';

    if (!query) return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });

    try {
        console.log(`[WikiCurriculum] 4x Expansion Mode: ${query} in ${lang}`);

        // 1. Search Main Page
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
        // Construct clean URL
        const pageUrl = `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, '_'))}`;

        console.log(`[WikiCurriculum] Found main page: ${pageTitle}`);

        // 2. Parse Main Page
        const mainTopics = await fetchAndParse(pageUrl, lang);

        // 3. Recursive Expansion (Max 8 main sections to avoid timeout)
        const expansionPromises = mainTopics.slice(0, 8).map(async (topic) => {
            if (topic.mainArticleUrl) {
                console.log(`[WikiCurriculum] Expanding: ${topic.title} -> ${topic.mainArticleUrl}`);
                const subTopics = await fetchAndParse(topic.mainArticleUrl, lang);

                if (subTopics.length > 0) {
                    // Shift levels down for sub-content
                    const deeperTopics = subTopics.map(st => ({
                        ...st,
                        level: (topic.level || 1) + 1,
                        subtopics: st.subtopics?.map((sub: any) => ({ ...sub, level: (sub.level || 2) + 1 }))
                    }));
                    // Append sub-merged topics
                    topic.subtopics = [...topic.subtopics, ...deeperTopics];
                }
            }
            return topic;
        });

        await Promise.all(expansionPromises);

        // Cleanup internal fields (remove mainArticleUrl before sending to client)
        const clean = (list: any[]): any[] => list.map(item => {
            const { mainArticleUrl, ...rest } = item;
            if (rest.subtopics) rest.subtopics = clean(rest.subtopics);
            return rest;
        });

        // If practically empty, try fallback
        if (mainTopics.length === 0) {
            return NextResponse.json({
                success: true,
                source: 'Wikipedia (Lite)',
                url: pageUrl,
                title: pageTitle,
                curriculum: [{
                    id: crypto.randomUUID(),
                    title: pageTitle,
                    keywords: [query.toLowerCase()],
                    subtopics: [{ id: crypto.randomUUID(), title: 'Genel Bakış', keywords: ['overview'], subtopics: [] }]
                }]
            });
        }

        return NextResponse.json({
            success: true,
            source: 'Wikipedia (Deep Scan 4x)',
            url: pageUrl,
            title: pageTitle,
            curriculum: clean(mainTopics)
        });

    } catch (error: any) {
        console.error('[WikiCurriculum] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
