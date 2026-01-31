# 🎓 MASTER TUFAN OS

**Bir Emre Tufan Klasiği...**

Modern mühendislik eğitimini AI destekli, dinamik bir araştırma istasyonuna dönüştüren next-generation öğrenme platformu.

---

## 🚀 PROJE KİMLİĞİ

**Geliştirici:** Emre Tufan  
**Bölüm:** Kontrol ve Otomasyon Mühendisliği  
**Vizyon:** Mühendislik kütüphanesini statik bir klasör yapısından çıkarıp, AI destekli dinamik bir araştırma istasyonuna dönüştürmek.

---

## 📐 SİSTEM MİMARİSİ

### L0 - Mekatronik Çekirdek (Core)
Sistemin görsel kimliği, tüm parçaları otonom hareket edebilen SVG tabanlı bir logo ile temsil edilir. Dişli çarklar ve devre yolları, mühendislik disiplinlerinin (Mekanik + Elektronik) birleşimini simgeler.

### L1 - Dinamik Klasör Hiyerarşisi
- **Sol Panel:** Ana disiplinler (Matematik, PLC, Elektronik vb.) burada sabitlenmiştir
- **Merkezi Akordiyon:** 277+ alt konu başlığı, hiyerarşik bir ağaç yapısında sıralanır
- Her düğüm (node) tıklandığında, ilgili alt katmanları otonom olarak genişletir

### L2 - AI Araştırma Katmanı (The Engine)
- **Gemini 1.5 Integration:** "Özelden Genele" (Specific to General) mantığıyla 50 adet teknik anahtar kelime üretir
- **Contextual UI:** Wikipedia, Reddit ve YouTube modülleri, platformlar arası derin arama yapar
- **Smart Caching:** localStorage + Supabase ile API kullanımını optimize eder

### L3 - Görsel İstihbarat Modülü
- **Unsplash Injection:** 0-25 eşik aralığında, doğrudan API üzerinden çekilen "Raw Image" galerisi
- Teknik kavramların zihinde canlanması için optimize edilmiş görsel akış

### L4 - Veri Kalıcılığı (Cloud Sync)
- **Supabase Database:** Kullanıcının eklediği linkler, tamamladığı dersler ve kişiselleştirilmiş ayarlar
- Offline-first architecture ile cihaz değişse de mühendislik hafızası silinmez

---

## ✨ ÖZELLİKLER

### 🎯 Core Features
- ✅ **277+ Engineering Topics** - 7 ana kategori, 162 ana konu, 115 alt konu
- ✅ **55-Term Dictionary** - Alphabetically sorted, searchable engineering glossary
- ✅ **Global Prefix Search** - Instant topic discovery with auto-expand
- ✅ **Progress Tracking** - Real-time completion percentage with cloud sync

### 🤖 AI Intelligence
- ✅ **Gemini API Integration** - Dynamic keyword generation (0-50 threshold)
- ✅ **Unsplash API** - Direct image preview (0-25 threshold)
- ✅ **Smart Caching** - Memory + localStorage + Supabase triple-layer cache
- ✅ **TR/EN Language Toggle** - Bilingual keyword support

### 📱 Mobile-Ready
- ✅ **Responsive Design** - Desktop, tablet, mobile optimized
- ✅ **Hamburger Menu** - Touch-friendly mobile navigation
- ✅ **Touch Optimization** - 44px minimum touch targets
- ✅ **Viewport-based Typography** - Prevents text overflow on small screens

### 🔒 Data Management
- ✅ **Supabase Sync** - Real-time cloud sync for completed topics
- ✅ **Offline Support** - localStorage fallback when offline
- ✅ **Data Recovery** - Supabase → localStorage → Default priority

---

## 🛠️ TEKNOLOJ İ STACK

```json
{
  "Framework": "Next.js 16.1.6 (Turbopack)",
  "Language": "TypeScript",
  "Styling": "Tailwind CSS",
  "Animation": "Framer Motion",
  "Icons": "Lucide React",
  "AI": "Google Gemini 1.5",
  "Images": "Unsplash API",
  "Database": "Supabase",
  "Fonts": ["Inter", "Dancing Script"]
}
```

---

## 📦 KURULUM

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
```

### Installation
```bash
# Clone repository
git clone https://github.com/emretufan/master-tufan-os.git
cd master-tufan-os

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

---

## 🔑 ENVIRONMENT VARIABLES

