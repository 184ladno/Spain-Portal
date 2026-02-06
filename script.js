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
});

function initializePortal() {
    // Check if user is logged in
    const username = sessionStorage.getItem('username');
    if (!username) {
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay) {
        usernameDisplay.textContent = username;
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
    
    // Set initial active page based on URL hash or default to overview
    const hash = window.location.hash.substring(1);
    const initialPage = hash || 'overview';
    
    navItems.forEach(item => {
        if (item.getAttribute('data-page') === initialPage) {
            item.click();
        }
    });
}

function logout() {
    sessionStorage.removeItem('username');
    window.location.href = 'index.html';
}
