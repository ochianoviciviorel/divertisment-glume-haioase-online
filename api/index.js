const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

// Serveste fisierele statice din folderul public
app.use(express.static(path.join(__dirname, '../public')));

// Middleware
app.use(cors());
app.use(express.json());

// --- CONFIGURARE ---
const ADMIN_PASSWORD = 'parola-ta-secreta';

// --- FUNCTII PENTRU GESTIONAREA FISIERELOR ---
// Vercel permite scrierea doar in folderul /tmp

var readDataFile = function(filename) {
    var filePath = path.join('/tmp', filename);
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}));
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
};

var writeDataFile = function(filename, data) {
    var filePath = path.join('/tmp', filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// --- ENDPOINT-URI (ADRESELE API) ---

// Endpoint pentru Reactii
app.get('/api/reactions', function(req, res) {
    var db = readDataFile('reactii.json');
    res.json(db);
});

app.post('/api/react', function(req, res) {
    var contentId = req.body.contentId;
    var reactionType = req.body.reactionType;
    var contentType = req.body.contentType;

    if (!contentId || !reactionType || !contentType) {
        return res.status(400).json({ message: 'Lipsesc datele necesare.' });
    }

    var db = readDataFile('reactii.json');
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
app.get('/api/comments/:itemId', function(req, res) {
    var itemId = req.params.itemId;
    var commentsDb = readDataFile('comentarii.json');
    res.json(commentsDb[itemId] || []);
});

app.post('/api/comments', function(req, res) {
    var itemId = req.body.itemId;
    var user = req.body.user;
    var text = req.body.text;

    if (!itemId || !user || !text) {
        return res.status(400).json({ message: 'Lipsesc datele necesare.' });
    }

    var commentsDb = readDataFile('comentarii.json');
    if (!commentsDb[itemId]) commentsDb[itemId] = [];
    var newComment = { user: user, text: text, timestamp: new Date().toISOString() };
    commentsDb[itemId].push(newComment);
    writeDataFile('comentarii.json', commentsDb);
    res.status(201).json(newComment);
});

// Endpoint pentru Formularul de Contact
app.post('/api/send-message', function(req, res) {
    var name = req.body.name;
    var email = req.body.email;
    var message = req.body.message;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'Toate campurile sunt obligatorii.' });
    }

    // Pentru moment, doar confirmam primirea mesajului
    console.log('Mesaj primit de la:', name, email, message);
    res.status(200).json({ message: 'Mesajul tau a fost trimis cu succes!' });
});

// Endpoint-uri pentru Panoul de Administrare
app.post('/api/login', function(req, res) {
    var password = req.body.password;
    if (password === ADMIN_PASSWORD) {
        res.status(200).json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Parola incorecta!' });
    }
});

app.post('/api/add-content', function(req, res) {
    var type = req.body.type;
    var id = req.body.id;
    var text = req.body.text;
    var url = req.body.url;

    var filePath = path.join(__dirname, type + '.json');
    if (!fs.existsSync(filePath)) {
        return res.status(400).json({ message: 'Tip de continut invalid.' });
    }
    var contentArray = JSON.parse(fs.readFileSync(filePath));
    var exists = contentArray.some(function(item) { return item.id === id; });
    if (exists) {
        return res.status(409).json({ message: 'Acest ID exista deja.' });
    }
    var newItem = (type === 'bancuri') ? { id: id, text: text } : { id: id, url: url };
    contentArray.push(newItem);
    fs.writeFileSync(filePath, JSON.stringify(contentArray, null, 2));
    res.status(201).json({ message: 'Continut adaugat cu succes!' });
});

// Exporta aplicatia pentru Vercel serverless
module.exports = app;
