const pool = require('../config/db');

async function getTeam(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT * FROM team_members ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function createTeamMember(req, res, next) {
  try {
    const { name, position, is_former, sort_order } = req.body;
    if (!name) return res.status(400).json({ error: 'Nama wajib diisi' });

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const [result] = await pool.query(
      'INSERT INTO team_members (name, position, photo_url, is_former, sort_order) VALUES (?, ?, ?, ?, ?)',
      [name, position || null, photoUrl, is_former === 'true' || is_former === true, sort_order || 0]
    );

    res.status(201).json({ id: result.insertId, message: 'Anggota tim berhasil ditambahkan' });
  } catch (err) {
    next(err);
  }
}

async function updateTeamMember(req, res, next) {
  try {
    const { id } = req.params;
    const { name, position, is_former, sort_order } = req.body;

    const [existing] = await pool.query('SELECT * FROM team_members WHERE id = ?', [id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Anggota tim tidak ditemukan' });

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : existing[0].photo_url;

    await pool.query(
      'UPDATE team_members SET name = ?, position = ?, photo_url = ?, is_former = ?, sort_order = ? WHERE id = ?',
      [
        name || existing[0].name,
        position || existing[0].position,
        photoUrl,
        is_former !== undefined ? (is_former === 'true' || is_former === true) : existing[0].is_former,
        sort_order !== undefined ? sort_order : existing[0].sort_order,
        id,
      ]
    );

    res.json({ message: 'Anggota tim berhasil diperbarui' });
  } catch (err) {
    next(err);
  }
}

async function deleteTeamMember(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM team_members WHERE id = ?', [id]);

    if (result.affectedRows === 0) return res.status(404).json({ error: 'Anggota tim tidak ditemukan' });

    res.json({ message: 'Anggota tim berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = { getTeam, createTeamMember, updateTeamMember, deleteTeamMember };