function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.message === 'Tipe file tidak diizinkan') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file terlalu besar (maks 20MB)' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Terjadi kesalahan pada server',
  });
}

module.exports = errorHandler;