# pixelcms.co.il — תוכנית חיבור דומיין (גשר מותג, רשמה #3)
נכון ל-10/07/2026.

## המצב
- האתר החי של המוצר: **https://dds.xvision.co.il** (repo `nirsala/pixel-cms-website` → Render).
- **pixelcms.co.il** בבעלותך אך אינו מפנה כרגע לאתר. כיום הוא מופיע רק בכתובות דוא"ל (`info@pixelcms.co.il`).
- xvision.co.il = אתר מסכי ה-LED (חומרה).

## אסטרטגיה מומלצת (שלב 1 — סיכון נמוך): 301 מ-pixelcms.co.il → dds.xvision.co.il
מטרה: שם המותג "Pixel CMS" יוביל ישירות למוצר, בלי לפצל אות'וריטי SEO. dds.xvision.co.il נשאר canonical — כל הדירוג שנצבר נשמר.

### אפשרות A — העברה ברמת ה-Registrar (הכי מהיר, ללא הוסטינג)
אם ל-registrar יש "URL Forwarding / Web Forwarding":
- `pixelcms.co.il`      → `https://dds.xvision.co.il`  (301 Permanent, Forward with masking = OFF)
- `www.pixelcms.co.il`  → `https://dds.xvision.co.il`  (301 Permanent)

### אפשרות B — דרך Cloudflare (שליטה מלאה, מומלץ)
1. להעביר את ה-nameservers של pixelcms.co.il ל-Cloudflare.
2. רשומות DNS:
   ```
   Type   Name   Content            Proxy
   A      @      192.0.2.1          Proxied   (IP דמה — ה-Redirect Rule יתפוס)
   CNAME  www    pixelcms.co.il     Proxied
   ```
3. Rules → Redirect Rules → כלל יחיד:
   - When incoming requests match: `Hostname` `contains` `pixelcms.co.il`
   - Then: Static redirect → `https://dds.xvision.co.il` , Status `301` , Preserve query string = ON

## אסטרטגיה חלופית (שלב 2 — אם תרצה ש-pixelcms.co.il יהיה ה-canonical)
זהו הרבה יותר מ-redirect — מיגרציה מלאה (מומלץ רק אם רוצים למתג מחדש):
1. Render → Service → Settings → Custom Domains → הוסף `pixelcms.co.il` + `www`.
2. Render ייתן רשומות לאימות, בדרך כלל:
   ```
   Type   Name   Content
   CNAME  www    <your-service>.onrender.com
   ALIAS/A @     <כפי ש-Render מציג>
   ```
3. לשנות בכל האתר `canonical`, `og:url`, sitemap, schema `url` מ-dds.xvision.co.il ל-pixelcms.co.il.
4. 301 מ-dds.xvision.co.il → pixelcms.co.il (היפוך הכיוון).
5. להגיש sitemap חדש ב-Google/Bing Search Console ולעקוב אחר המעבר.

> ההמלצה שלי: להתחיל מ**שלב 1 (301 → dds)**. זה נותן מיד את גשר המותג בלי סיכון לדירוג הקיים. מעבר מלא (שלב 2) רק כשתחליט למתג הכל מחדש.

## מה כבר בוצע בצד התוכן (גשר מותג דו-כיווני)
- קישורים צולבים dds.xvision.co.il ↔ xvision.co.il נוספו ל-nav ול-footer.
- הסכימה מציגה את Pixel CMS כ-`SoftwareApplication` עצמאי (לא נספח לחומרה).
