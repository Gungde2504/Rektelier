require('dotenv').config();
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

async function createAdmin() {
  const username = process.argv[2];
  const password = process.argv[3];

  if (!username || !password) {
    console.error('Gunakan: node src/scripts/createAdmin.js <username> <password>');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Password minimal 8 karakter');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    await pool.query(
      'INSERT INTO admin_users (username, password_hash) VALUES (?, ?)',
      [username, passwordHash]
    );
    console.log(`Admin "${username}" berhasil dibuat`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      console.error('Username sudah dipakai');
    } else {
      console.error('Gagal membuat admin:', err.message);
    }
  } finally {
    process.exit(0);
  }
}

createAdmin();