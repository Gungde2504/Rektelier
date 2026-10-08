const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

const MIME_EXT = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const uniqueName = crypto.randomBytes(16).toString('hex');
    cb(null, `${uniqueName}${MIME_EXT[file.mimetype]}`);
  },
});

function fileFilter(req, file, cb) {
  if (!MIME_EXT[file.mimetype]) {
    return cb(new Error('Tipe file tidak diizinkan'), false);
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
});

const SIGNATURES = {
  'image/jpeg': (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff,
  'image/png': (b) => b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/webp': (b) => b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP',
  'video/mp4': (b) => b.toString('ascii', 4, 8) === 'ftyp',
  'video/webm': (b) => b[0] === 0x1a && b[1] === 0x45 && b[2] === 0xdf && b[3] === 0xa3,
};

async function readHead(file) {
  const fh = await fs.promises.open(file.path, 'r');
  try {
    const buf = Buffer.alloc(12);
    await fh.read(buf, 0, 12, 0);
    return buf;
  } finally {
    await fh.close();
  }
}

async function verifyFiles(req, res, next) {
  const files = [];
  if (req.file) files.push(req.file);
  if (req.files) {
    const list = Array.isArray(req.files) ? req.files : Object.values(req.files).flat();
    files.push(...list);
  }
  try {
    for (const f of files) {
      const head = await readHead(f);
      const check = SIGNATURES[f.mimetype];
      if (!check || !check(head)) throw new Error('Tipe file tidak diizinkan');
    }
    next();
  } catch (err) {
    await Promise.all(files.map((f) => fs.promises.unlink(f.path).catch(() => {})));
    next(err);
  }
}

module.exports = {
  single: (name) => [upload.single(name), verifyFiles],
  array: (name, max) => [upload.array(name, max), verifyFiles],
  fields: (fields) => [upload.fields(fields), verifyFiles],
};