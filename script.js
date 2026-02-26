// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            // Demo login - accept any username and password
            if (username && password) {
                // Store username in sessionStorage
                sessionStorage.setItem('username', username);
                // Redirect to portal
                window.location.href = 'portal.html';
            } else {
                alert('Please enter both username and password');
            }
        });
    }
    
    // Portal page functionality
    if (document.querySelector('.portal-page')) {
        initializePortal();
    }

    initializePopups();
    applySharedLandmarksText();
});

function initializePortal() {
    const isPublicPortal = document.body.classList.contains('public-portal');

    // Check if user is logged in
    const username = sessionStorage.getItem('username');
    if (!username && !isPublicPortal) {
        window.location.href = 'login.html';
        return;
    }

    const displayName = username || 'Guest';
    
    // Display username
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = displayName;
    }

    const fullNameDisplay = document.getElementById('fullNameDisplay');
    if (fullNameDisplay) {
        fullNameDisplay.textContent = displayName;
    }
    
    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const pageContents = document.querySelectorAll('.page-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show target page
            pageContents.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });
        });
    });
    
    // Set initial active page based on URL hash or fall back to the first tab
    const hash = window.location.hash.substring(1);
    const initialPage = hash || (navItems[0] ? navItems[0].getAttribute('data-page') : null);
    let activated = false;

    navItems.forEach(item => {
        if (item.getAttribute('data-page') === initialPage) {
            item.click();
            activated = true;
        }
    });

    const documentInput = document.getElementById('documentUpload');
    const documentList = document.getElementById('documentList');

    if (documentInput && documentList) {
        documentInput.addEventListener('change', function() {
            const files = Array.from(documentInput.files || []);
            if (files.length === 0) {
                documentList.innerHTML = '<li class="details-empty">No documents uploaded yet.</li>';
                return;
            }

            documentList.innerHTML = files.map(file => `<li>${file.name}</li>`).join('');
        });
    }

    if (!activated && navItems[0]) {
        navItems[0].click();
    }
}

function logout() {
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}

function initializePopups() {
    const modal = document.getElementById('popupModal');
    if (!modal) {
        return;
    }

    const titleEl = document.getElementById('popupTitle');
    const bodyEl = document.getElementById('popupBody');
    const closeButtons = modal.querySelectorAll('[data-popup-close]');
    const closeButton = modal.querySelector('.popup-close');

    function toEmbedUrl(url) {
        if (!url) {
            return '';
        }

        try {
            const parsed = new URL(url);
            const hostname = parsed.hostname.replace('www.', '');

            if (hostname === 'youtube.com') {
                if (parsed.pathname === '/watch') {
                    const videoId = parsed.searchParams.get('v');
                    if (videoId) {
                        return `https://www.youtube.com/embed/${videoId}`;
                    }
                }

                if (parsed.pathname.startsWith('/embed/')) {
                    return url;
                }
            }

            if (hostname === 'youtu.be') {
                const videoId = parsed.pathname.replace('/', '');
                if (videoId) {
                    return `https://www.youtube.com/embed/${videoId}`;
                }
            }
        } catch (error) {
            return url;
        }

        return url;
    }

    function openModal(trigger) {
        if (!titleEl || !bodyEl) {
            return;
        }

        titleEl.textContent = trigger.dataset.title || 'More info';
        bodyEl.textContent = trigger.dataset.body || '';

        const popupImage = document.getElementById('popupImage');
        if (popupImage) {
            if (trigger.dataset.image){
                popupImage.src=trigger.dataset.image;
                popupImage.style.display='block';
            }else {
                popupImage.style.display ='none';
            }
        }
       

        const linkUrl = trigger.dataset.link;
        if (linkUrl) {
            bodyEl.appendChild(document.createElement('br'));
            bodyEl.appendChild(document.createElement('br'));

            const link = document.createElement('a');
            link.href = linkUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = trigger.dataset.linkText || linkUrl;
            bodyEl.appendChild(link);
        }

        const videoUrl = trigger.dataset.video;
        if (videoUrl) {
            bodyEl.appendChild(document.createElement('br'));
            bodyEl.appendChild(document.createElement('br'));

            const iframe = document.createElement('iframe');
            iframe.width = '560';
            iframe.height = '315';
            iframe.src = toEmbedUrl(videoUrl);
            iframe.title = 'YouTube video player';
            iframe.frameBorder = '0';
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
            iframe.referrerPolicy = 'strict-origin-when-cross-origin';
            iframe.allowFullscreen = true;
            iframe.style.width = '100%';
            iframe.style.maxWidth = '560px';
            iframe.style.display = 'block';
            bodyEl.appendChild(iframe);
        }

        const emergencyText = trigger.dataset.emergency;
        if (emergencyText) {
            bodyEl.appendChild(document.createElement('br'));

            const emergencyNotice = document.createElement('p');
            emergencyNotice.className = 'emergency-alert';
            emergencyNotice.textContent = emergencyText;
            bodyEl.appendChild(emergencyNotice);
        }

        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden', 'false');

        if (closeButton) {
            closeButton.focus();
        }
    }

    function closeModal() {
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
    }

    document.addEventListener('click', function(event) {
        const trigger = event.target.closest('.popup-trigger');
        if (trigger) {
            event.preventDefault();
            openModal(trigger);
        }
    });

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && modal.classList.contains('is-open')) {
            closeModal();
        }
    });
}

