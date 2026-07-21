// ═══════════════════════════════════════════
//  REVIEWS — איסוף, מודרציה והצגת ביקורות לקוחות
//
//  עיקרון מנחה: AggregateRating נגזר אך ורק מביקורות אמיתיות שאושרו
//  ומוצגות בדף. אין מספר דירוג מקודד קשיח בשום מקום.
//  סימון דירוג בלי ביקורות גלויות מפר את מדיניות גוגל ועלול לגרור
//  manual action ("Spammy structured markup") על כל הדומיין.
// ═══════════════════════════════════════════

const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const STORE = path.join(__dirname, 'data', 'reviews.json');

function load() {
  try {
    return JSON.parse(fs.readFileSync(STORE, 'utf8')).reviews || [];
  } catch {
    return [];
  }
}

function save(reviews) {
  fs.mkdirSync(path.dirname(STORE), { recursive: true });
  fs.writeFileSync(STORE, JSON.stringify({ reviews }, null, 2), 'utf8');
}

const approved = () => load().filter(r => r.status === 'approved');

/** מחזיר JSON-LD רק כשיש ביקורות אמיתיות. אחרת — null, ובלי סכימה. */
function buildSchema() {
  const list = approved();
  if (list.length === 0) return null;

  const avg = list.reduce((s, r) => s + r.rating, 0) / list.length;

  return {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Pixel by Keshet — מערכת שילוט דיגיטלי',
    applicationCategory: 'BusinessApplication',
    url: 'https://dds.xvision.co.il/',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: avg.toFixed(1),
      reviewCount: String(list.length),
      bestRating: '5',
      worstRating: '1',
    },
    review: list.map(r => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.name },
      reviewRating: { '@type': 'Rating', ratingValue: String(r.rating), bestRating: '5' },
      reviewBody: r.text,
      datePublished: r.approvedAt || r.submittedAt,
    })),
  };
}

// הגבלת קצב פשוטה כדי שהטופס הציבורי לא יהפוך לצינור ספאם
const recent = new Map();
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 3;

function hits(ip) {
  const now = Date.now();
  return (recent.get(ip) || []).filter(t => now - t < WINDOW_MS);
}

const rateLimited = ip => hits(ip).length >= MAX_PER_WINDOW;

/** נרשם רק על הגשה שנשמרה בפועל — כך שגיאות ולידציה
 *  (טעות הקלדה, שדה חסר) לא נועלות לקוח לגיטימי מחוץ לטופס. */
function recordSubmission(ip) {
  recent.set(ip, [...hits(ip), Date.now()]);
}

function register(app, requireAuth) {
  // ── ציבורי: הגשת ביקורת ──
  app.post('/api/reviews', (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    if (rateLimited(ip)) {
      return res.status(429).json({ error: 'נשלחו יותר מדי בקשות. נסו שוב מאוחר יותר.' });
    }

    const name = String(req.body.name || '').trim().slice(0, 80);
    const company = String(req.body.company || '').trim().slice(0, 120);
    const text = String(req.body.text || '').trim().slice(0, 1500);
    const rating = Number(req.body.rating);

    if (!name || !text) return res.status(400).json({ error: 'שם וטקסט הביקורת הם שדות חובה' });
    if (text.length < 20) return res.status(400).json({ error: 'הביקורת קצרה מדי (מינימום 20 תווים)' });
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'דירוג חייב להיות מספר שלם בין 1 ל-5' });
    }

    const reviews = load();
    reviews.push({
      id: uuid(),
      name,
      company,
      rating,
      text,
      submittedAt: new Date().toISOString(),
      status: 'pending', // אף ביקורת לא מתפרסמת בלי אישור ידני
    });
    save(reviews);
    recordSubmission(ip);

    res.json({ ok: true, message: 'תודה! הביקורת התקבלה ותפורסם לאחר אישור.' });
  });

  // ── ציבורי: ביקורות מאושרות בלבד ──
  app.get('/api/reviews', (req, res) => {
    res.json({
      reviews: approved().map(({ name, company, rating, text, approvedAt, submittedAt }) => ({
        name, company, rating, text, date: approvedAt || submittedAt,
      })),
    });
  });

  // ── ציבורי: סכימה נגזרת ──
  app.get('/api/reviews/schema', (req, res) => res.json(buildSchema()));

  // ── מוגן: מודרציה ──
  app.get('/api/reviews/admin/all', requireAuth, (req, res) => res.json({ reviews: load() }));

  app.post('/api/reviews/admin/:id/:action', requireAuth, (req, res) => {
    const { id, action } = req.params;
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'פעולה לא חוקית' });
    }
    const reviews = load();
    const r = reviews.find(x => x.id === id);
    if (!r) return res.status(404).json({ error: 'ביקורת לא נמצאה' });

    r.status = action === 'approve' ? 'approved' : 'rejected';
    if (action === 'approve') r.approvedAt = new Date().toISOString();
    save(reviews);
    res.json({ ok: true, status: r.status });
  });
}

module.exports = { register, buildSchema, approved };
