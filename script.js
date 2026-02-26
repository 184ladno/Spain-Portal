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
        ['1','2','3','4','5'].forEach(function(n) {
            const img = document.getElementById('popupImage'+n);
            if (img) {
                if (trigger.dataset['image'+n]){
                    img.src=trigger.dataset['image'+n];
                    img.style.display='block';
                }else {
                    img.style.display ='none';
                }
            }
        });
        
       

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

