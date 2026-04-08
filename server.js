const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const app = express();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
});

// Serve static assets (CSS, JS, images) without auto-serving index.html
app.use(express.static(path.join(__dirname), { index: false }));
app.use(limiter);

// Serve bundled vendor libraries from node_modules
app.get('/vendor/html2canvas.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/html2canvas/dist/html2canvas.min.js'));
});
app.get('/vendor/jspdf.umd.min.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/jspdf/dist/jspdf.umd.min.js'));
});

// Serve login page at root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

// Fallback: 404 for unknown routes
app.use((req, res) => {
    res.status(404).send('Not Found');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
