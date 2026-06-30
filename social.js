// ═══════════════════════════════════════════
//  SOCIAL MEDIA AUTO-POSTER
//  Facebook, Instagram, LinkedIn — Hebrew
// ═══════════════════════════════════════════
const cfg = require('./config');
const { getArticleImage } = require('./article-images');

const CAPTIONS = [
  `💡 מסכי LED מקצועיים לעסק שלך — חנויות, מסעדות, לובי ועוד.\nPixel by Keshet — הפתרון המושלם לשילוט דיגיטלי.\n📞 *9555\n#מסכיLED #שילוטדיגיטלי #עסקים`,
  `🔴 מסך LED בכניסה לעסק = רושם ראשוני שלא נשכח.\nPixel by Keshet — מומחים בשילוט דיגיטלי.\n📞 *9555\n#LED #PixelKeshet #שיווקדיגיטלי`,
  `✨ מסכי LED חיצוניים — פרסום שעובד 24/7, בכל מזג אוויר.\nעמיד, בהיר, ומושך עיניים.\n📞 *9555\n#מסכיLEDחיצוניים #שילוטחיצוני #פרסום`,
  `📺 ניהול תוכן מרחוק = שינוי מחירים, מבצעים, פרסומות — בלחיצת כפתור.\nמערכת CMS מתקדמת מבית Pixel.\n📞 *9555\n#CMS #שילוטדיגיטלי #טכנולוגיה`,
  `🏊 מסכי LED לבריכות — עמידים לחום ולחות, צבע מרהיב.\nהפתרון הייחודי שלנו לסביבות לחות.\n📞 *9555\n#מסכיבריכה #LEDלבריכה #PixelKeshet`,
  `💼 מהחנות הקטנה ועד רשת ארצית — אנחנו בשבילך.\nPixel by Keshet מתקין מסכי LED בכל הארץ.\n📞 *9555\n#מסכיLED #ישראל #עסקיםקטנים`,
  `🎯 רוצה לבלוט מהמתחרים? מסך LED זה התשובה.\nצבע, תנועה, מסר — מושכים לקוחות.\n📞 *9555\n#שילוטדיגיטלי #מסכיLED #שיווק`,
];


// ── LinkedIn Direct API — REST v20250101 ──────
// token: linkedin.com/developers → My Apps → OAuth 2.0 tools → get token
// Scopes needed: w_member_social, openid, profile
async function postToLinkedIn(topic, articleUrl, caption) {
  const token = process.env.LINKEDIN_ACCESS_TOKEN || '';
  if (!token) return { skipped: true, platform: 'LinkedIn', reason: 'אין LINKEDIN_ACCESS_TOKEN' };

  try {
    // קבל person URN דרך OpenID Connect
    const meRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'LinkedIn-Version': '20250101',
      }
    });
    if (!meRes.ok) return { ok: false, platform: 'LinkedIn', error: `auth: ${meRes.status}` };
    const me = await meRes.json();
    const urn = `urn:li:person:${me.sub}`;

    const postText = topic
      ? `📝 מאמר חדש: ${topic}\n\n${caption}\n\n👉 קרא עוד: ${articleUrl}`
      : caption;

    // LinkedIn REST API /rest/posts (חדש — מחליף את /v2/ugcPosts)
    const body = {
      author: urn,
      commentary: postText,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    };

    if (articleUrl) {
      body.content = {
        article: {
          source: articleUrl,
          title: topic || 'Pixel by Keshet — מסכי LED',
          description: caption.substring(0, 200)
        }
      };
    }

    const res = await fetch('https://api.linkedin.com/rest/posts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '20250101',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      return { ok: true, platform: 'LinkedIn', url: 'https://www.linkedin.com/feed/' };
    }
    const data = await res.json().catch(() => ({}));
    return { ok: false, platform: 'LinkedIn', error: `${res.status}: ${JSON.stringify(data)}` };
  } catch(e) {
    return { ok: false, platform: 'LinkedIn', error: e.message };
  }
}

async function postToSocial(topic, articleUrl) {
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
  const caption = CAPTIONS[dayOfYear % CAPTIONS.length];
  const imageUrl = getArticleImage(topic, articleUrl);

  // ── LinkedIn ישיר (ללא Ayrshare) ──
  const linkedinResult = await postToLinkedIn(topic, articleUrl, caption);
  if (linkedinResult.skipped) {
    console.log(`[social] LinkedIn: ${linkedinResult.reason}`);
  } else if (linkedinResult.ok) {
    console.log(`[social] ✅ LinkedIn: ${linkedinResult.url}`);
  } else {
    console.error(`[social] ❌ LinkedIn: ${linkedinResult.error}`);
  }

  if (!cfg.ayrshareApiKey) {
    console.log('[social] אין Ayrshare API Key — מדלג Facebook/Instagram');
    return linkedinResult.ok ? linkedinResult : { skipped: true };
  }

  const postText = topic
    ? `📝 מאמר חדש: ${topic}\n\n${caption}\n\n👉 קרא עוד: ${articleUrl}`
    : caption;

  try {
    const res = await fetch('https://app.ayrshare.com/api/post', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cfg.ayrshareApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        post: postText,
        platforms: ['facebook', 'instagram'],
        mediaUrls: [imageUrl],
      }),
    });
    const data = await res.json();
    console.log('[social] פורסם ברשתות חברתיות:', data.status || 'ok');
    return { ok: true, data };
  } catch(e) {
    console.error('[social] שגיאה:', e.message);
    return { ok: false, error: e.message };
  }
}

module.exports = { postToSocial };
