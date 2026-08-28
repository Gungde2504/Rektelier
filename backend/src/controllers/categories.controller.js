const pool = require('../config/db');
const slugify = require('slugify');

async function getCategories(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createCategory(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const slug = slugify(name, { lower: true, strict: true });
    const [result] = await pool.query('INSERT INTO categories (name, slug) VALUES (?, ?)', [name, slug]);

    res.status(201).json({ id: result.insertId, name, slug });
  } catch (err) {
    next(err);
  }
}

async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama kategori wajib diisi' });

    const slug = slugify(name, { lower: true, strict: true });
    const [result] = await pool.query('UPDATE categories SET name = ?, slug = ? WHERE id = ?', [name, slug, id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

    res.json({ message: 'Kategori berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
}

async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM categories WHERE id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Kategori tidak ditemukan' });

    res.json({ message: 'Kategori berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };