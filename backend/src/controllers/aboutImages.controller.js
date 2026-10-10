const fs = require('fs');
const path = require('path');
const pool = require('../config/db');

const MAX_IMAGES = 5;
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Tabel dibuat otomatis kalau belum ada, jadi database lama tidak perlu migrasi manual.
let tableReady = null;
function ensureTable() {
  if (!tableReady) {
    tableReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS about_images (
          id INT AUTO_INCREMENT PRIMARY KEY,
          image_url VARCHAR(500) NOT NULL,
          sort_order INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )`
      )
      .catch((err) => {
        tableReady = null;
        throw err;
      });
  }
  return tableReady;
}

async function removeFiles(files) {
  await Promise.all(
    files.map((f) => fs.promises.unlink(f.path || f).catch(() => {}))
  );
}

async function getAboutImages(req, res, next) {
  try {
    await ensureTable();
    const [rows] = await pool.query(
      'SELECT id, image_url, sort_order FROM about_images ORDER BY sort_order ASC, id ASC'
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function addAboutImages(req, res, next) {
  const files = req.files || [];
  try {
    await ensureTable();

    if (files.length === 0) {
      return res.status(400).json({ error: 'Pilih minimal 1 gambar' });
    }

    if (files.some((f) => !f.mimetype.startsWith('image/'))) {
      await removeFiles(files);
      return res.status(400).json({ error: 'Hanya file gambar yang diizinkan' });
    }

    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM about_images');
    if (total + files.length > MAX_IMAGES) {
      await removeFiles(files);
      return res.status(400).json({
        error: `Maksimal ${MAX_IMAGES} gambar. Saat ini ada ${total}, sisa slot ${Math.max(MAX_IMAGES - total, 0)}.`,
      });
    }

    const [[{ maxSort }]] = await pool.query(
      'SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM about_images'
    );

    for (let i = 0; i < files.length; i += 1) {
      await pool.query('INSERT INTO about_images (image_url, sort_order) VALUES (?, ?)', [
        `/uploads/${files[i].filename}`,
        maxSort + 1 + i,
      ]);
    }

    res.status(201).json({ message: 'Gambar berhasil ditambahkan' });
  } catch (err) {
    await removeFiles(files);
    next(err);
  }
}

async function deleteAboutImage(req, res, next) {
  try {
    await ensureTable();
    const { id } = req.params;
    const [rows] = await pool.query('SELECT image_url FROM about_images WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Gambar tidak ditemukan' });

    await pool.query('DELETE FROM about_images WHERE id = ?', [id]);

    const filename = path.basename(rows[0].image_url);
    const [[{ used }]] = await pool.query(
      `SELECT (
        (SELECT COUNT(*) FROM about_images WHERE image_url = ?) +
        (SELECT COUNT(*) FROM team_members WHERE photo_url = ?)
      ) AS used`,
      [rows[0].image_url, rows[0].image_url]
    );
    if (used === 0) {
      await fs.promises.unlink(path.join(UPLOAD_DIR, filename)).catch(() => {});
    }

    res.json({ message: 'Gambar berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAboutImages, addAboutImages, deleteAboutImage, MAX_IMAGES };
