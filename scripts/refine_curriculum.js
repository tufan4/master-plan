const fs = require('fs');
const path = require('path');

const curriculumPath = path.join(__dirname, '../data/master-curriculum.json');
const rawData = fs.readFileSync(curriculumPath);
const curriculum = JSON.parse(rawData);

function cleanString(str) {
    return str.replace(/[^\w\s]/gi, '').trim();
}

function expandAcronym(title, parentTitle) {
    // Basic heuristics for short uppercase titles
    if (title.length <= 5 && title === title.toUpperCase() && !title.includes(' ')) {
        return `${title} (${parentTitle})`; // e.g., "CNN (Derin Öğrenme)"
    }
    return title;
}

function refineEnTerm(enTerm, parentEn, grandParentEn) {
    if (!enTerm) return parentEn;

    // Normalize
    const current = enTerm.toLowerCase();
    const parent = parentEn ? parentEn.toLowerCase() : '';

    // If current term is very specific/long, it might be enough
    if (current.split(' ').length > 3) return enTerm;

    // If current term is just an acronym (e.g. "CNN"), expand it if possible using keywords (handled by logic before calling this)
    // But here we are combining with parent.

    // If parent is already in current, don't add
    if (current.includes(parent)) return enTerm;

    // Combine: Parent + Current
    // "Machine Learning" + "Supervised" -> "Machine Learning Supervised"
    // "Deep Learning" + "CNN" -> "Deep Learning CNN" (If en was just CNN, but hopefully it is Convolutional...)

    return `${parentEn} ${enTerm}`;
}

// Traverse and Update
curriculum.categories.forEach(category => {
    // Category doesn't have a parent topic, but has a title.
    const catEn = category.en || category.title; // Fallback

    category.topics.forEach(topic => {
        const topicEn = topic.en || topic.title;

        // Ensure topic EN is descriptive? 
        // Usually topics are "Matrices", "Integrals". Good enough.

        topic.subtopics.forEach(sub => {
            // 1. IMPROVE TR Title (Disambiguate Acronyms)
            // Only if it looks like a raw acronym
            const originalTitle = sub.title;
            // Clean title for checking
            const isAcronym = originalTitle.length <= 5 && originalTitle.match(/^[A-Z0-9\-]+$/);

            if (isAcronym) {
                // e.g. "CNN", "SLAM", "PLC"
                // Append parent topic title for context in UI
                // "CNN" -> "CNN (Derin Öğrenme)"
                if (!sub.title.includes('(')) {
                    sub.title = `${originalTitle} (${topic.title})`;
                }
            }

            // 2. IMPROVE EN Search Term (Contextualize)
            // Use the existing 'en' field (which we filled with keywords previously) OR the first keyword.
            let baseEn = sub.en;
            if (!baseEn || baseEn === sub.title) {
                baseEn = sub.keywords && sub.keywords.length > 0 ? sub.keywords[0] : sub.title;
            }

            // Refine: Prepend Parent Topic English Name
            // avoid duplication
            if (!baseEn.toLowerCase().includes(topicEn.toLowerCase())) {
                sub.en = `${topicEn} ${baseEn}`;
            } else {
                sub.en = baseEn;
            }

            // Special Replacements / Expansions checks
            // If the final string is still just an acronym, force expansion from keywords if available
            if (sub.en.length < 5 && sub.keywords.length > 1) {
                // Try to find a longer keyword
                const longKeyword = sub.keywords.find(k => k.length > 5);
                if (longKeyword) {
                    sub.en = `${topicEn} ${longKeyword}`;
                }
            }

            console.log(`Updated: ${originalTitle} -> ${sub.title} | Search: ${sub.en}`);
        });
    });
});

fs.writeFileSync(curriculumPath, JSON.stringify(curriculum, null, 4));
console.log('Curriculum Refinement Complete.');
