// ═══════════════════════════════════════════
//  DIRECTORY SUBMISSION PINGER
//  ישראלי + בינלאומי + Google Maps
// ═══════════════════════════════════════════
const cfg = require('./config');

// דירקטוריות עסקיות — חלק עם רישום ידני חד-פעמי, חלק עם ping אוטומטי
const DIRECTORIES = [
  // ── ישראלי — Business Directories ─────────────
  { name: 'Google Business Profile', url: 'https://www.google.com/business/', ping: false, manual: 'https://www.google.com/business/' },
  { name: 'Bing Places', url: 'https://www.bingplaces.com/', ping: false, manual: 'https://www.bingplaces.com/' },
  { name: 'Apple Business Connect', url: 'https://businessconnect.apple.com/', ping: false, manual: 'https://businessconnect.apple.com/' },
  { name: 'Waze for Business', url: 'https://www.waze.com/business/', ping: false, manual: 'https://www.waze.com/business/' },
  { name: 'Zap Business', url: 'https://www.zap.co.il/', ping: true, manual: 'https://www.zap.co.il/' },
  { name: 'B144', url: 'https://www.b144.co.il/', ping: false, manual: 'https://www.b144.co.il/AddBusiness' },
  { name: 'D&B Israel', url: 'https://www.dnb.co.il/', ping: false, manual: 'https://www.dnb.co.il/' },
  { name: 'CheckID', url: 'https://en.checkid.co.il/', ping: false, manual: 'https://en.checkid.co.il/add-business' },
  { name: 'IsraeliYP', url: 'https://www.israeliyp.com/', ping: false, manual: 'https://www.israeliyp.com/add-listing' },
  { name: 'Snap Israel', url: 'https://snapisrael.com/', ping: false, manual: 'https://snapisrael.com/add' },
  { name: 'Easy Israel', url: 'https://www.easy.co.il/', ping: false, manual: 'https://www.easy.co.il/' },
  { name: 'Yelloo', url: 'https://www.yelloo.co.il/', ping: false, manual: 'https://www.yelloo.co.il/' },
  // ── International ─────────────────────────────
  { name: 'Foursquare', url: 'https://foursquare.com/', ping: false, manual: 'https://foursquare.com/add-place' },
  { name: 'Hotfrog', url: 'https://www.hotfrog.com/', ping: false, manual: 'https://www.hotfrog.com/AddBusiness.aspx' },
  { name: 'Cylex', url: 'https://www.cylex.us.com/', ping: false, manual: 'https://www.cylex.us.com/register' },
  { name: 'EZlocal', url: 'https://www.ezlocal.com/', ping: false, manual: 'https://www.ezlocal.com/addlisting.aspx' },
  { name: 'Trustpilot', url: 'https://www.trustpilot.com/', ping: false, manual: 'https://business.trustpilot.com/signup' },
  // ── Software/SaaS Listings ───────────────────
  { name: 'G2', url: 'https://www.g2.com/', ping: false, manual: 'https://www.g2.com/products/new' },
  { name: 'Capterra', url: 'https://www.capterra.com/', ping: false, manual: 'https://www.capterra.com/vendors/' },
  { name: 'GetApp', url: 'https://www.getapp.com/', ping: false, manual: 'https://www.getapp.com/vendors/' },
  { name: 'Software Advice', url: 'https://www.softwareadvice.com/', ping: false, manual: 'https://www.softwareadvice.com/vendor-resources/' },
  { name: 'Product Hunt', url: 'https://www.producthunt.com/', ping: false, manual: 'https://www.producthunt.com/posts/new' },
];

// IndexNow — מוצף מיידית ל-Google/Bing/Yandex
const PING_URLS = [
  `https://www.bing.com/indexnow?url=${encodeURIComponent(cfg.site.url)}&key=pixel2024seo`,
  `https://yandex.com/indexnow?url=${encodeURIComponent(cfg.site.url)}&key=pixel2024seo`,
  `https://api.indexnow.org/indexnow?url=${encodeURIComponent(cfg.site.url)}&key=pixel2024seo`,
  // Sitemap pings — מודיעים על עדכון
  `https://www.google.com/ping?sitemap=${encodeURIComponent(cfg.site.url + '/sitemap.xml')}`,
  `https://www.bing.com/ping?sitemap=${encodeURIComponent(cfg.site.url + '/sitemap.xml')}`,
];

async function pingDirectories(log) {
  log('info', `📋 שולח ping ל-${PING_URLS.length} מנועי חיפוש...`);

  let success = 0;
  for (const url of PING_URLS) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (res.status < 400) {
        success++;
        log('success', `✅ ${new URL(url).hostname} ${url.includes('sitemap') ? '(sitemap)' : '(IndexNow)'}`);
      } else {
        log('warn', `⚠️ ${new URL(url).hostname}: ${res.status}`);
      }
    } catch(e) {
      log('warn', `⚠️ ${url.slice(0,40)}: ${e.message.slice(0,50)}`);
    }
  }

  // הצג רשימה מקובצת לרישום ידני (חד-פעמי)
  const manualDirs = DIRECTORIES.filter(d => !d.ping && d.manual);
  if (manualDirs.length) {
    log('info', `📌 דירקטוריות לרישום ידני (פעם אחת):`);
    log('info', `   🗺️  Google Maps: ${manualDirs.find(d => d.name.includes('Google'))?.manual}`);
    log('info', `   🇮🇱 ${manualDirs.filter(d => d.url.includes('.co.il') || d.name.includes('Israel') || d.name.includes('Waze')).length} דירקטוריות ישראליות`);
    log('info', `   🌐 ${manualDirs.filter(d => !d.url.includes('.co.il') && !d.name.includes('Israel')).length} דירקטוריות בינלאומיות + SaaS`);
  }

  return { success, total: PING_URLS.length };
}

module.exports = { pingDirectories, DIRECTORIES };
