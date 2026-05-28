// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    updatePortalSideLinesStart();

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

    window.addEventListener('resize', updatePortalSideLinesStart);
});

function updatePortalSideLinesStart() {
    if (!document.body.classList.contains('portal-page')) {
        return;
    }

    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) {
        document.body.style.setProperty('--side-lines-start', '620px');
        return;
    }

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
    document.body.style.setProperty('--side-lines-start', `${heroBottom}px`);
}

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
        modal.classList.add('is-open');
        modal.setAttribute('aria-hidden','false');

        const popupCard=modal.querySelector('.popup-card');
        if (popupCard) {
            popupCard.scrollTop=0;
        }

        if (closeButton) {
            closeButton.focus()
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
            return;
        }

        const heroCard = event.target.closest('.grid-image');
        if (heroCard) {
            const cardTrigger = heroCard.querySelector('.image-icon.popup-trigger');
            if (cardTrigger) {
                event.preventDefault();
                openModal(cardTrigger);
            }
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

const navButtons = document.querySelectorAll(".nav-item-edit");

navButtons.forEach(function(button) {
    button.addEventListener("click", function() {
        navButtons.forEach(btn => btn.classList.remove("active"));
        this.classList.add("active");
        document.querySelectorAll(".page-edit").forEach(page => page.style.display = "none");
        const targetPage = this.getAttribute("data-page");
        document.getElementById(targetPage).style.display = "block";
        if (targetPage === 'itinerary-edit') initItineraryEditor();
    });
});

function updateOutboundFlight() {
    let outboundDate = document.getElementById("o_date").value;
    document.getElementById("o-date").textContent = outboundDate;
    let outbounddeparturePlace = document.getElementById("o_departurePlace").value;
    document.getElementById("o-departurePlace").textContent = outbounddeparturePlace;
    let outboundarrivalPlace = document.getElementById("o_arrivalPlace").value;
    document.getElementById("o-arrivalPlace").textContent = outboundarrivalPlace;
    let outbounddepartureterminal = document.getElementById("o_departureTerminal").value;
    document.getElementById("o-departureTerminal").textContent = outbounddepartureterminal;
    let outboundarrivalterminal = document.getElementById("o_arrivalTerminal").value;
    document.getElementById("o-arrivalTerminal").textContent = outboundarrivalterminal;
    let outbounddepartureTime = document.getElementById("o_departureTime").value;
    document.getElementById("o-departureTime").textContent = outbounddepartureTime;
    let duration= document.getElementById("o_duration").value;
    document.getElementById("o-duration").textContent = duration;
    let outboundarrivalTime = document.getElementById("o_arrivalTime").value;
    document.getElementById("o-arrivalTime").textContent = outboundarrivalTime;
    let outboundflightNumber = document.getElementById("o_flightNumber").value;
    document.getElementById("o-flightNumber").textContent = outboundflightNumber;
    let outboundaircraft = document.getElementById("o_aircraft").value;
    document.getElementById("o-aircraft").textContent = outboundaircraft;
    let outboundseatAssignment = document.getElementById("o_seats").value;
    document.getElementById("o-seats").textContent = outboundseatAssignment;
}
function updateReturnFlight() {
    let returndate = document.getElementById("r_date").value;
    document.getElementById("r-date").textContent = returndate;
    let returndeparturePlace = document.getElementById("r_departurePlace").value;
    document.getElementById("r-departurePlace").textContent = returndeparturePlace;
    let returnarrivalPlace = document.getElementById("r_arrivalPlace").value;
    document.getElementById("r-arrivalPlace").textContent = returnarrivalPlace;
    let returndepartureterminal = document.getElementById("r_departureTerminal").value;
    document.getElementById("r-departureTerminal").textContent = returndepartureterminal;
    let returnarrivalterminal = document.getElementById("r_arrivalTerminal").value;
    document.getElementById("r-arrivalTerminal").textContent = returnarrivalterminal;
    let returnduration= document.getElementById("r_duration").value;
    document.getElementById("r-duration").textContent = returnduration;
    let returndepartureTime = document.getElementById("r_departureTime").value;
    document.getElementById("r-departureTime").textContent = returndepartureTime;
    let returnarrivalTime = document.getElementById("r_arrivalTime").value;
    document.getElementById("r-arrivalTime").textContent = returnarrivalTime;
    let returnflightNumber = document.getElementById("r_flightNumber").value;
    document.getElementById("r-flightNumber").textContent = returnflightNumber;
    let returnaircraft = document.getElementById("r_aircraft").value;
    document.getElementById("r-aircraft").textContent = returnaircraft;
    let returnseatAssignment = document.getElementById("r_seats").value;
    document.getElementById("r-seats").textContent = returnseatAssignment;
  }

function updateHotel1() {
    let hotelName = document.getElementById("hotelName_1").value;
    document.getElementById("hotelName-1").textContent = hotelName;
    let hotelLocation = document.getElementById("hotelLocation_1").value;
    document.getElementById("hotelLocation-1").textContent = hotelLocation;
    let hotelStay = document.getElementById("hotelStay_1").value;
    document.getElementById("hotelStay-1").textContent = hotelStay;
    let hotelAddress = document.getElementById("hotelAddress_1").value;
    document.getElementById("hotelAddress-1").textContent = hotelAddress;
    let checkIn = document.getElementById("checkIn_1").value;
    document.getElementById("checkIn-1").textContent = checkIn;
    let checkOut = document.getElementById("checkOut_1").value;
    document.getElementById("checkOut-1").textContent = checkOut;
    let hotelroom = document.getElementById("hotelRoom_1").value;
    document.getElementById("hotelRoom-1").textContent = hotelroom;
    let hotelamenities = document.getElementById("hotelAmenities_1").value;
    document.getElementById("hotelAmenities-1").textContent = hotelamenities;
    let hotelContact = document.getElementById("hotelContact_1").value;
    document.getElementById("hotelContact-1").textContent = hotelContact;
}

function updateHotel2() {
    let hotelName = document.getElementById("hotelName_2").value;
    document.getElementById("hotelName-2").textContent = hotelName;
    let hotelLocation = document.getElementById("hotelLocation_2").value;
    document.getElementById("hotelLocation-2").textContent = hotelLocation;
    let hotelStay = document.getElementById("hotelStay_2").value;
    document.getElementById("hotelStay-2").textContent = hotelStay;
    let hotelAddress = document.getElementById("hotelAddress_2").value;
    document.getElementById("hotelAddress-2").textContent = hotelAddress;
    let checkIn = document.getElementById("checkIn_2").value;
    document.getElementById("checkIn-2").textContent = checkIn;
    let checkOut = document.getElementById("checkOut_2").value;
    document.getElementById("checkOut-2").textContent = checkOut;
    let hotelroom = document.getElementById("hotelRoom_2").value;
    document.getElementById("hotelRoom-2").textContent = hotelroom;
    let hotelamenities = document.getElementById("hotelAmenities_2").value;
    document.getElementById("hotelAmenities-2").textContent = hotelamenities;
    let hotelContact = document.getElementById("hotelContact_2").value;
    document.getElementById("hotelContact-2").textContent = hotelContact;
}

let itineraryData = [];

function initItineraryEditor() {
    // Pull existing days from the live itinerary page
    const liveDays = document.querySelectorAll('.itinerary-day');
    itineraryData = [];

    liveDays.forEach(function(day, index) {
        const title = day.querySelector('.day-info h2')?.textContent || '';
        const subtitle = day.querySelector('.day-info p')?.textContent || '';
        const activities = [];

        day.querySelectorAll('.schedule-item').forEach(function(item) {
            activities.push({
                time: item.querySelector('.schedule-time')?.textContent || '',
                name: item.querySelector('strong')?.textContent || '',
                description: item.querySelector('p')?.textContent || ''
            });
        });

        itineraryData.push({ title, subtitle, activities });
    });

    renderItineraryEditor();
}

function renderItineraryEditor() {
    const container = document.getElementById('itinerary-edit-container');
    container.innerHTML = '';

    itineraryData.forEach(function(day, dayIndex) {
        const dayBlock = document.createElement('div');
        dayBlock.className = 'edit-day-block';
        dayBlock.style = 'border:1px solid #ccc; border-radius:8px; padding:16px; margin-bottom:16px;';

        dayBlock.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0;">Day ${dayIndex + 1}</h3>
                <button onclick="removeDay(${dayIndex})" style="background:#8B1538; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">Remove Day</button>
            </div>

            <label>Day Title</label><br>
            <input type="text" value="${day.title}" oninput="itineraryData[${dayIndex}].title = this.value"
                style="width:100%; margin-bottom:8px; padding:6px; border:1px solid #ccc; border-radius:4px;">

            <label>Subtitle</label><br>
            <input type="text" value="${day.subtitle}" oninput="itineraryData[${dayIndex}].subtitle = this.value"
                style="width:100%; margin-bottom:12px; padding:6px; border:1px solid #ccc; border-radius:4px;">

            <strong>Activities</strong>
            <div id="activities-${dayIndex}">
                ${day.activities.map((act, actIndex) => `
                    <div style="border:1px solid #eee; border-radius:6px; padding:10px; margin-top:8px;">
                        <label>Time</label><br>
                        <input type="time" value="${act.time}" oninput="itineraryData[${dayIndex}].activities[${actIndex}].time = this.value"
                            style="margin-bottom:6px; padding:5px; border:1px solid #ccc; border-radius:4px;">
                        <br>
                        <label>Activity Name</label><br>
                        <input type="text" value="${act.name}" oninput="itineraryData[${dayIndex}].activities[${actIndex}].name = this.value"
                            style="width:100%; margin-bottom:6px; padding:6px; border:1px solid #ccc; border-radius:4px;">
                        <label>Description</label><br>
                        <input type="text" value="${act.description}" oninput="itineraryData[${dayIndex}].activities[${actIndex}].description = this.value"
                            style="width:100%; margin-bottom:6px; padding:6px; border:1px solid #ccc; border-radius:4px;">
                        <button onclick="removeActivity(${dayIndex}, ${actIndex})"
                            style="background:#ccc; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">Remove Activity</button>
                    </div>
                `).join('')}
            </div>
            <button onclick="addActivity(${dayIndex})"
                style="margin-top:10px; background:none; border:1px solid #8B1538; color:#8B1538; padding:6px 12px; border-radius:6px; cursor:pointer;">+ Add Activity</button>
        `;

        container.appendChild(dayBlock);
    });
}

function addDay() {
    itineraryData.push({
        title: 'New Day',
        subtitle: '',
        activities: []
    });
    renderItineraryEditor();
}

function removeDay(dayIndex) {
    itineraryData.splice(dayIndex, 1);
    renderItineraryEditor();
}

function addActivity(dayIndex) {
    itineraryData[dayIndex].activities.push({ time: '', name: '', description: '' });
    renderItineraryEditor();
}

function removeActivity(dayIndex, actIndex) {
    itineraryData[dayIndex].activities.splice(actIndex, 1);
    renderItineraryEditor();
}

function applyItineraryChanges() {
    const container = document.querySelector('.itinerary-container');
    container.innerHTML = '';

    itineraryData.forEach(function(day, index) {
        const dayEl = document.createElement('div');
        dayEl.className = 'itinerary-day';
        dayEl.innerHTML = `
            <div class="day-header">
                <div class="day-number">Day ${index + 1}</div>
                <div class="day-info">
                    <h2>${day.title}</h2>
                    <p>${day.subtitle}</p>
                </div>
            </div>
            <div class="day-schedule">
                ${day.activities.map(act => `
                    <div class="schedule-item">
                        <div class="schedule-time">${act.time}</div>
                        <div class="schedule-content">
                            <strong>${act.name}</strong>
                            <p>${act.description}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        container.appendChild(dayEl);
    });
}