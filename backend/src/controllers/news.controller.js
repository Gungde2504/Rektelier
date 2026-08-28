const pool = require('../config/db');
const generateUniqueSlug = require('../utils/slug');

async function getPublishedNews(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT id, title, slug, news_date, content, cover_image, external_link
       FROM news WHERE status = 'published'
       ORDER BY news_date DESC, created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getNewsBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM news WHERE slug = ? AND status = 'published'`,
      [slug]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function submitNews(req, res, next) {
  try {
    const { title, news_date, content, external_link, submitted_by_name, submitted_by_email } = req.body;
    if (!title || !submitted_by_name || !submitted_by_email) {
      return res.status(400).json({ error: 'Judul, nama, dan email pengirim wajib diisi' });
    }
    const files = req.files || {};
    const coverFile = files.cover ? files.cover[0] : null;
    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : null;
    const slug = await generateUniqueSlug(title, 'news');
    await pool.query(
      `INSERT INTO news (title, slug, news_date, content, cover_image, external_link, status, submitted_by_name, submitted_by_email)
       VALUES (?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [title, slug, news_date || null, content || null, coverUrl, external_link || null, submitted_by_name, submitted_by_email]
    );
    res.status(201).json({ message: 'Berita berhasil dikirim dan akan direview sebelum tayang', slug });
  } catch (err) {
    next(err);
  }
}

async function getAllNewsAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(`SELECT * FROM news ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getNewsByIdAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
}

async function updateNews(req, res, next) {
  try {
    const { id } = req.params;
    const { title, news_date, content, external_link } = req.body;
    const [existing] = await pool.query('SELECT * FROM news WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    const files = req.files || {};
    const coverFile = files.cover ? files.cover[0] : null;
    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : existing[0].cover_image;
    await pool.query(
      `UPDATE news SET title = ?, news_date = ?, content = ?, external_link = ?, cover_image = ? WHERE id = ?`,
      [
        title || existing[0].title,
        news_date || existing[0].news_date,
        content || existing[0].content,
        external_link || existing[0].external_link,
        coverUrl,
        id,
      ]
    );
    res.json({ message: 'Berita berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
}

async function updateNewsStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    const [result] = await pool.query('UPDATE news SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json({ message: `Status berita diubah menjadi ${status}` });
  } catch (err) {
    next(err);
  }
}

async function deleteNews(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM news WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Berita tidak ditemukan' });
    }
    res.json({ message: 'Berita berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublishedNews,
  getNewsBySlug,
  submitNews,
  getAllNewsAdmin,
  getNewsByIdAdmin,
  updateNews,
  updateNewsStatus,
  deleteNews,
};