Create a `.env.local` file in the root directory:

```env
# Gemini AI
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Unsplash
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API Key Sources
- **Gemini:** https://makersuite.google.com/app/apikey
- **Unsplash:** https://unsplash.com/developers
- **Supabase:** https://supabase.com/dashboard

---

## 🗄️ SUPABASE SETUP

Create the following table in your Supabase project:

```sql
CREATE TABLE user_progress (
    id TEXT PRIMARY KEY,
    completed_topics JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy (for development - adjust for production)
CREATE POLICY "Enable all access for authenticated users"
ON user_progress
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);
```

---

## 🚀 DEPLOYMENT (VERCEL)

### One-Click Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/emretufan/master-tufan-os)

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

### Production Checklist
- ✅ All environment variables set
- ✅ Supabase table created
- ✅ API keys validated
- ✅ Build successful (`npm run build`)
- ✅ Images loading (Unsplash domains configured)

---

## 📱 MOBILE OPTIMIZATION

### Touch-Friendly
- Minimum 44px touch targets
- Smooth scrolling with momentum
- Optimized font scaling (clamp)

### Responsive Breakpoints
```css
/* Mobile: < 640px */
/* Tablet: 640px - 1024px */
/* Desktop: > 1024px */
```

### Performance
- Code splitting with dynamic imports
- Image optimization with Next.js Image
- Lazy loading for modals
- Debounced search input

---

## 🎨 DESIGN SYSTEM

### Colors
```css
Primary: Amber (#fbbf24)
Secondary: Blue (#3b82f6)
Success: Emerald (#10b981)
Background: Slate (#0f172a)
```

### Typography
```css
Headings: Inter (Black/Bold)
Body: Inter (Regular)
Accent: Dancing Script (Italic)
```

---

## 🔍 FEATURES DEEP DIVE

### 1. Global Search
- **Prefix Matching:** Instant results as you type
- **Auto-Expand:** Matching folders automatically open
- **Dictionary Search:** Searches terms, translations, and categories
- **Real-time:** Zero latency with client-side filtering

### 2. AI Keyword Generation
```typescript
Flow:
1. Check memory cache → 2. Check localStorage
3. If needed, call Gemini API
4. Generate 50 keywords (Specific → General)
5. Cache results (memory + localStorage)
6. Display with staggered animation
```

### 3. Image Gallery
```typescript
Flow:
1. Check cache (getCachedImages)
2. If needed, fetch from Unsplash API
3. Display in 3x3 responsive grid
4. Cache URLs for future use
5. Fallback to placeholders on error
```

### 4. Progress Tracking
```typescript
Flow:
1. On page load: Fetch from Supabase
2. If offline: Fallback to localStorage
3. On topic completion: Update both stores
4. Background sync when online
```

---

## 📊 PROJECT STATS

| Metric | Value |
|--------|-------|
| Total Topics | 277 |
| Categories | 7 |
| Dictionary Terms | 55 |
| Platforms | 5 |
| Max Keywords | 50 |
| Max Images | 25 |
| Code Lines | ~2000 |
| Components | 8 |

---

## 🤝 CONTRIBUTING

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 LICENSE

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 📞 CONTACT

**Emre Tufan**  
📧 Email: your.email@example.com  
🔗 LinkedIn: [linkedin.com/in/emretufan](https://linkedin.com/in/emretufan)  
📷 Instagram: [@emretufan](https://instagram.com/emretufan)

---

## 🙏 ACKNOWLEDGMENTS

- **Google Gemini** - AI-powered keyword generation
- **Unsplash** - High-quality engineering images
- **Supabase** - Real-time database and authentication
- **Next.js Team** - Amazing React framework
- **Framer Motion** - Beautiful animations
- **Vercel** - Seamless deployment

---

## 🎯 ROADMAP

- [ ] User authentication (email/Google/GitHub)
- [ ] Personal notes per topic
- [ ] Export progress as PDF report
- [ ] Dark/Light theme toggle
- [ ] Custom API for keyword generation
- [ ] Multi-language support (TR/EN/DE)
- [ ] Voice search integration
- [ ] Collaborative study rooms
- [ ] Gamification (badges, streaks)
- [ ] Mobile app (React Native)

---

<div align="center">

**Bir Emre Tufan Klasiği...**

Made with ❤️ by [Emre Tufan](https://github.com/emretufan)

⭐ Star this repo if you find it useful!

</div>
