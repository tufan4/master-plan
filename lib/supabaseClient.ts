// Pure LocalStorage-based client - No Supabase dependency

// Cache images to localStorage
export function cacheImage(topicId: string, images: string[]) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(`mt_images_${topicId}`, JSON.stringify(images));
    } catch (err) {
        console.error('Image cache failed:', err);
    }
}

// Get cached images
export function getCachedImages(topicId: string): string[] | null {
    if (typeof window === 'undefined') return null;
    try {
        const cached = localStorage.getItem(`mt_images_${topicId}`);
        return cached ? JSON.parse(cached) : null;
    } catch (err) {
        return null;
    }
}
