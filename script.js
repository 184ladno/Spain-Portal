const STORAGE_KEY = 'spainPortalDatabase';
const CURRENT_USER_KEY = 'spainPortalCurrentUser';
const ITINERARY_KEY = 'spainPortalItinerary';

const defaultDatabase = {
    teachers: [
        {
            id: 'T001',
            username: 'teacher',
            password: 'teacher123',
            role: 'teacher',
            name: 'Ms. Harper',
            email: 'harper@school.com',
            lastLogin: ''
        }
    ],
    students: [
        {
            id: 'S001',
            username: 'Assia Johnson',
            password: 'assia123',
            role: 'student',
            name: 'Assia Johnson',
            email: 'assia.johnson@student.com',
            group: 'Barcelona Cohort A',
            emergencyContact: '+44 121 XXXX XXX',
            outboundFlight: 'BA2641 (09:00 - 12:30)',
            returnFlight: 'BA2642 (15:00 - 17:45)',
            hotel: 'Hotel 1',
            roomNumber: '302',
            checkIn: '14:00',
            checkOut: '11:00',
            lastLogin: '2026-05-28 14:32'
        },
        {
            id: 'S002',
            username: 'Emily Smith',
            password: 'emily123',
            role: 'student',
            name: 'Emily Smith',
            email: 'emily.smith@student.com',
            group: 'Barcelona Cohort A',
            emergencyContact: '+44 121 XXXX XXX',
            outboundFlight: 'BA2641 (09:00 - 12:30)',
            returnFlight: 'BA2642 (15:00 - 17:45)',
            hotel: 'Hotel 1',
            roomNumber: '303',
            checkIn: '14:00',
            checkOut: '11:00',
            lastLogin: '2026-05-28 14:32'
        },
        {
            id: 'S003',
            username: 'Marcus Taylor',
            password: 'marcus123',
            role: 'student',
            name: 'Marcus Taylor',
            email: 'marcus.taylor@student.com',
            group: 'Sevilla Cohort B',
            emergencyContact: '+44 121 XXXX XXX',
            outboundFlight: 'BA2641 (09:00 - 12:30)',
            returnFlight: 'BA2642 (15:00 - 17:45)',
            hotel: 'Hotel 2',
            roomNumber: '205',
            checkIn: '14:00',
            checkOut: '11:00',
            lastLogin: '2026-05-28 14:32'
        },
        {
            id: 'S004',
            username: 'Sophie Brown',
            password: 'sophie123',
            role: 'student',
            name: 'Sophie Brown',
            email: 'sophie.brown@student.com',
            group: 'Sevilla Cohort B',
            emergencyContact: '+44 121 XXXX XXX',
            outboundFlight: 'BA2641 (09:00 - 12:30)',
            returnFlight: 'BA2642 (15:00 - 17:45)',
            hotel: 'Hotel 2',
            roomNumber: '206',
            checkIn: '14:00',
            checkOut: '11:00',
            lastLogin: '2026-05-28 14:32'
        },
        {
            id: 'S005',
            username: 'James Wilson',
            password: 'james123',
            role: 'student',
            name: 'James Wilson',
            email: 'james.wilson@student.com',
            group: 'Madrid Cohort C',
            emergencyContact: '+44 121 XXXX XXX',
            outboundFlight: 'BA2641 (09:00 - 12:30)',
            returnFlight: 'BA2642 (15:00 - 17:45)',
            hotel: 'Hotel 1',
            roomNumber: '304',
            checkIn: '14:00',
            checkOut: '11:00',
            lastLogin: '2026-05-28 14:32'
        }
    ]
};

function getDatabase() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
        try {
            const db = JSON.parse(raw);
            if (db && Array.isArray(db.teachers) && Array.isArray(db.students)) {
                return db;
            }
            // Migrate legacy users array if present
            if (db && Array.isArray(db.users)) {
                const teachers = db.users.filter(user => user.role === 'teacher');
                const students = db.users.filter(user => user.role === 'student');
                const migrated = {
                    teachers: teachers.length ? teachers : defaultDatabase.teachers,
                    students: students.length ? students : defaultDatabase.students
                };
                saveDatabase(migrated);
                return migrated;
            }
            console.warn('Stored database schema is invalid, resetting to default.');
        } catch (error) {
            console.error('Failed to parse stored database.', error);
        }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultDatabase));
    return JSON.parse(JSON.stringify(defaultDatabase));
}