<<<<<<< HEAD
const SharedText = `Key Landmarks to Include in Your Walking Tour
Royal Alcazar of Seville
🟢 Highlights: A UNESCO World Heritage site with exquisite Moorish architecture, beautiful gardens, and a historic royal palace.
⭐ Rating: 9.4/10 (36,780 reviews)
📌 Address: Patio de Banderas street, Seville, 41004
⏰ Open Hours: 09:30 – 19:00 daily
☎️ Phone: 954 50 23 24
✉️ Email: actividadespatronato-alcazarsevilla.es

Plaza de España
🟢 Highlights: Stunning semi-circular plaza built for the 1929 Ibero-American Exposition, adorned with ceramic-tiled alcoves representing Spanish provinces.
⭐ Rating: 9.6/10 (45,463 reviews)
📌 Address: Avenida de Isabel la Catolica, Seville, 41004
☎️ Phone: 955 47 12 32

Seville Cathedral & Giralda Tower
🟢 Highlights: One of the largest Gothic cathedrals in the world with a famous bell tower offering panoramic city views.
⭐ Rating: 9.2/10 (27,276 reviews)
📌 Address: Constitucion sq, Seville, 41004
⏰ Open Hours: Monday to Saturday 11:00–18:00, Sunday 14:30–19:00
☎️ Phone: 902 09 96 92
✉️ Email: info@catedraldesevilla.es

Real Maestranza de Caballería Bullring
🟢 Highlights: Historic bullring showcasing Andalusian tradition and architecture.
⭐ Rating: 8.4/10 (34 reviews)
📌 Address: Cristobal Colon avenue 12, Seville, 41001
⏰ Open Hours: 09:30 – 21:30 daily
☎️ Phone: 954 21 03 15
✉️ Email: realmaestranza@terra.es

Don Fadrique Tower & Torre del Oro
🟢 Highlights: Medieval defensive towers with significant historic value along Seville’s riverfront.
📌 Don Fadrique Address: Santa Clara, 65, Seville, 41002
☎️ Phone: 955 47 13 02`;

function applySharedLandmarksText() {
    const landmarksButtons = document.querySelectorAll('.popup-trigger[data-title="Sevilla Landmarks"]');
    landmarksButtons.forEach(button => {
        button.dataset.body = SharedText;
    });
}
=======
>>>>>>> 3e74c6d5c87eed1f9dacf7ae92e040c2b6745805
