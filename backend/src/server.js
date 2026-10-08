require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth.routes');
const projectsRoutes = require('./routes/projects.routes');
const adminProjectsRoutes = require('./routes/admin.projects.routes');
const categoriesRoutes = require('./routes/categories.routes');
const teamRoutes = require('./routes/team.routes');
const newsRoutes = require('./routes/news.routes');
const adminNewsRoutes = require('./routes/admin.news.routes');
const seoRoutes = require('./routes/seo.routes');
const errorHandler = require('./middleware/errorHandler');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;
const isProd = process.env.NODE_ENV === 'production';

if (process.env.TRUST_PROXY) {
  app.set('trust proxy', Number(process.env.TRUST_PROXY) || process.env.TRUST_PROXY);
}

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(compression());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
}));
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads'), {
  maxAge: isProd ? '30d' : 0,
  immutable: isProd,
  index: false,
}));

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

app.use(seoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/admin/projects', adminProjectsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/admin/news', adminNewsRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' });
});

app.use(errorHandler);

async function start() {
  try {
    const conn = await pool.getConnection();
    console.log('MySQL connected');
    conn.release();
    app.listen(PORT, () => {
      console.log(`Rektelier backend jalan di port ${PORT}`);
    });
  } catch (err) {
    console.error('Gagal konek ke MySQL:', err.message);
    process.exit(1);
  }
}

start();