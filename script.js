// HubSpot Meeting Scheduler Integration
function openScheduler() {
    // HubSpot meeting scheduler URL
    const meetingLink = 'https://meetings-na2.hubspot.com/baba-newton';

    // Open in new tab/window
    window.open(meetingLink, '_blank');
}

// Load HubSpot scheduler embed
function loadHubSpotScheduler() {
    const schedulerContainer = document.getElementById('hubspot-scheduler');

    if (!schedulerContainer) return;

    // Add loading state
    schedulerContainer.classList.add('loading');
    schedulerContainer.innerHTML = '<p>Loading scheduler...</p>';

    // Embed HubSpot meeting scheduler directly
    const iframe = document.createElement('iframe');
    iframe.src = 'https://meetings-na2.hubspot.com/baba-newton';
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '8px';
    iframe.onload = function() {
        schedulerContainer.classList.remove('loading');
    };

    // Clear loading message and add iframe
    schedulerContainer.innerHTML = '';
    schedulerContainer.appendChild(iframe);
}

// Contact form validation (if needed)
function validateContactForm() {
    // Basic form validation for any additional forms
    const requiredFields = ['name', 'phone', 'address', 'school'];
    let isValid = true;

    requiredFields.forEach(field => {
        const element = document.getElementById(field);
        if (element && !element.value.trim()) {
            element.style.borderColor = 'red';
            isValid = false;
        } else if (element) {
            element.style.borderColor = '#ddd';
        }
    });

    return isValid;
}

// Smooth scrolling for navigation
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Phone number formatting
function formatPhoneNumber(input) {
    const phone = input.value.replace(/\D/g, '');
    if (phone.length >= 10) {
        input.value = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initSmoothScrolling();
    loadHubSpotScheduler();

    // Add phone number formatting to phone input if it exists
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    }

    // Add click tracking for CTA buttons
    document.querySelectorAll('.cta-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Track button clicks (implement analytics here)
            console.log('CTA clicked:', this.textContent.trim());
        });
    });
});

// Security: Prevent common XSS attacks
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Error handling
window.addEventListener('error', function(e) {
    console.error('JavaScript error:', e.error);
    // Could send to error tracking service
});

// Performance: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);
