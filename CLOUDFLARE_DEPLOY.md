# Cloudflare Pages Deployment Guide (Adım Adım Kurulum)

Bu projeyi Cloudflare üzerinde yayınlamak için aşağıdaki adımları takip edebilirsiniz. Cloudflare, Vercel'e alternatif olarak hem statik hem de dinamik (Edge) Next.js uygulamalarını barındırabilir.

## 1. Cloudflare Hesabı ve GitHub Bağlantısı
1. [Cloudflare Dashboard](https://dash.cloudflare.com) adresine gidin ve giriş yapın.
2. Sol menüden **Workers & Pages** sekmesine tıklayın.
3. **Create Application** butonuna basın.
4. **Pages** sekmesine geçin ve **Connect to Git** butonuna tıklayın.
5. GitHub hesabınızı bağlayın ve `master-plan` reposunu seçin.

## 2. Derleme Ayarları (Build Configuration) - KRİTİK!
Projenizin Next.js özelliklerini (API rotaları, SSR vb.) Cloudflare Edge üzerinde çalıştırmak için şu ayarları yapmalısınız:

- **Project Name:** `master-plan` (veya istediğiniz bir isim)
- **Production Branch:** `main`
- **Framework Preset:** `Next.js` seçin (Ancak aşağıdaki komutu elle gireceğiz).
- **Build Command:** `npx @cloudflare/next-on-pages@1`
- **Build Output Directory:** `.vercel/output/static`
- **Root Directory:** `/` (Varsayılan kalsın)

> **Önemli:** Eğer `Build Command` kısmına sadece `npm run build` yazarsanız, site statik olarak çalışmayabilir veya API rotaları hata verebilir. `@cloudflare/next-on-pages` modern adaptördür.

### Çevresel Değişkenler (Environment Variables)
Projenizin çalışması için `.env.local` dosyasındaki anahtarları Cloudflare'e eklemelisiniz:
- **Settings > Environment Variables** menüsünden:
  - `NEXT_PUBLIC_GEMINI_API_KEY`: (Sizin API anahtarınız)
  - `NEXT_PUBLIC_SUPABASE_URL`: (Varsa)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Varsa)
  - `NEXT_PUBLIC_UNSPLASH_ACCESS_KEY`: (Varsa)

### Uyumluluk Bayrağı (Compatibility Flags)
Next.js'in bazı Node.js özelliklerini Edge üzerinde çalıştırabilmesi için:
- **Settings > Functions > Compatibility Flags** kısmına gidin.
- **Production Compatibility Date:** Bugünün tarihini seçin.
- **Compatibility Flags:** `nodejs_compat` ekleyin.

## 3. Alan Adı (Domain) Ayarları
Cloudflare size varsayılan olarak `https://master-plan.pages.dev` gibi ücretsiz bir alt alan adı verir. Kendi alan adınızı (örn: `ahmetmehmet.com`) kullanmak isterseniz:

1. **Pages** projenizin içinde **Custom Domains** sekmesine gidin.
2. **Set up a custom domain** butonuna tıklayın.
3. Alan adınızı yazın (örn: `mastertufan.com`).
4. Cloudflare size DNS kayıtlarını verecektir (Eğer domain Cloudflare üzerindeyse otomatik, başka yerdeyse CNAME kaydı eklemeniz gerekir).
   - **Type:** CNAME
   - **Name:** `www` veya `@` (root)
   - **Target:** `master-plan.pages.dev`

## Vercel vs Cloudflare Uyarıları
- **Vercel:** Next.js'in yaratıcısı olduğu için "sıfır ayar" ile en uyumlu platformdur. Node.js fonksiyonları (API routes) daha esnek çalışır.
- **Cloudflare Pages:** "Edge Runtime" kullanır. API rotalarınız çok ağır işlem (uzun süren scraping vb.) yapıyorsa zaman aşımına (timeout) uğrayabilir veya bazı Node.js kütüphaneleri çalışmayabilir.
  - Eğer API hataları alırsanız, `next.config.mjs` içinde `runtime: 'edge'` ayarını kontrol etmeniz gerekebilir veya Vercel'de kalmanız daha stabil olabilir.

Başarılar!
