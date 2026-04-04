const express = require('express');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));


// Middleware - "unelte" ajutătoare pentru server
app.use(cors()); // Permite cereri de la alte domenii (esențial pentru Vercel)
app.use(express.json()); // Permite serverului să înțeleagă datele trimise în format JSON

// --- CONFIGURARE ---
const ADMIN_PASSWORD = 'parola-ta-secreta'; // Schimbă asta cu o parolă reală!

// Configurare pentru trimiterea de email-uri
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'adresa.ta.de.email@gmail.com', // Pune aici adresa ta de Gmail
        pass: 'parola-generata-pentru-aplicatie' // Pune aici parola de 16 caractere de la Google
    }
});


// --- FUNCȚII PENTRU GESTIONAREA FIȘIERELOR ---
// Vercel permite scrierea doar în folderul /tmp

const readDataFile = (filename) => {
    const filePath = path.join('/tmp', filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

const writeDataFile = (filename, data) => {
    const filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};


// --- ENDPOINT-URI (ADRESELE API) ---

// Endpoint pentru Reacții
app.get('/api/reactions', (req, res) => {
    const db = readDataFile('reactii.json');
    res.json(db);
});

app.post('/api/react', (req, res) => {
    const { contentId, reactionType, contentType } = req.body;
    if (!contentId || !reactionType || !contentType) {
        return res.status(400).json({ message: 'Lipsesc datele necesare.' });
    }
    const db = readDataFile('reactii.json');
    if (!db[contentType]) db[contentType] = {};
    if (!db[contentType][contentId]) {
        db[contentType][contentId] = { like: 0, haha: 0, love: 0, wow: 0, sad: 0, angry: 0 };
    }
    if (db[contentType][contentId].hasOwnProperty(reactionType)) {
        db[contentType][contentId][reactionType]++;
    }
    writeDataFile('reactii.json', db);
    res.status(201).json({ reactions: db[contentType][contentId] });
});

// Endpoint pentru Comentarii
app.get('/api/comments/:itemId', (req, res) => {
    const { itemId } = req.params;
    const commentsDb = readDataFile('comentarii.json');
    res.json(commentsDb[itemId] || []);
});

app.post('/api/comments', (req, res) => {
    const { itemId, user, text } = req.body;
    if (!itemId || !user || !text) {
        return res.status(400).json({ message: 'Lipsesc datele necesare.' });
    }
    const commentsDb = readDataFile('comentarii.json');
    if (!commentsDb[itemId]) commentsDb[itemId] = [];
    const newComment = { user, text, timestamp: new Date().toISOString() };
    commentsDb[itemId].push(newComment);
    writeDataFile('comentarii.json', commentsDb);
    res.status(201).json(newComment);
});

// Endpoint pentru Formularul de Contact
app.post('/api/send-message', (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Toate câmpurile sunt obligatorii.' });
    }
    const mailOptions = {
        from: `"${name}" <${email}>`,
        to: 'adresa.ta.de.email@gmail.com', // Pune aici adresa ta reală
        subject: `Mesaj nou de pe site de la ${name}`,
        text: `Ai primit un mesaj nou de la:\n\nNume: ${name}\nEmail: ${email}\n\nMesaj:\n${message}`
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Eroare la trimiterea email-ului:', error);
            return res.status(500).json({ message: 'A apărut o eroare la trimiterea mesajului.' });
        }
        res.status(200).json({ message: 'Mesajul tău a fost trimis cu succes!' });
    });
});

// Endpoint-uri pentru Panoul de Administrare
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Parolă incorectă!' });
    }
});

app.post('/api/add-content', (req, res) => {
    const { type, id, text, url } = req.body;
    const filePath = path.join(__dirname, `${type}.json`);
    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'Tip de conținut invalid.' });
    }
    const contentArray = JSON.parse(fs.readFileSync(filePath));
    if (contentArray.some(item => item.id === id)) {
        return res.status(409).json({ message: 'Acest ID există deja.' });
    }
    const newItem = (type === 'bancuri') ? { id, text } : { id, url };
    contentArray.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(contentArray, null, 2));
    res.status(201).json({ message: 'Conținut adăugat cu succes!' });
});

// Exportă aplicația pentru a fi folosită de Vercel
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serverul a pornit. Accesează site-ul la http://localhost:${PORT}` );
});

