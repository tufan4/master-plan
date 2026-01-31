import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic'; // No caching

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
        return NextResponse.json({ success: false, error: 'No URL provided' }, { status: 400 });
    }

    try {
        console.log(`[DeepDive] Diving into: ${targetUrl}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const res = await fetch(targetUrl, {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml'
            }
        });
        clearTimeout(timeoutId);

        if (!res.ok) {
            throw new Error(`Failed to fetch: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract all valid links
        const links: string[] = [];
        $('a').each((_, element) => {
            const href = $(element).attr('href');
            if (!href) return;

            // Resolve relative URLs
            let fullUrl: string;
            try {
                fullUrl = new URL(href, targetUrl).toString();
            } catch (e) {
                return; // Invalid URL
            }

            // FILTERING LOGIC
            const lower = fullUrl.toLowerCase();
            if (
                !lower.startsWith('http') ||
                lower.includes('login') ||
                lower.includes('signup') ||
                lower.includes('signin') ||
                lower.includes('facebook.com') ||
                lower.includes('twitter.com') ||
                lower.includes('linkedin.com/share') ||
                lower.includes('policy') ||
                lower.includes('terms')
            ) {
                return;
            }

            links.push(fullUrl);
        });

        if (links.length === 0) {
            throw new Error('No valid sub-links found');
        }

        // Shuffle and Pick One
        const randomLink = links[Math.floor(Math.random() * links.length)];

        console.log(`[DeepDive] Found ${links.length} links. Selected: ${randomLink}`);

        return NextResponse.json({
            success: true,
            originalUrl: targetUrl,
            deepUrl: randomLink,
            linkCount: links.length
        });

    } catch (error: any) {
        console.error(`[DeepDive] Error: ${error.message}`);
        // Fallback: Just return the original URL if we couldn't dive deeper
        return NextResponse.json({
            success: false,
            originalUrl: targetUrl,
            error: error.message
        });
    }
}