function saveDatabase(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

function saveItineraryToStorage() {
    try {
        localStorage.setItem(ITINERARY_KEY, JSON.stringify(itineraryData || []));
    } catch (e) {
        console.error('Failed to save itinerary to storage', e);
    }
}

function loadItineraryFromStorage(applyChanges = false) {
    try {
        const raw = localStorage.getItem(ITINERARY_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
        if (!Array.isArray(data)) return false;
        itineraryData = data;
        // Update the live DOM with stored itinerary only if explicitly requested
        if (applyChanges) {
            applyItineraryChanges();
        }
        return true;
    } catch (e) {
        console.error('Failed to load itinerary from storage', e);
        return false;
    }
}

function normalizeLoginName(value) {
    return (value || '').trim().toLowerCase();
}

function findUser(username, role) {
    const db = getDatabase();
    const source = role === 'teacher' ? db.teachers : db.students;
    return source.find(user => normalizeLoginName(user.username) === normalizeLoginName(username));
}

function loginUser(username, password, role) {
    const db = getDatabase();
    const source = role === 'teacher' ? (db.teachers || []) : (db.students || []);
    const user = source.find(u => normalizeLoginName(u.username) === normalizeLoginName(username));
    if (!user || user.password !== password) {
        return null;
    }
    user.lastLogin = new Date().toISOString().slice(0, 16).replace('T', ' ');
    saveDatabase(db);
    return user;
}

function getCurrentUser() {
    const raw = sessionStorage.getItem(CURRENT_USER_KEY);
    if (!raw) {
        return null;
    }
    try {
        return JSON.parse(raw);
    } catch {
        return null;
    }
}

function setCurrentUser(user) {
    sessionStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ username: user.username, role: user.role }));
}

function clearCurrentUser() {
    sessionStorage.removeItem(CURRENT_USER_KEY);
}

function getLoggedInUserData() {
    const current = getCurrentUser();
    if (!current) {
        return null;
    }

    return findUser(current.username, current.role);
}

function isTeacherUser() {
    const current = getCurrentUser();
    return current && current.role === 'teacher';
}

function isStudentUser() {
    const current = getCurrentUser();
    return current && current.role === 'student';
}

function initializeDatabase() {
    if (!localStorage.getItem(STORAGE_KEY)) {
        saveDatabase(defaultDatabase);
    }
}

// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeDatabase();
    updatePortalSideLinesStart();

    const loginForm = document.getElementById('loginForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role') ? document.getElementById('role').value : 'student';
            
            if (!username || !password) {
                alert('Please enter both name/username and password.');
                return;
            }

            const user = loginUser(username, password, role);
            if (!user) {
                alert('Invalid login. Use the correct name/username, password and role.');
                return;
            }

            setCurrentUser(user);
            window.location.href = 'portal.html';
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
    const currentUserData = getLoggedInUserData();

    if (!currentUserData && !isPublicPortal) {
        window.location.href = 'login.html';
        return;
    }

    const displayName = currentUserData ? (currentUserData.name || currentUserData.username) : 'Guest';

    // Display username in the header
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = displayName;
    }

    // Populate profile details and group members
    if (currentUserData) {
        populatePersonalDetails(currentUserData);
    }

    const fullNameSection = document.getElementById('fullNameDisplay');
    if (fullNameSection) {
        fullNameSection.textContent = displayName;
    }

    // Navigation functionality
    const navItems = document.querySelectorAll('.nav-item');
    const pageContents = document.querySelectorAll('.page-content');

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const targetPage = this.getAttribute('data-page');

            if (targetPage === 'editing' && currentUserData && currentUserData.role !== 'teacher') {
                alert('Only teachers can access the editing area.');
                return;
            }

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
    
    // Hide teacher-only controls for student users
    const teacherOnlySelectors = ['[data-page="editing"]', '.add-student-button', '.export-button', '#studentSearchInput', '#hotelFilter'];
    const isTeacher = currentUserData && currentUserData.role === 'teacher';
    teacherOnlySelectors.forEach(selector => {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = isTeacher ? '' : 'none';
        }
    });

    // Ensure all pages are hidden except overview
    const allPages = document.querySelectorAll('.page-content');
    allPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Ensure all nav items are not active except first
    navItems.forEach(nav => {
        nav.classList.remove('active');
    });
    
    // Explicitly show overview
    const overviewPage = document.getElementById('overview');
    const overviewNav = document.querySelector('.nav-item[data-page="overview"]');
    if (overviewPage) {
        overviewPage.classList.add('active');
    }
    if (overviewNav) {
        overviewNav.classList.add('active');
    }

    // Set up navigation click handlers with initial page based on URL hash
    const hash = window.location.hash.substring(1);
    let initialPage = hash || 'overview';
    let activated = false;

    if (!isTeacher && initialPage === 'editing') {
        initialPage = 'overview';
    }

    if (initialPage !== 'overview') {
        navItems.forEach(item => {
            if (item.getAttribute('data-page') === initialPage) {
                item.click();
                activated = true;
            }
        });
    } else {
        activated = true;
    }

    const documentInput = document.getElementById('documentUpload');
    const documentList = document.getElementById('documentList');

    renderStudentTable();
    bindStudentFilters();
    // Load saved itinerary data but don't apply it yet - let the overview show first
    loadItineraryFromStorage(false);

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
}

