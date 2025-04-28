const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Bağlantısı
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // MySQL kullanıcı adı
    password: '1234', // MySQL şifresi
    database: 'ForumDB'
});

db.connect(err => {
    if (err) throw err;
    console.log('MySQL Bağlantısı Başarılı!');
});

// Serve static files from the "public" directory
app.use(express.static('public'));

let isLoggedIn = false; // Boolean to track login status

// Serve index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Kayıt Olma Endpoint'i
app.post('/register', async (req, res) => {
    const { name, surname, username, email, password } = req.body;

    // Şifreyi hash'leme
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = 'INSERT INTO users (name, surname, username, email, password_hash) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [name, surname, username, email, hashedPassword], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Kayıt sırasında bir hata oluştu.');
        }
        res.status(201).send('Kayıt başarılı!');
    });
});

// Giriş Yapma Endpoint'i
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Giriş sırasında bir hata oluştu.');
        }

        if (results.length === 0) {
            return res.status(404).send('Kullanıcı bulunamadı.');
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);

        if (!isPasswordValid) {
            return res.status(401).send('Geçersiz şifre.');
        }

        isLoggedIn = true; // Set login status to true
        res.status(200).send('Giriş başarılı!');
    });
});

// Logout endpoint to reset login status
app.post('/logout', (req, res) => {
    isLoggedIn = false; // Reset login status
    res.status(200).send('Çıkış başarılı!');
});

// Endpoint to check login status
app.get('/status', (req, res) => {
    res.json({ isLoggedIn });
});

// Sunucuyu Başlat
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});