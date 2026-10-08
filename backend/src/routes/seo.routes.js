const express = require('express');
const pool = require('../config/db');

const router = express.Router();

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

router.get('/sitemap.xml', async (req, res, next) => {
  try {
    const site = (process.env.SITE_URL || 'http://localhost:5173').replace(/\/$/, '');
    const [rows] = await pool.query(
      "SELECT slug, updated_at FROM projects WHERE status = 'published' ORDER BY updated_at DESC"
    );

    const staticPaths = ['/', '/projects', '/news', '/about'];
    const urls = [
      ...staticPaths.map((p) => `  <url><loc>${esc(site + p)}</loc></url>`),
      ...rows.map((r) => {
        const lastmod = r.updated_at ? new Date(r.updated_at).toISOString() : null;
        return `  <url><loc>${esc(`${site}/project/${r.slug}`)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}</url>`;
      }),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    res.set('Cache-Control', 'public, max-age=3600');
    res.type('application/xml').send(xml);
  } catch (err) {
    next(err);
  }
});

module.exports = router;