function populatePersonalDetails(userData) {
    const fullName = document.getElementById('fullNameDisplay');
    const groupDisplay = document.getElementById('studentGroupDisplay');
    const emergencyDisplay = document.getElementById('emergencyContactDisplay');
    const groupMembersList = document.getElementById('groupMembersList');

    if (fullName && userData) {
        fullName.textContent = userData.name || userData.username;
    }
    if (groupDisplay) {
        groupDisplay.textContent = userData.group || 'N/A';
    }
    if (emergencyDisplay) {
        emergencyDisplay.textContent = userData.emergencyContact || 'Not available';
    }

    if (groupMembersList) {
        if (userData.role === 'student') {
            const studentsInGroup = getDatabase().students.filter(student => student.group === userData.group);
            groupMembersList.innerHTML = studentsInGroup.map(student => `<li>${student.name}</li>`).join('') || '<li>No group members listed.</li>';
        } else {
            const students = getDatabase().students;
            groupMembersList.innerHTML = students.map(student => `<li>${student.name}</li>`).join('');
        }
    }
}

function bindStudentFilters() {
    const searchInput = document.getElementById('studentSearchInput');
    const hotelFilter = document.getElementById('hotelFilter');
    if (searchInput) {
        searchInput.addEventListener('input', applyStudentFilters);
    }
    if (hotelFilter) {
        hotelFilter.addEventListener('change', applyStudentFilters);
    }
}

function applyStudentFilters() {
    const searchValue = document.getElementById('studentSearchInput')?.value.toLowerCase().trim() || '';
    const hotelValue = document.getElementById('hotelFilter')?.value || '';
    const rows = document.querySelectorAll('.student-details-table tbody tr');

    rows.forEach(row => {
        const cells = Array.from(row.querySelectorAll('td')).map(cell => cell.textContent.toLowerCase());
        const matchesSearch = searchValue === '' || cells.some(text => text.includes(searchValue));
        const matchesHotel = hotelValue === '' || row.querySelector('td:nth-child(6)')?.textContent === hotelValue;
        row.style.display = matchesSearch && matchesHotel ? '' : 'none';
    });
}

function renderStudentTable() {
    const tableBody = document.getElementById('studentTableBody');
    if (!tableBody) {
        return;
    }

    const userData = getLoggedInUserData();
    const allStudents = getDatabase().students;
    const rows = [];
    const visibleStudents = userData && userData.role === 'student'
        ? allStudents.filter(student => normalizeLoginName(student.username) === normalizeLoginName(userData.username))
        : allStudents;

    visibleStudents.forEach(student => {
        const row = document.createElement('tr');
        row.dataset.username = student.username;
        row.dataset.password = student.password || '';
        row.dataset.studentId = student.id || '';
        row.innerHTML = `
            <td>${student.id || ''}</td>
            <td>${student.name || ''}</td>
            <td>${student.group || ''}</td>
            <td>${student.outboundFlight || ''}</td>
            <td>${student.returnFlight || ''}</td>
            <td>${student.hotel || ''}</td>
            <td>${student.roomNumber || ''}</td>
            <td>${student.checkIn || ''}</td>
            <td>${student.checkOut || ''}</td>
            <td><span class="password-mask">•••••••••</span></td>
            <td>${student.email || ''}</td>
            <td>${student.emergencyContact || ''}</td>
            <td>
                <button class="view-btn" onclick="viewStudentDetails(this)">View</button>
                ${userData && userData.role === 'teacher' ? `<button class="edit-btn" onclick="openEditStudentModal(this)">Edit</button>` : ''}
            </td>
        `;
        rows.push(row);
    });

    tableBody.innerHTML = '';
    rows.forEach(row => tableBody.appendChild(row));
    updateStudentStats();
}

