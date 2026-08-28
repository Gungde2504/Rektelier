const slugify = require('slugify');
const pool = require('../config/db');

async function generateUniqueSlug(title, table = 'projects') {
  const allowedTables = ['projects', 'news'];
  if (!allowedTables.includes(table)) {
    throw new Error('Tabel tidak valid untuk slug');
  }
  const baseSlug = slugify(title, { lower: true, strict: true });
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const [rows] = await pool.query(`SELECT id FROM ${table} WHERE slug = ?`, [slug]);
    if (rows.length === 0) break;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

module.exports = generateUniqueSlug;