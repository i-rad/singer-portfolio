require('dotenv').config();

const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const cookieParser = require('cookie-parser');

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_COOKIE = 'admin_auth';
const ADMIN_COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser(ADMIN_COOKIE_SECRET));

function requireAdmin(req, res, next) {
    if (req.signedCookies && req.signedCookies[ADMIN_COOKIE] === '1') {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized', success: false });
}

app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.cookie(ADMIN_COOKIE, '1', { httpOnly: true, signed: true });
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

app.post('/api/admin/logout', (req, res) => {
    res.clearCookie(ADMIN_COOKIE);
    res.json({ success: true });
});

app.get('/api/admin/check', (req, res) => {
    const authenticated = req.signedCookies && req.signedCookies[ADMIN_COOKIE] === '1';
    res.json({ authenticated });
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'gallery') });

app.post('/api/admin/images', requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, error: 'No file uploaded' });
    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    if (!allowed.includes(ext)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ success: false, error: 'Invalid file type' });
    }
    const newPath = req.file.path + ext;
    fs.renameSync(req.file.path, newPath);
    const relPath = `/gallery/${path.basename(newPath)}`;
    db.run('INSERT INTO images (path, description) VALUES (?, ?)', [relPath, req.body.description || ''], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'DB error' });
        res.json({ success: true, id: this.lastID, src: relPath, description: req.body.description || '' });
    });
});

app.put('/api/admin/images/:id', requireAdmin, (req, res) => {
    db.run('UPDATE images SET description = ? WHERE id = ?', [req.body.description, req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, error: 'DB error' });
        res.json({ success: true });
    });
});

app.delete('/api/admin/images/:id', requireAdmin, (req, res) => {
    db.get('SELECT path FROM images WHERE id = ?', [req.params.id], (err, row) => {
        if (err || !row) return res.status(404).json({ success: false, error: 'Not found' });
        const filePath = path.join(__dirname, row.path);
        db.run('DELETE FROM images WHERE id = ?', [req.params.id], function (err2) {
            if (err2) return res.status(500).json({ success: false, error: 'DB error' });
            fs.unlink(filePath, () => { });
            res.json({ success: true });
        });
    });
});

app.use(express.static('.'));

const DB_PATH = path.join(__dirname, 'gallery.db');
const db = new sqlite3.Database(DB_PATH);

function initDbAndPopulate() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      path TEXT NOT NULL,
      description TEXT
    )`);

        db.get('SELECT COUNT(*) as count FROM images', (err, row) => {
            if (err) return;
            if (row.count === 0) {
                const galleryDir = path.join(__dirname, 'gallery');
                if (fs.existsSync(galleryDir)) {
                    const files = fs.readdirSync(galleryDir);
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
                    const imageFiles = files.filter(file => imageExtensions.includes(path.extname(file).toLowerCase()));
                    const stmt = db.prepare('INSERT INTO images (path, description) VALUES (?, ?)');
                    imageFiles.forEach(file => {
                        stmt.run(`/gallery/${file}`, '');
                    });
                    stmt.finalize();
                }
            }
        });
    });
}
initDbAndPopulate();

app.get('/api/gallery', (req, res) => {
    db.all('SELECT id, path, description FROM images ORDER BY id ASC', (err, rows) => {
        if (err) {
            console.error('DB error:', err);
            return res.status(500).json({ error: 'Failed to load gallery images', success: false });
        }
        res.json({
            images: rows.map(row => ({
                id: row.id,
                src: row.path,
                description: row.description || ''
            })),
            count: rows.length,
            success: true
        });
    });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/test', (req, res) => {
    res.json({
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        cors: 'enabled'
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Gallery API available at http://localhost:${PORT}/api/gallery`);
    console.log(`Test API available at http://localhost:${PORT}/api/test`);
});
