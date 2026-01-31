const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../data/master-curriculum.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const curriculum = JSON.parse(rawData);

// Expanded Manual Translations including categories 5, 6, 7 and their subtopics
const manualTranslations = {
    // === CATEGORIES (X.0) ===
    "1.0": "Mathematical Foundations",
    "2.0": "Limits, Derivatives, and Integrals",
    "3.0": "Physics and Material Science",
    "4.0": "Electricity and Electronics",
    "5.0": "Software Engineering",
    "6.0": "Control Systems and Automation",
    "7.0": "AI and Machine Learning",

    // === TOPICS (X.Y) ===
    "1.1": "Number Sets and Processing Ability",
    "1.2": "Divisibility and Prime Factors",
    "1.3": "Polynomials and Identities",
    "1.4": "Exponential and Logarithmic Functions",

    "2.1": "Limits and Continuity",
    "2.2": "Derivatives",
    "2.3": "Integrals",
    "2.4": "Differential Equations",

    "3.1": "Mechanics",
    "3.2": "Electromagnetism",
    "3.3": "Material Science",

    "4.1": "Circuit Analysis",
    "4.2": "Semiconductors",
    "4.3": "Analog Electronics", // Hypothetical/Checked
    "4.4": "Digital Electronics", // Hypothetical/Checked

    "5.1": "Algorithms and Data Structures",
    "5.2": "Object Oriented Programming",
    "5.3": "Databases",

    "6.1": "Signals and Systems",
    "6.2": "Control Systems",
    "6.3": "PLC and Industrial Automation",

    "7.1": "Machine Learning",
    "7.2": "Deep Learning",
    "7.3": "Computer Vision",
    "7.4": "Autonomous Systems"
};

function processItem(item) {
    // 1. Try manual translation first
    if (manualTranslations[item.id]) {
        item.en = manualTranslations[item.id];
    }
    // 2. Try first keyword if available AND no 'en' set yet (or override logic)
    // If 'en' is missing, set it from keywords
    else if (!item.en && item.keywords && item.keywords.length > 0) {
        item.en = item.keywords[0];
    }
    // 3. Keep original if nothing found (fallback)
    else if (!item.en) {
        item.en = item.title;
        console.warn(`[Still Missing] ID: ${item.id}, Title: ${item.title}`);
    }

    // Process children recursively
    if (item.topics) {
        item.topics.forEach(processItem);
    }
    if (item.subtopics) {
        item.subtopics.forEach(processItem);
    }
}

// Process all categories
curriculum.categories.forEach(processItem);

// Write back
fs.writeFileSync(filePath, JSON.stringify(curriculum, null, 4), 'utf-8');
console.log("Updated master-curriculum.json with complete 'en' titles.");
