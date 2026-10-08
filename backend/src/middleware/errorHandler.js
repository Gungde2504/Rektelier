const isProd = process.env.NODE_ENV === 'production';

function errorHandler(err, req, res, next) {
  console.error(err);

  if (err.message === 'Tipe file tidak diizinkan') {
    return res.status(400).json({ error: err.message });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'Ukuran file terlalu besar (maks 50MB)' });
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({ error: 'Upload tidak valid' });
  }

  const status = err.status || 500;
  res.status(status).json({
    error: status >= 500 && isProd
      ? 'Terjadi kesalahan pada server'
      : err.message || 'Terjadi kesalahan pada server',
  });
}

module.exports = errorHandler;