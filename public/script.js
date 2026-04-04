// Asteapta ca tot continutul paginii sa fie incarcat
document.addEventListener('DOMContentLoaded', function() {
    var content = document.getElementById('content');

    // Emoji-urile pentru reactii
    var reactionEmojis = {
        like: '\uD83D\uDC4D',
        haha: '\uD83D\uDE02',
        love: '\u2764\uFE0F',
        wow: '\uD83D\uDE2E',
        sad: '\uD83D\uDE22',
        angry: '\uD83D\uDE21'
    };

    // --- ROUTER-UL PRINCIPAL ---
    function loadPage() {
        var hash = window.location.hash || '#home';

        switch (hash) {
            case '#home':
                loadHomePage();
                break;
            case '#bancuri':
                loadContentPage('bancuri', 'bancuri.json', displayBancuri);
                break;
            case '#imagini':
                loadContentPage('imagini', 'imagini.json', displayImagini);
                break;
            case '#reels':
                loadContentPage('reels', 'reels.json', displayReels);
                break;
            case '#contact':
                loadContactPage();
                break;
            default:
                content.innerHTML = '<h1>404 - Pagina nu a fost gasita</h1>';
        }
    }

    // --- FUNCTII DE INCARCARE A PAGINILOR ---

    function loadHomePage() {
        content.innerHTML = '<h1>Bun venit pe Glume Haioase!</h1>' +
            '<p>Selecteaza o categorie din meniul de mai sus pentru a incepe distractia.</p>' +
            '<div class="content-grid">' +
            '<div class="item-card"><h3>' + reactionEmojis.haha + ' Bancuri</h3><p>Cele mai haioase bancuri romanesti, pe categorii.</p><a href="#bancuri">Vezi bancurile &rarr;</a></div>' +
            '<div class="item-card"><h3>' + reactionEmojis.love + ' Imagini Amuzante</h3><p>Colectia noastra de imagini care te vor face sa razi.</p><a href="#imagini">Vezi imaginile &rarr;</a></div>' +
            '<div class="item-card"><h3>' + reactionEmojis.wow + ' Reels</h3><p>Videoclipuri scurte si amuzante.</p><a href="#reels">Vezi reels &rarr;</a></div>' +
            '</div>';
    }

    function loadContentPage(contentType, jsonUrl, displayFunction) {
        var pageTitle = contentType.charAt(0).toUpperCase() + contentType.slice(1);
        if (contentType === 'imagini') pageTitle = 'Imagini Amuzante';
        content.innerHTML = '<h1>' + pageTitle + '</h1><div class="content-grid">Se incarca...</div>';
        var container = content.querySelector('.content-grid');

        fetch(jsonUrl)
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(function(data) {
                displayFunction(data, container, contentType);
            })
            .catch(function(error) {
                console.error('Eroare la incarcarea continutului:', error);
                container.innerHTML = '<p>Ne pare rau, a aparut o eroare la incarcarea continutului.</p>';
            });
    }

    function loadContactPage() {
        content.innerHTML = '<h1>Contact</h1>' +
            '<div class="item-card">' +
            '<p>Ai o sugestie sau vrei sa ne trimiti o gluma? Scrie-ne!</p>' +
            '<form id="contact-form">' +
            '<input type="text" name="name" placeholder="Numele tau" required>' +
            '<input type="email" name="email" placeholder="Adresa ta de email" required>' +
            '<textarea name="message" rows="5" placeholder="Mesajul tau" required></textarea>' +
            '<button type="submit">Trimite Mesajul</button>' +
            '</form>' +
            '<p id="form-status"></p>' +
            '</div>';

        var form = document.getElementById('contact-form');
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var statusEl = document.getElementById('form-status');
            statusEl.textContent = 'Se trimite...';
            statusEl.style.color = 'blue';

            var formData = {
                name: form.elements.name.value,
                email: form.elements.email.value,
                message: form.elements.message.value
            };

            fetch('/api/send-message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                statusEl.textContent = data.message || 'Mesaj trimis!';
                statusEl.style.color = 'green';
                form.reset();
            })
            .catch(function() {
                statusEl.textContent = 'Multumim pentru mesaj! Te vom contacta curand.';
                statusEl.style.color = 'green';
                form.reset();
            });
        });
    }

    // --- FUNCTII DE AFISARE A CONTINUTULUI ---

    function displayBancuri(bancuri, container, contentType) {
        container.innerHTML = '';
        bancuri.forEach(function(banc) {
            var card = document.createElement('div');
            card.className = 'item-card';
            var textContent = banc.text.replace(/\n/g, '<br>');
            card.innerHTML = '<p>' + textContent + '</p>';
            card.appendChild(createReactionsUI(banc.id, contentType));
            container.appendChild(card);
        });
    }

    function displayImagini(imagini, container, contentType) {
        container.innerHTML = '';
        imagini.forEach(function(imagine) {
            var card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = '<img src="' + imagine.url + '" alt="Imagine amuzanta" loading="lazy">';
            card.appendChild(createReactionsUI(imagine.id, contentType));
            container.appendChild(card);
        });
    }

    function displayReels(reels, container, contentType) {
        container.innerHTML = '';
        reels.forEach(function(reel) {
            var card = document.createElement('div');
            card.className = 'item-card';
            var title = reel.title || 'Reel';

            if (reel.type === 'facebook') {
                // Facebook reels - afiseaza ca link clickabil
                card.innerHTML = '<h3>' + title + '</h3>' +
                    '<a href="' + reel.url + '" target="_blank" rel="noopener noreferrer" class="reel-link">' +
                    '<div class="reel-facebook-card">' +
                    '<div class="reel-play-icon">\u25B6</div>' +
                    '<p>Apasa pentru a viziona pe Facebook</p>' +
                    '</div>' +
                    '</a>';
            } else {
                // YouTube sau alte surse - afiseaza ca iframe
                card.innerHTML = '<h3>' + title + '</h3>' +
                    '<div class="video-container">' +
                    '<iframe src="' + reel.url + '" title="' + title + '" frameborder="0" allowfullscreen loading="lazy"></iframe>' +
                    '</div>';
            }

            card.appendChild(createReactionsUI(reel.id, contentType));
            container.appendChild(card);
        });
    }

    // --- SISTEM DE REACTII ---

    function createReactionsUI(itemId, contentType) {
        var wrapper = document.createElement('div');
        wrapper.className = 'reactions-wrapper';
        wrapper.id = 'reactions-' + itemId;

        // Sumar reactii (stanga)
        var summary = document.createElement('div');
        summary.className = 'reactions-summary';
        summary.id = 'summary-' + itemId;
        summary.innerHTML = '<span class="summary-item">Se incarca...</span>';

        // Buton de reactie cu picker (dreapta)
        var btnContainer = document.createElement('div');
        btnContainer.className = 'reaction-button-container';

        var reactBtn = document.createElement('button');
        reactBtn.className = 'react-button';
        reactBtn.textContent = reactionEmojis.like + ' Reactioneaza';

        var picker = document.createElement('div');
        picker.className = 'reactions-picker';

        var reactionTypes = ['like', 'haha', 'love', 'wow', 'sad', 'angry'];
        reactionTypes.forEach(function(type) {
            var optBtn = document.createElement('button');
            optBtn.className = 'reaction-option';
            optBtn.textContent = reactionEmojis[type];
            optBtn.title = type.charAt(0).toUpperCase() + type.slice(1);
            optBtn.addEventListener('click', function() {
                sendReaction(itemId, type, contentType);
            });
            picker.appendChild(optBtn);
        });

        btnContainer.appendChild(reactBtn);
        btnContainer.appendChild(picker);

        wrapper.appendChild(summary);
        wrapper.appendChild(btnContainer);

        // Incarca reactiile existente
        loadReactions(itemId, contentType);

        return wrapper;
    }

    function loadReactions(itemId, contentType) {
        fetch('/api/reactions')
            .then(function(res) { return res.json(); })
            .then(function(db) {
                var reactions = null;
                if (db[contentType] && db[contentType][itemId]) {
                    reactions = db[contentType][itemId];
                }
                updateReactionsSummary(itemId, reactions);
            })
            .catch(function() {
                updateReactionsSummary(itemId, null);
            });
    }

    function sendReaction(itemId, reactionType, contentType) {
        fetch('/api/react', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contentId: itemId,
                reactionType: reactionType,
                contentType: contentType
            })
        })
        .then(function(res) { return res.json(); })
        .then(function(data) {
            if (data.reactions) {
                updateReactionsSummary(itemId, data.reactions);
            }
        })
        .catch(function(err) {
            console.error('Eroare la trimiterea reactiei:', err);
        });
    }

    function updateReactionsSummary(itemId, reactions) {
        var summary = document.getElementById('summary-' + itemId);
        if (!summary) return;

        if (!reactions) {
            summary.innerHTML = '<span class="summary-item">Fii primul care reactioneaza!</span>';
            return;
        }

        var html = '';
        var reactionTypes = ['like', 'haha', 'love', 'wow', 'sad', 'angry'];
        reactionTypes.forEach(function(type) {
            if (reactions[type] && reactions[type] > 0) {
                html += '<span class="summary-item">' + reactionEmojis[type] + ' ' + reactions[type] + '</span>';
            }
        });

        if (html === '') {
            html = '<span class="summary-item">Fii primul care reactioneaza!</span>';
        }

        summary.innerHTML = html;
    }

    // --- INITIALIZARE ---
    window.addEventListener('hashchange', loadPage);
    loadPage();
});
