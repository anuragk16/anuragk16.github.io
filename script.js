
// Create Intersection Observer to detect which section is in view
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Update navigation
            const currentId = entry.target.id;
            updateNavigation(currentId);
            
            // Update debug info
            updateDebugInfo(currentId, window.scrollY, window.innerHeight);
        }
    });
}, {
    rootMargin: '-50% 0px -50% 0px' // This creates a middle band for detection
});

// Observe all sections
document.querySelectorAll('section').forEach((section) => {
    observer.observe(section);
});

// Update navigation links
function updateNavigation(currentId) {
    document.querySelectorAll('nav ul li a').forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentId) {
            link.classList.add('active');
        }
    });
}


// Add click event listeners for smooth scrolling
document.querySelectorAll('nav ul li a').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

// Initial call
document.addEventListener('DOMContentLoaded', () => {
    // Find the initial visible section
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top >= -100 && rect.top <= window.innerHeight / 2) {
            updateNavigation(section.id);
            updateDebugInfo(section.id, window.scrollY, window.innerHeight);
        }
    });
});

// Certificate scrolling functionality with infinite loop
document.addEventListener('DOMContentLoaded', function() {
    const container = document.querySelector('.certificates-container');
    const leftBtn = document.querySelector('.scroll-btn.left.certif');
    const rightBtn = document.querySelector('.scroll-btn.right.certif');
    
    if (container && leftBtn && rightBtn) {
        // Clone certificates for infinite scroll
        const certificates = container.innerHTML;
        container.innerHTML = certificates + certificates + certificates; // Triple the content
        
        const scrollAmount = 320; // Adjust based on card width + gap
        
        // Scroll left with loop
        leftBtn.addEventListener('click', () => {
            container.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
            
            // Check if we need to loop
            if (container.scrollLeft <= scrollAmount) {
                // Jump to middle set without animation
                container.style.scrollBehavior = 'auto';
                container.scrollLeft = container.scrollWidth / 3;
                container.style.scrollBehavior = 'smooth';
            }
        });
        
        // Scroll right with loop
        rightBtn.addEventListener('click', () => {
            container.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
            
            // Check if we need to loop
            if (container.scrollLeft >= (container.scrollWidth - container.clientWidth - scrollAmount)) {
                // Jump to middle set without animation
                container.style.scrollBehavior = 'auto';
                container.scrollLeft = container.scrollWidth / 3;
                container.style.scrollBehavior = 'smooth';
            }
        });

        // Set initial scroll position to middle set
        container.scrollLeft = container.scrollWidth / 3;
    }
});
