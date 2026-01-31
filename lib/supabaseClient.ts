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
    if (typeof window !== 'undefined') {
        try {
            localStorage.setItem(`keywords_${topicId}`, JSON.stringify(keywords));
        } catch (err) {
            console.error('Cache failed:', err);
        }
    }
}

// Get cached keywords
export function getCachedKeywords(topicId: string): string[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(`keywords_${topicId}`);
        return cached ? JSON.parse(cached) : null;
    } catch (err) {
        return null;
    }
}

// ==================== LINK EMBEDDING SYSTEM ====================

export interface SavedLink {
    id: string;
    topic_id: string;
    title: string;
    url: string;
    platform: string;
    created_at?: string;
}

export async function saveLink(link: Omit<SavedLink, 'id' | 'created_at'>): Promise<SavedLink | null> {
    const newLink = { ...link, id: crypto.randomUUID(), created_at: new Date().toISOString() };

    // 1. LocalStorage (Immediate UI update & Offline support)
    if (typeof window !== 'undefined') {
        try {
            const existing = JSON.parse(localStorage.getItem('saved_links') || '[]');
            const updated = [...existing, newLink];
            localStorage.setItem('saved_links', JSON.stringify(updated));
        } catch (e) {
            console.error("Local save failed", e);
        }
    }

    // 2. Supabase (Cloud Sync)
    try {
        const { error } = await supabase
            .from('saved_links')
            .insert([{
                user_id: 'default_user',
                topic_id: link.topic_id,
                title: link.title,
                url: link.url,
                platform: link.platform
            }]);

        if (error) throw error;
    } catch (err) {
        console.warn('Supabase link save failed (falling back to local):', err);
    }

    return newLink;
}

export async function getSavedLinks(topicId: string): Promise<SavedLink[]> {
    // 1. Try Supabase first
    try {
        const { data, error } = await supabase
            .from('saved_links')
            .select('*')
            .eq('user_id', 'default_user')
            .eq('topic_id', topicId);

        if (!error && data) return data;
    } catch (err) {
        // Silent fail to local
    }

    // 2. Fallback to LocalStorage
    if (typeof window !== 'undefined') {
        try {
            const all = JSON.parse(localStorage.getItem('saved_links') || '[]');
            return all.filter((l: SavedLink) => l.topic_id === topicId);
        } catch (e) {
            return [];
        }
    }
    return [];
}

export async function deleteLink(id: string) {
    // Local
    if (typeof window !== 'undefined') {
        try {
            const all = JSON.parse(localStorage.getItem('saved_links') || '[]');
            const filtered = all.filter((l: SavedLink) => l.id !== id);
            localStorage.setItem('saved_links', JSON.stringify(filtered));
        } catch (e) { }
    }

    // Cloud
    try {
        await supabase.from('saved_links').delete().eq('id', id);
    } catch (e) { }
}
