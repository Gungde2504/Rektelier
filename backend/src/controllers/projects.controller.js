const pool = require('../config/db');
const generateUniqueSlug = require('../utils/slug');

async function getPublishedProjects(req, res, next) {
  try {
    const { category } = req.query;
    let query = `
      SELECT p.id, p.title, p.slug, p.location, p.year, p.cover_image, p.video_url,
             c.name AS category_name, c.slug AS category_slug
      FROM projects p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'published'
    `;
    const params = [];
    if (category) {
      query += ' AND c.slug = ?';
      params.push(category);
    }
    query += ' ORDER BY p.sort_order ASC, p.created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getProjectBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [projectRows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM projects p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.status = 'published'`,
      [slug]
    );
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    const project = projectRows[0];
    const [images] = await pool.query(
      'SELECT id, image_url, media_type, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order ASC',
      [project.id]
    );
    res.json({ ...project, images });
  } catch (err) {
    next(err);
  }
}

async function submitProject(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const {
      title, category_id, location, year, description,
      size, client, build_status,
      submitted_by_name, submitted_by_email,
    } = req.body;
    if (!title || !submitted_by_name || !submitted_by_email) {
      connection.release();
      return res.status(400).json({ error: 'Judul, nama, dan email pengirim wajib diisi' });
    }
    const files = req.files || {};
    const coverFile = files.cover ? files.cover[0] : null;
    const headerImageFile = files.header_image ? files.header_image[0] : null;
    const headerVideoFile = files.header_video ? files.header_video[0] : null;
    const galleryFiles = files.gallery || [];
    const slug = await generateUniqueSlug(title);
    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : null;
    const headerImageUrl = headerImageFile ? `/uploads/${headerImageFile.filename}` : null;
    const videoUrl = headerVideoFile ? `/uploads/${headerVideoFile.filename}` : null;
    await connection.beginTransaction();
    const [result] = await connection.query(
      `INSERT INTO projects (title, slug, category_id, location, year, description, size, client, build_status, cover_image, header_image, video_url, status, submitted_by_name, submitted_by_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, ?)`,
      [
        title, slug, category_id || null, location || null, year || null, description || null,
        size || null, client || null, build_status || null,
        coverUrl, headerImageUrl, videoUrl,
        submitted_by_name, submitted_by_email,
      ]
    );
    const projectId = result.insertId;
    for (let i = 0; i < galleryFiles.length; i++) {
      const file = galleryFiles[i];
      const mediaUrl = `/uploads/${file.filename}`;
      const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
      await connection.query(
        'INSERT INTO project_images (project_id, image_url, media_type, sort_order) VALUES (?, ?, ?, ?)',
        [projectId, mediaUrl, mediaType, i]
      );
    }
    await connection.commit();
    connection.release();
    res.status(201).json({
      message: 'Proyek berhasil dikirim dan akan direview sebelum tayang',
      slug,
    });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
}

async function getAllProjectsAdmin(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name
       FROM projects p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
}

async function getProjectByIdAdmin(req, res, next) {
  try {
    const { id } = req.params;
    const [projectRows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM projects p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [id]
    );
    if (projectRows.length === 0) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    const [images] = await pool.query(
      'SELECT id, image_url, media_type, sort_order FROM project_images WHERE project_id = ? ORDER BY sort_order ASC',
      [id]
    );
    res.json({ ...projectRows[0], images });
  } catch (err) {
    next(err);
  }
}

async function updateProject(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      title, category_id, location, year, description,
      size, client, build_status, video_url, sort_order,
      removed_image_ids,
    } = req.body;

    const [existing] = await connection.query('SELECT * FROM projects WHERE id = ?', [id]);
    if (existing.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }

    const files = req.files || {};
    const coverFile = files.cover ? files.cover[0] : null;
    const headerImageFile = files.header_image ? files.header_image[0] : null;
    const galleryFiles = files.gallery || [];

    const coverUrl = coverFile ? `/uploads/${coverFile.filename}` : existing[0].cover_image;
    const headerImageUrl = headerImageFile ? `/uploads/${headerImageFile.filename}` : existing[0].header_image;

    await connection.beginTransaction();

    await connection.query(
      `UPDATE projects SET title = ?, category_id = ?, location = ?, year = ?, description = ?, size = ?, client = ?, build_status = ?, cover_image = ?, header_image = ?, video_url = ?, sort_order = ?
       WHERE id = ?`,
      [
        title || existing[0].title,
        category_id || existing[0].category_id,
        location || existing[0].location,
        year || existing[0].year,
        description || existing[0].description,
        size || existing[0].size,
        client || existing[0].client,
        build_status || existing[0].build_status,
        coverUrl,
        headerImageUrl,
        video_url || existing[0].video_url,
        sort_order !== undefined ? sort_order : existing[0].sort_order,
        id,
      ]
    );

    let removedIds = [];
    if (removed_image_ids) {
      try {
        removedIds = JSON.parse(removed_image_ids);
      } catch {
        removedIds = removed_image_ids.split(',').map((v) => v.trim()).filter(Boolean);
      }
    }
    removedIds = removedIds.map((v) => Number(v)).filter((v) => Number.isInteger(v));

    if (removedIds.length > 0) {
      await connection.query(
        `DELETE FROM project_images WHERE project_id = ? AND id IN (${removedIds.map(() => '?').join(',')})`,
        [id, ...removedIds]
      );
    }

    if (galleryFiles.length > 0) {
      const [[{ maxSort }]] = await connection.query(
        'SELECT COALESCE(MAX(sort_order), -1) AS maxSort FROM project_images WHERE project_id = ?',
        [id]
      );
      for (let i = 0; i < galleryFiles.length; i++) {
        const file = galleryFiles[i];
        const mediaUrl = `/uploads/${file.filename}`;
        const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
        await connection.query(
          'INSERT INTO project_images (project_id, image_url, media_type, sort_order) VALUES (?, ?, ?, ?)',
          [id, mediaUrl, mediaType, maxSort + 1 + i]
        );
      }
    }

    await connection.commit();
    connection.release();
    res.json({ message: 'Proyek berhasil diperbarui' });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
}

async function updateProjectStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['draft', 'published'].includes(status)) {
      return res.status(400).json({ error: 'Status tidak valid' });
    }
    const [result] = await pool.query('UPDATE projects SET status = ? WHERE id = ?', [status, id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    res.json({ message: `Status proyek diubah menjadi ${status}` });
  } catch (err) {
    next(err);
  }
}

async function deleteProject(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM projects WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Proyek tidak ditemukan' });
    }
    res.json({ message: 'Proyek berhasil dihapus' });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getPublishedProjects,
  getProjectBySlug,
  submitProject,
  getAllProjectsAdmin,
  getProjectByIdAdmin,
  updateProject,
  updateProjectStatus,
  deleteProject,
};