function openEditStudentModal(button) {
    const row = button.closest('tr');
    if (!row) {
        return;
    }

    const student = findUser(row.dataset.username, 'student');
    if (!student) {
        return;
    }

    document.getElementById('addEditStudentForm').reset();
    document.getElementById('addEditStudentForm').dataset.mode = 'edit';
    document.getElementById('addEditStudentForm').dataset.studentId = student.id || '';
    document.getElementById('addEditModalTitle').textContent = 'Edit Student Information';
    document.getElementById('formStudentID').value = student.id || '';
    document.getElementById('formStudentID').disabled = true;
    document.getElementById('formStudentName').value = student.name || '';
    document.getElementById('formStudentEmail').value = student.email || '';
    document.getElementById('formStudentGroup').value = student.group || '';
    document.getElementById('formEmergencyContact').value = student.emergencyContact || '';
    document.getElementById('formPortalPassword').value = '';
    document.getElementById('formPortalPassword').placeholder = 'Leave blank to keep current password';
    document.getElementById('formPortalPassword').required = false;
    document.getElementById('formOutboundFlight').value = student.outboundFlight || '';
    document.getElementById('formReturnFlight').value = student.returnFlight || '';
    document.getElementById('formHotel').value = student.hotel || '';
    document.getElementById('formRoomNumber').value = student.roomNumber || '';
    document.getElementById('formCheckIn').value = student.checkIn || '';
    document.getElementById('formCheckOut').value = student.checkOut || '';

    document.getElementById('addEditStudentModal').style.display = 'flex';
}

