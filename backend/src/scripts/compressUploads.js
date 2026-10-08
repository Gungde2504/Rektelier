// Kompres foto lama di folder uploads (nama file TIDAK berubah).
// Jalankan: node src/scripts/compressUploads.js
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');
const MIN_SIZE = 400 * 1024; // hanya file di atas 400KB
const MAX_DIMENSION = 2000;

async function compressFile(file) {
  const ext = path.extname(file).toLowerCase();
  const full = path.join(UPLOAD_DIR, file);
  const before = (await fs.promises.stat(full)).size;
  if (before < MIN_SIZE) return null;

  let pipeline = sharp(full).rotate().resize({
    width: MAX_DIMENSION,
    height: MAX_DIMENSION,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (ext === '.jpg' || ext === '.jpeg') pipeline = pipeline.jpeg({ quality: 80, mozjpeg: true });
  else if (ext === '.png') pipeline = pipeline.png({ compressionLevel: 9 });
  else if (ext === '.webp') pipeline = pipeline.webp({ quality: 80 });
  else return null;

  const buffer = await pipeline.toBuffer();
  if (buffer.length >= before) return { file, before, after: before, replaced: false };

  const tmp = `${full}.tmp`;
  await fs.promises.writeFile(tmp, buffer);
  await fs.promises.rename(tmp, full);
  return { file, before, after: buffer.length, replaced: true };
}

async function main() {
  const files = await fs.promises.readdir(UPLOAD_DIR);
  let saved = 0;
  for (const file of files) {
    try {
      const r = await compressFile(file);
      if (!r) continue;
      if (r.replaced) {
        saved += r.before - r.after;
        console.log(`${file}: ${(r.before / 1024).toFixed(0)}KB -> ${(r.after / 1024).toFixed(0)}KB`);
      } else {
        console.log(`${file}: dilewati (sudah efisien)`);
      }
    } catch (err) {
      console.error(`${file}: gagal (${err.message})`);
    }
  }
  console.log(`Selesai. Hemat total ${(saved / 1024 / 1024).toFixed(1)}MB`);
}

main();
