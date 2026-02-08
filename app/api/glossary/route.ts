import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get('topic');

    if (!topic) {
        return NextResponse.json({ success: false, error: 'No topic provided' }, { status: 400 });
    }

    try {
        // 1. Try Wikipedia TR
        const wikiUrl = `https://tr.wikipedia.org/wiki/${encodeURIComponent(topic)}`;
        console.log(`[Glossary] Fetching: ${wikiUrl}`);

        const res = await fetch(wikiUrl, {
            headers: { 'User-Agent': 'MasterTufanOS/1.0' }
        });

        if (!res.ok) {
            throw new Error('Wikipedia page not found');
        }

        const html = await res.text();
        const $ = cheerio.load(html);
        const terms: { term: string, tr: string, definition: string }[] = [];

        // Strategy 1: Look for Definition Lists (<dl>)
        $('dl').each((_, dl) => {
            const dt = $(dl).find('dt').first().text().trim();
            const dd = $(dl).find('dd').first().text().trim();
            if (dt && dd) {
                terms.push({
                    term: dt.replace(/\[.*?\]/g, ''), // Remove citations [1]
                    tr: dt, // Assume term is Turkish in TR wiki
                    definition: dd.replace(/\[.*?\]/g, '').substring(0, 200) + (dd.length > 200 ? '...' : '')
                });
            }
        });

        // Strategy 2: Look for Bold terms in Paragraphs (Usually first sentence definitions)
        // e.g. "PLC (Programmable Logic Controller), endüstriyel..."
        $('p').each((_, p) => {
            const bold = $(p).find('b').first().text().trim();
            const text = $(p).text().trim();
            if (bold && text.startsWith(bold) && text.length > 20) {
                // Clean up definition
                let def = text.substring(bold.length).trim();
                if (def.startsWith(',') || def.startsWith(';') || def.startsWith(':') || def.startsWith('-')) {
                    def = def.substring(1).trim();
                }
                // Remove citations
                def = def.replace(/\[.*?\]/g, '');

                terms.push({
                    term: bold,
                    tr: bold,
                    definition: def.substring(0, 150) + (def.length > 150 ? '...' : '')
                });
            }
        });

        // Strategy 3: Construct from "See Also" or "Konu başlıkları" if dictionary is empty
        // ... (Optional)

        // Filter valid terms
        const uniqueTerms = Array.from(new Set(terms.map(t => t.term))).map(term => {
            return terms.find(t => t.term === term);
        }).filter(t => t && t.term.length > 2 && t.definition.length > 10);

        return NextResponse.json({
            success: true,
            source: 'wikipedia-tr',
            terms: uniqueTerms.slice(0, 100)
        });

    } catch (error: any) {
        console.error(`[Glossary] Error: ${error.message}`);
        return NextResponse.json({ success: false, error: error.message });
    }
}