function logout() {
    clearCurrentUser();
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

// Student Details Functions
function viewStudentDetails(button) {
    const row = button.closest('tr');
    const cells = row.querySelectorAll('td');
    const password = row.dataset.password || '';

    const studentData = {
        id: cells[0].textContent,
        name: cells[1].textContent,
        group: cells[2].textContent,
        outboundFlight: cells[3].textContent,
        returnFlight: cells[4].textContent,
        hotelName: cells[5].textContent,
        roomNumber: cells[6].textContent,
        checkIn: cells[7].textContent,
        checkOut: cells[8].textContent,
        email: cells[10].textContent,
        emergencyContact: cells[11].textContent,
        password
    };

    document.getElementById('modalStudentName').textContent = studentData.name;
    document.getElementById('modalStudentID').textContent = studentData.id;
    document.getElementById('modalStudentGroup').textContent = studentData.group;
    document.getElementById('modalStudentEmail').textContent = studentData.email;
    document.getElementById('modalEmergencyContact').textContent = studentData.emergencyContact;
    
    document.getElementById('modalOutboundFlight').textContent = studentData.outboundFlight;
    document.getElementById('modalReturnFlight').textContent = studentData.returnFlight;
    document.getElementById('modalOutboundSeat').textContent = 'A' + Math.floor(Math.random() * 20 + 1);
    document.getElementById('modalReturnSeat').textContent = 'B' + Math.floor(Math.random() * 20 + 1);
    
    document.getElementById('modalHotelName').textContent = studentData.hotelName;
    document.getElementById('modalRoomNumber').textContent = studentData.roomNumber;
    document.getElementById('modalCheckIn').textContent = studentData.checkIn;
    document.getElementById('modalCheckOut').textContent = studentData.checkOut;
    document.getElementById('modalHotelContact').textContent = '+34 123 456 789 / hotel@email.com';
    
    const passwordSpan = document.getElementById('modalPassword');
    passwordSpan.textContent = '•••••••••';
    passwordSpan.dataset.value = studentData.password || '';
    passwordSpan.classList.add('password-hidden');
    passwordSpan.classList.remove('password-visible');
    
    document.getElementById('studentDetailModal').style.display = 'flex';
}

function closeStudentModal() {
    document.getElementById('studentDetailModal').style.display = 'none';
}

function togglePasswordVisibility(event) {
    const passwordSpan = document.getElementById('modalPassword');
    const btn = event.target;
    const actualPassword = passwordSpan.dataset.value || '';

    if (passwordSpan.classList.contains('password-hidden')) {
        passwordSpan.textContent = actualPassword || '•••••••••';
        passwordSpan.classList.remove('password-hidden');
        passwordSpan.classList.add('password-visible');
        btn.textContent = 'Hide Password';
    } else {
        passwordSpan.textContent = '•••••••••';
        passwordSpan.classList.add('password-hidden');
        passwordSpan.classList.remove('password-visible');
        btn.textContent = 'Show Password';
    }
}

function resetPassword() {
    if (confirm('Are you sure you want to reset this student\'s password? A new temporary password will be generated.')) {
        const newPassword = 'Temp' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const studentID = document.getElementById('modalStudentID').textContent;
        const db = getDatabase();
        const student = db.students.find(user => user.id === studentID);

        if (student) {
            student.password = newPassword;
            saveDatabase(db);
        }

        document.getElementById('modalPassword').textContent = newPassword;
        document.getElementById('modalPassword').dataset.value = newPassword;
        document.getElementById('modalPassword').classList.remove('password-hidden');
        document.getElementById('modalPassword').classList.add('password-visible');
        const toggleBtn = document.querySelector('.toggle-password-btn');
        if (toggleBtn) {
            toggleBtn.textContent = 'Hide Password';
        }

        document.querySelectorAll('.student-details-table tbody tr').forEach(row => {
            if (row.querySelector('td')?.textContent === studentID) {
                row.dataset.password = newPassword;
            }
        });

        alert('Password reset successfully. New temporary password: ' + newPassword);
    }
}

function exportStudentData() {

    let csv = 'Student ID,Name,Group,Outbound Flight,Return Flight,Hotel,Room,Check-in,Check-out,Email,Emergency Contact\n';
    
    const rows = document.querySelectorAll('.student-details-table tbody tr');
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const rowData = Array.from(cells).slice(0, -1).map(cell => {
            const text = cell.textContent.trim();
            return `"${text}"`;
        }).join(',');
        csv += rowData + '\n';
    });
    

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'student_details_' + new Date().toISOString().split('T')[0] + '.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    alert('Student data exported successfully!');
}

document.addEventListener('click', function(event) {
    const modal = document.getElementById('studentDetailModal');
    if (modal && event.target === modal) {
        closeStudentModal();
    }
});

function openAddStudentModal() {
    document.getElementById('addEditStudentForm').reset();
    document.getElementById('addEditStudentForm').dataset.mode = 'add';
    document.getElementById('addEditStudentForm').dataset.studentId = '';
    
    document.getElementById('addEditModalTitle').textContent = 'Add New Student';
    document.getElementById('formStudentID').disabled = false;
    document.getElementById('formPortalPassword').placeholder = 'Create password';
    document.getElementById('formPortalPassword').required = true;
    
    document.getElementById('addEditStudentModal').style.display = 'flex';
}

function closeAddEditModal() {
    document.getElementById('addEditStudentModal').style.display = 'none';
    document.getElementById('addEditStudentForm').reset();
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('addEditStudentForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            saveStudentData();
        });
    }
});

