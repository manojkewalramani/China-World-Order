// ===== Scroll-triggered animations =====
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger siblings
                const parent = entry.target.parentElement;
                const siblings = parent ? Array.from(parent.querySelectorAll('[data-animate]')) : [];
                const index = siblings.indexOf(entry.target);
                const delay = index >= 0 ? index * 80 : 0;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);

                observer.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('[data-animate]').forEach((el) => {
    observer.observe(el);
});

// ===== Navbar scroll effect =====
const nav = document.getElementById('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 40) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
    lastScroll = scrollY;
}, { passive: true });

// ===== Mobile nav toggle =====
const navToggle = document.getElementById('navToggle');
const navMobile = document.getElementById('navMobile');

navToggle.addEventListener('click', () => {
    navMobile.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    if (navMobile.classList.contains('open')) {
        spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
        spans[1].style.opacity = '0';
        spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
    } else {
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    }
});

// Close mobile nav on link click
navMobile.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
        navMobile.classList.remove('open');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = '';
        spans[1].style.opacity = '';
        spans[2].style.transform = '';
    });
});

// ===== Smooth scroll for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            const offset = 70; // nav height
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

// ===== Modal system =====
const modalOverlay = document.getElementById('modalOverlay');
const modalContent = document.getElementById('modalContent');

window.openModal = function(id) {
    const template = document.getElementById('modal-' + id);
    if (!template) return;

    modalContent.innerHTML = template.innerHTML;
    modalOverlay.classList.add('open', 'entering');
    document.body.style.overflow = 'hidden';

    // Trigger animation
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            modalOverlay.classList.remove('entering');
        });
    });
}

window.closeModal = function() {
    modalOverlay.classList.add('entering');
    setTimeout(() => {
        modalOverlay.classList.remove('open', 'entering');
        modalContent.innerHTML = '';
        document.body.style.overflow = '';
    }, 250);
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('open')) {
        closeModal();
    }
});

// ===== Analyst Widget Rotation =====
(function() {
    const slides = document.querySelectorAll('.widget-slide');
    const dotsContainer = document.getElementById('widgetDots');
    if (!slides.length || !dotsContainer) return;

    const total = slides.length;
    let current = 0;
    let timer;

    // Create dots
    for (let i = 0; i < total; i++) {
        const dot = document.createElement('div');
        dot.className = 'widget-dot' + (i === 0 ? ' widget-dot--active' : '');
        dot.setAttribute('data-dot', i);
        dotsContainer.appendChild(dot);
    }

    function showSlide(idx) {
        slides.forEach((s, i) => {
            s.classList.toggle('widget-slide--active', i === idx);
        });
        dotsContainer.querySelectorAll('.widget-dot').forEach((d, i) => {
            d.classList.toggle('widget-dot--active', i === idx);
        });
        current = idx;
    }

    function nextSlide() {
        showSlide((current + 1) % total);
    }

    // Auto-rotate every 20 seconds
    timer = setInterval(nextSlide, 20000);

    // Pause on hover
    const widget = document.querySelector('.widget');
    if (widget) {
        widget.addEventListener('mouseenter', () => clearInterval(timer));
        widget.addEventListener('mouseleave', () => {
            clearInterval(timer);
            timer = setInterval(nextSlide, 20000);
        });
    }
})();
