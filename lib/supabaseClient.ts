import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Sync completed topics to Supabase
export async function syncCompletedTopics(completedIds: string[]) {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .upsert({
                id: 'default_user', // Replace with actual user ID when auth is added
                completed_topics: completedIds,
                updated_at: new Date().toISOString()
            });

        if (error) console.error('Supabase sync error:', error);
        return { data, error };
    } catch (err) {
        console.error('Sync failed:', err);
        return { data: null, error: err };
    }
}

// Fetch completed topics from Supabase
export async function fetchCompletedTopics(): Promise<string[]> {
    try {
        const { data, error } = await supabase
            .from('user_progress')
            .select('completed_topics')
            .eq('id', 'default_user')
            .single();

        if (error || !data) return [];
        return data.completed_topics || [];
    } catch (err) {
        console.error('Fetch failed:', err);
        return [];
    }
}

// Cache images to localStorage
export function cacheImage(topicId: string, images: string[]) {
    try {
        localStorage.setItem(`images_${topicId}`, JSON.stringify(images));
    } catch (err) {
        console.error('Cache failed:', err);
    }
}

// Get cached images
export function getCachedImages(topicId: string): string[] | null {
    try {
        const cached = localStorage.getItem(`images_${topicId}`);
        return cached ? JSON.parse(cached) : null;
    } catch (err) {
        return null;
    }
}

// Cache keywords
export function cacheKeywords(topicId: string, keywords: string[]) {
    try {
        localStorage.setItem(`keywords_${topicId}`, JSON.stringify(keywords));
    } catch (err) {
        console.error('Cache failed:', err);
    }
}

// Get cached keywords
export function getCachedKeywords(topicId: string): string[] | null {
    try {
        const cached = localStorage.getItem(`keywords_${topicId}`);
        return cached ? JSON.parse(cached) : null;
    } catch (err) {
        return null;
    }
}