function saveStudentData() {
    const form = document.getElementById('addEditStudentForm');
    const mode = form.dataset.mode;
    const originalStudentId = form.dataset.studentId;
    const studentID = document.getElementById('formStudentID').value.trim();
    const studentName = document.getElementById('formStudentName').value.trim();
    const studentEmail = document.getElementById('formStudentEmail').value.trim();
    const studentGroup = document.getElementById('formStudentGroup').value.trim();
    const emergencyContact = document.getElementById('formEmergencyContact').value.trim();
    const password = document.getElementById('formPortalPassword').value.trim();
    const outboundFlight = document.getElementById('formOutboundFlight').value.trim();
    const returnFlight = document.getElementById('formReturnFlight').value.trim();
    const hotel = document.getElementById('formHotel').value;
    const roomNumber = document.getElementById('formRoomNumber').value.trim();
    const checkIn = document.getElementById('formCheckIn').value;
    const checkOut = document.getElementById('formCheckOut').value;

    if (!studentID || !studentName || !studentEmail || !studentGroup || !emergencyContact || !outboundFlight || !returnFlight || !hotel || !roomNumber || !checkIn || !checkOut) {
        alert('Please fill in all required fields');
        return;
    }

    if (mode === 'add' && !password) {
        alert('Password is required for new students');
        return;
    }

    const db = getDatabase();

    if (mode === 'add') {
        if (db.students.some(user => user.id === studentID)) {
            alert('A student with that ID already exists.');
            return;
        }

        const newStudent = {
            id: studentID,
            username: studentName,
            password,
            role: 'student',
            name: studentName,
            email: studentEmail,
            group: studentGroup,
            emergencyContact,
            outboundFlight,
            returnFlight,
            hotel,
            roomNumber,
            checkIn,
            checkOut,
            lastLogin: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };

        db.students.push(newStudent);
        saveDatabase(db);
        renderStudentTable();
        alert(`Student ${studentName} (${studentID}) has been added successfully!\nTemporary Password: ${password}`);
    } else {
        const student = db.students.find(user => user.id === originalStudentId);
        if (!student) {
            alert('Could not find the student to update.');
            return;
        }

        student.name = studentName;
        student.username = studentName;
        student.email = studentEmail;
        student.group = studentGroup;
        student.emergencyContact = emergencyContact;
        student.outboundFlight = outboundFlight;
        student.returnFlight = returnFlight;
        student.hotel = hotel;
        student.roomNumber = roomNumber;
        student.checkIn = checkIn;
        student.checkOut = checkOut;
        if (password) {
            student.password = password;
        }

        saveDatabase(db);
        renderStudentTable();
        alert(`Student ${studentName} (${studentID}) has been updated successfully!`);
    }

    closeAddEditModal();
}

function updateStudentStats() {
    const rows = document.querySelectorAll('.student-details-table tbody tr');
    const totalStudents = rows.length;
    let hotel1Count = 0;
    let hotel2Count = 0;

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const hotel = cells[5].textContent;
        if (hotel === 'Hotel 1') {
            hotel1Count++;
        } else if (hotel === 'Hotel 2') {
            hotel2Count++;
        }
    });

    document.getElementById('totalStudents').textContent = totalStudents;
    document.getElementById('hotel1Count').textContent = hotel1Count;
    document.getElementById('hotel2Count').textContent = hotel2Count;
}


document.addEventListener('click', function(event) {
    const modal = document.getElementById('addEditStudentModal');
    if (modal && event.target === modal) {
        closeAddEditModal();
    }
});
let itineraryData = [];
let selectedDay = 0;

