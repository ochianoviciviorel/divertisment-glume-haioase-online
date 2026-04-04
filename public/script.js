// Așteaptă ca tot conținutul paginii să fie încărcat
document.addEventListener('DOMContentLoaded', () => {
    const content = document.getElementById('content');

    // --- ROUTER-UL PRINCIPAL ---
    // Funcția care decide ce să încarce în funcție de URL
    const loadPage = () => {
        const hash = window.location.hash || '#home';

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
                content.innerHTML = '<h1>404 - Pagina nu a fost găsită</h1>';
        }
    };

    // --- FUNCȚII DE ÎNCĂRCARE A PAGINILOR ---

    // Încarcă pagina principală
    const loadHomePage = () => {
        content.innerHTML = `
            <h1>Bun venit pe Glume Haioase!</h1>
            <p>Selectează o categorie din meniul de mai sus pentru a începe distracția.</p>
        `;
    };

    // Funcție generică pentru a încărca paginile de conținut (bancuri, imagini, etc.)
    const loadContentPage = async (title, jsonUrl, displayFunction) => {
        content.innerHTML = `<h1>${title.charAt(0).toUpperCase() + title.slice(1)}</h1><div class="content-grid">Se încarcă...</div>`;
        const container = content.querySelector('.content-grid');

        try {
            const response = await fetch(jsonUrl);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            const data = await response.json();
            displayFunction(data, container);
        } catch (error) {
            console.error('Eroare la încărcarea conținutului:', error);
            container.innerHTML = '<p>Ne pare rău, a apărut o eroare la încărcarea conținutului.</p>';
        }
    };
    
    // Încarcă pagina de contact
    const loadContactPage = () => {
        content.innerHTML = `
            <h1>Contact</h1>
            <form id="contact-form">
                <input type="text" name="name" placeholder="Numele tău" required>
                <input type="email" name="email" placeholder="Adresa ta de email" required>
                <textarea name="message" rows="5" placeholder="Mesajul tău" required></textarea>
                <button type="submit">Trimite Mesajul</button>
            </form>
            <p id="form-status"></p>
        `;
        // Aici vom adăuga logica de trimitere a formularului mai târziu
        const form = document.getElementById('contact-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            document.getElementById('form-status').textContent = 'Funcționalitatea de trimitere va fi implementată curând.';
            document.getElementById('form-status').style.color = 'blue';
        });
    };


    // --- FUNCȚII DE AFIȘARE A CONȚINUTULUI ---

    // Afișează bancurile
    const displayBancuri = (bancuri, container) => {
        container.innerHTML = ''; // Golește mesajul "Se încarcă..."
        bancuri.forEach(banc => {
            const bancElement = document.createElement('div');
            bancElement.className = 'item-card';
            bancElement.innerHTML = `<p>${banc.text.replace(/\n/g, '  
')}</p>`; // Înlocuim newline cu   

            container.appendChild(bancElement);
        });
    };

    // Afișează imaginile
    const displayImagini = (imagini, container) => {
        container.innerHTML = '';
        imagini.forEach(imagine => {
            const imgElement = document.createElement('div');
            imgElement.className = 'item-card';
            imgElement.innerHTML = `<img src="${imagine.url}" alt="Imagine amuzanta" loading="lazy">`;
            container.appendChild(imgElement);
        });
    };

    // Afișează reel-urile
    const displayReels = (reels, container) => {
        container.innerHTML = '';
        reels.forEach(reel => {
            const reelElement = document.createElement('div');
            reelElement.className = 'item-card';
            reelElement.innerHTML = `
                <h3>${reel.title || 'Reel'}</h3>
                <div class="video-container">
                    <iframe src="${reel.url}" title="${reel.title || 'Reel'}" frameborder="0" allowfullscreen loading="lazy"></iframe>
                </div>
            `;
            container.appendChild(reelElement);
        });
    };


    // --- INIȚIALIZARE ---
    // Ascultă schimbările de URL (click-urile pe link-uri)
    window.addEventListener('hashchange', loadPage);
    // Încarcă pagina inițială la prima vizită
    loadPage();
});
