const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname), { index: false }));
app.use('/vendor/html2canvas.min.js', express.static(path.join(__dirname, 'node_modules/html2canvas/dist/html2canvas.min.js')));
app.use('/vendor/jspdf.umd.min.js', express.static(path.join(__dirname, 'node_modules/jspdf/dist/jspdf.umd.min.js')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard.html'));
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'login.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