function initItineraryEditor() {
    // Prefer persisted itinerary when available so editor edits don't get
    // overwritten by the original static DOM markup.
    itineraryData = [];
    const loaded = loadItineraryFromStorage(true);
    if (loaded) {
        console.log('initItineraryEditor: loaded itinerary from storage, items=', itineraryData.length);
    } else {
        const liveDays = document.querySelectorAll('.itinerary-day');
        console.log('initItineraryEditor: found liveDays', liveDays.length);

        liveDays.forEach(function(day) {
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
        console.log('initItineraryEditor: read from DOM, items=', itineraryData.length);
    }

    selectedDay = 0;
    renderDaySelector();
    renderDayEditor();
}

function renderDaySelector() {
    const selector = document.getElementById('day-selector');
    selector.innerHTML = '';

    itineraryData.forEach(function(day, index) {
        const btn = document.createElement('button');
        btn.textContent = 'Day ' + (index + 1);
        btn.style = `
            padding: 8px 16px;
            border-radius: 6px;
            border: 1px solid #8B1538;
            background: ${index === selectedDay ? '#8B1538' : 'white'};
            color: ${index === selectedDay ? 'white' : '#8B1538'};
            cursor: pointer;
            font-size: 14px;
        `;
        btn.onclick = function() {
            selectedDay = index;
            renderDaySelector();
            renderDayEditor();
        };
        selector.appendChild(btn);
    });
}

function renderDayEditor() {
    const container = document.getElementById('day-editor');
    const day = itineraryData[selectedDay];
    console.log('renderDayEditor: selectedDay=', selectedDay, 'day=', day);

    if (!day) {
        container.innerHTML = '<p>No day selected.</p>';
        return;
    }

    container.innerHTML = `
        <div style="border:1px solid #ccc; border-radius:8px; padding:16px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                <h3 style="margin:0;">Day ${selectedDay + 1}</h3>
                <button onclick="removeDay(${selectedDay})"
                    style="background:#8B1538; color:white; border:none; padding:6px 12px; border-radius:6px; cursor:pointer;">
                    Remove Day
                </button>
            </div>

            <label>Day Title</label><br>
            <input type="text" value="${day.title}"
                oninput="itineraryData[${selectedDay}].title = this.value"
                style="width:100%; margin-bottom:8px; padding:6px; border:1px solid #ccc; border-radius:4px;">

            <label>Subtitle</label><br>
            <input type="text" value="${day.subtitle}"
                oninput="itineraryData[${selectedDay}].subtitle = this.value"
                style="width:100%; margin-bottom:16px; padding:6px; border:1px solid #ccc; border-radius:4px;">

            <strong>Activities</strong>

            ${day.activities.map((act, actIndex) => `
                <div style="border:1px solid #eee; border-radius:6px; padding:10px; margin-top:10px;">
                    <label>Time</label><br>
                    <input type="time" value="${act.time}"
                        oninput="itineraryData[${selectedDay}].activities[${actIndex}].time = this.value"
                        style="margin-bottom:6px; padding:5px; border:1px solid #ccc; border-radius:4px;">
                    <br>
                    <label>Activity Name</label><br>
                    <input type="text" value="${act.name}"
                        oninput="itineraryData[${selectedDay}].activities[${actIndex}].name = this.value"
                        style="width:100%; margin-bottom:6px; padding:6px; border:1px solid #ccc; border-radius:4px;">
                    <label>Description</label><br>
                    <input type="text" value="${act.description}"
                        oninput="itineraryData[${selectedDay}].activities[${actIndex}].description = this.value"
                        style="width:100%; margin-bottom:6px; padding:6px; border:1px solid #ccc; border-radius:4px;">
                    <button onclick="removeActivity(${actIndex})"
                        style="background:#ccc; border:none; padding:4px 10px; border-radius:4px; cursor:pointer; font-size:12px;">
                        Remove Activity
                    </button>
                </div>
            `).join('')}

            <button onclick="addActivity()"
                style="margin-top:12px; background:none; border:1px solid #8B1538; color:#8B1538; padding:6px 14px; border-radius:6px; cursor:pointer;">
                + Add Activity
            </button>
        </div>
    `;
}

function addDay() {
    itineraryData.push({ title: 'New Day', subtitle: '', activities: [] });
    selectedDay = itineraryData.length - 1;
    renderDaySelector();
    renderDayEditor();
    console.log('addDay: itineraryData length now', itineraryData.length);
}

function removeDay(index) {
    itineraryData.splice(index, 1);
    selectedDay = Math.max(0, selectedDay - 1);
    renderDaySelector();
    renderDayEditor();
}

function addActivity() {
    itineraryData[selectedDay].activities.push({ time: '', name: '', description: '' });
    renderDayEditor();
}

function removeActivity(actIndex) {
    itineraryData[selectedDay].activities.splice(actIndex, 1);
    renderDayEditor();
}

function applyItineraryChanges() {
    console.log('applyItineraryChanges called. itineraryData length=', Array.isArray(itineraryData) ? itineraryData.length : 'not-array');
    const containers = Array.from(document.querySelectorAll('.itinerary-container'));
    if (containers.length === 0) {
        console.error('applyItineraryChanges: no .itinerary-container elements found in DOM');
        return;
    }

    containers.forEach((container, cIndex) => {
        console.log(`applyItineraryChanges: updating container ${cIndex} (parent id=${container.parentElement?.id || 'none'})`);
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
            // Ensure the new day is visible even if CSS animation rules target only first N children
            try {
                dayEl.style.opacity = '1';
            } catch (e) {
                /* ignore */
            }
        });

        console.log(`applyItineraryChanges: container ${cIndex} now has ${container.querySelectorAll('.itinerary-day').length} days`);
    });

    // Persist the currently applied itinerary so it remains after navigation/refresh
    saveItineraryToStorage();

    // Do not automatically switch to itinerary page - let the initial page load remain as overview
}

// Server-side database code removed — this file is client-side only.
// If you need a server-backed DB, create a separate Node.js backend file.