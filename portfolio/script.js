// ===================================
// HELPERS
// ===================================
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canHover = window.matchMedia('(hover: hover)').matches;
const body = document.body;

// ===================================
// PRELOADER
// ===================================
window.addEventListener('load', () => body.classList.add('loaded'));
setTimeout(() => body.classList.add('loaded'), 4000);

// ===================================
// DARK MODE TOGGLE
// ===================================
const themeToggle = document.querySelector('.theme-toggle');
const themeIcon = themeToggle.querySelector('i');

if ((localStorage.getItem('theme') || 'light') === 'dark') {
    body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');

    themeIcon.classList.toggle('fa-sun', isDark);
    themeIcon.classList.toggle('fa-moon', !isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    themeToggle.classList.remove('spin');
    void themeToggle.offsetWidth;
    themeToggle.classList.add('spin');
});

// ===================================
// MOBILE MENU TOGGLE
// ===================================
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-link');
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===================================
// SCROLL EFFECTS (one optimized listener)
// ===================================
const sections = document.querySelectorAll('section[id]');
const scrollToTopBtn = document.getElementById('scrollToTop');
const progressBar = document.getElementById('scrollProgress');
const timeline = document.querySelector('.timeline');
const heroImage = document.querySelector('.hero-image');
let ticking = false;

function onScroll() {
    const y = window.scrollY;

    navbar.classList.toggle('scrolled', y > 100);
    scrollToTopBtn.classList.toggle('visible', y > 300);

    let current = 'home';
    sections.forEach(section => {
        if (y >= section.offsetTop - 200) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${maxScroll > 0 ? y / maxScroll : 0})`;

    if (timeline) {
        const rect = timeline.getBoundingClientRect();
        const progress = (window.innerHeight * 0.75 - rect.top) / rect.height;
        timeline.style.setProperty('--line', Math.min(Math.max(progress, 0), 1));
    }

    if (!prefersReducedMotion && window.innerWidth > 968 && heroImage.classList.contains('active')) {
        heroImage.style.transform = `translateY(${y * 0.3}px)`;
    }

    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        requestAnimationFrame(onScroll);
        ticking = true;
    }
});
onScroll();

scrollToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ===================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ===================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
});

// ===================================
// TYPING ANIMATION
// ===================================
const typingText = document.querySelector('.typing-text');
const texts = ['Front-End Developer', 'Web Designer', 'UI/UX Enthusiast', 'Problem Solver'];
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function type() {
    const currentText = texts[textIndex];
    let delay;

    if (isDeleting) {
        charIndex--;
        delay = 50;
    } else {
        charIndex++;
        delay = 100;
    }
    typingText.textContent = currentText.substring(0, charIndex);

    if (!isDeleting && charIndex === currentText.length) {
        isDeleting = true;
        delay = 2000;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        delay = 500;
    }

    setTimeout(type, delay);
}

window.addEventListener('load', () => setTimeout(type, 1200));

// ===================================
// SCROLL REVEAL (staggered, with directions)
// ===================================
const addClass = (sel, cls) => document.querySelectorAll(sel).forEach(el => el.classList.add(cls));
addClass('.timeline-item:nth-child(odd), .about-image, .contact-form-wrapper', 'reveal-left');
addClass('.timeline-item:nth-child(even), .contact-info', 'reveal-right');
addClass('.skill-card, .project-card, .experience-item', 'reveal-pop');

const reveals = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    let batch = 0;
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = batch * 90;
        el.style.transitionDelay = `${delay}ms`;
        el.classList.add('active');
        batch++;
        revealObserver.unobserve(el);

        setTimeout(() => {
            el.style.transitionDelay = '';
            if (!el.classList.contains('section-title')) el.classList.add('revealed');
        }, 900 + delay);
    });
}, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

function startReveals() {
    reveals.forEach(el => revealObserver.observe(el));
}

if (document.readyState === 'complete') {
    startReveals();
} else {
    window.addEventListener('load', () => setTimeout(startReveals, 450));
    setTimeout(startReveals, 4500);
}

// ===================================
// SKILL BARS ANIMATION
// ===================================
const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.skill-progress').forEach(bar => {
            bar.style.width = bar.dataset.progress + '%';
        });
        skillsObserver.disconnect();
    });
}, { threshold: 0.2 });

skillsObserver.observe(document.getElementById('skills'));

// ===================================
// COUNT-UP NUMBERS
// ===================================
function countUp(el, target, suffix, duration = 1500) {
    const start = performance.now();
    function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
}

if (!prefersReducedMotion) {
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            countUp(el, +el.dataset.target, el.dataset.suffix);
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('.skill-percentage, .highlight-item strong').forEach(el => {
        const match = el.textContent.trim().match(/^(\d+)(.*)$/);
        if (!match) return;
        el.dataset.target = match[1];
        el.dataset.suffix = match[2];
        el.textContent = '0' + match[2];
        counterObserver.observe(el);
    });
}

// ===================================
// SEAMLESS MARQUEE
// ===================================
const marqueeTrack = document.querySelector('.marquee-track');
if (marqueeTrack) marqueeTrack.innerHTML += marqueeTrack.innerHTML;

// ===================================
// HERO SHAPES FOLLOW THE MOUSE
// ===================================
const heroShapes = document.querySelectorAll('.hero-shapes .shape');

if (!prefersReducedMotion && canHover) {
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth - 0.5;
        const y = e.clientY / window.innerHeight - 0.5;
        heroShapes.forEach((shape, i) => {
            const depth = (i + 1) * 14;
            shape.style.translate = `${x * depth}px ${y * depth}px`;
        });
    });
}

// ===================================
// PROJECT CARD TILT EFFECT
// ===================================
if (!prefersReducedMotion && canHover) {
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            if (!card.classList.contains('revealed')) return;
            const rect = card.getBoundingClientRect();
            const rotateX = (e.clientY - rect.top - rect.height / 2) / 20;
            const rotateY = (rect.width / 2 - (e.clientX - rect.left)) / 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// ===================================
// MAGNETIC BUTTONS
// ===================================
if (!prefersReducedMotion && canHover) {
    document.querySelectorAll('.btn, .social-icons a, .theme-toggle').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.25;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
            btn.style.translate = `${x}px ${y}px`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.translate = '';
        });
    });
}

// ===================================
// CLICK BURST
// ===================================
const burstColors = ['var(--yellow)', 'var(--coral)', 'var(--blue)', 'var(--mint)', 'var(--violet)'];

if (!prefersReducedMotion) {
    document.addEventListener('click', (e) => {
        const count = 8;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('span');
            particle.className = 'click-particle';
            const angle = (Math.PI * 2 * i) / count;
            const distance = 40 + Math.random() * 30;
            particle.style.left = `${e.clientX}px`;
            particle.style.top = `${e.clientY}px`;
            particle.style.background = burstColors[i % burstColors.length];
            particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
            particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
            body.appendChild(particle);
            particle.addEventListener('animationend', () => particle.remove());
        }
    });
}

// ===================================
// CONTACT FORM SUBMISSION
// ===================================
const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('button[type="submit"]');

contactForm.addEventListener('invalid', () => {
    contactForm.classList.remove('shake');
    void contactForm.offsetWidth;
    contactForm.classList.add('shake');
}, true);

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;

    submitBtn.classList.add('sent');
    setTimeout(() => {
        alert(`Thank you for your message, ${name}! I'll get back to you soon.`);
        contactForm.reset();
        submitBtn.classList.remove('sent');
    }, prefersReducedMotion ? 0 : 900);
});

// ===================================
// TIPS CAROUSEL
// ===================================
let currentTip = 0;
const tipCards = document.querySelectorAll('.tip-card');
const indicators = document.querySelectorAll('.indicator');
const totalTips = tipCards.length;

function updateCarousel() {
    tipCards.forEach((card, index) => {
        card.classList.remove('active', 'prev');
        if (index === currentTip) card.classList.add('active');
        else if (index < currentTip) card.classList.add('prev');
    });
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentTip);
    });
}

function nextTip() {
    currentTip = (currentTip + 1) % totalTips;
    updateCarousel();
}

function prevTip() {
    currentTip = (currentTip - 1 + totalTips) % totalTips;
    updateCarousel();
}

function goToTip(index) {
    currentTip = index;
    updateCarousel();
}

let carouselInterval = setInterval(nextTip, 6000);

function resetCarouselTimer() {
    clearInterval(carouselInterval);
    carouselInterval = setInterval(nextTip, 6000);
}

const carouselContainer = document.querySelector('.carousel-container');
if (carouselContainer) {
    carouselContainer.addEventListener('mouseenter', () => clearInterval(carouselInterval));
    carouselContainer.addEventListener('mouseleave', resetCarouselTimer);
}

document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft') { prevTip(); resetCarouselTimer(); }
    if (e.key === 'ArrowRight') { nextTip(); resetCarouselTimer(); }
});

let touchStartX = 0;

if (carouselContainer) {
    carouselContainer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    carouselContainer.addEventListener('touchend', (e) => {
        const diff = touchStartX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextTip() : prevTip();
            resetCarouselTimer();
        }
    });
}

// ===================================
// CUSTOM CURSOR
// ===================================
if (canHover) {
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    body.appendChild(cursor);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.querySelectorAll('a, button, .skill-card, .project-card, .theme-toggle, .indicator').forEach(el => {
        el.addEventListener('mouseenter', () => cursor.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-hover'));
    });
}

// ===================================
// FOOTER YEAR
// ===================================
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===================================
// CONSOLE MESSAGE
// ===================================
console.log('%c Hello, Developer!', 'color: #ff6b6b; font-size: 20px; font-weight: bold;');
console.log('%cLooking for something? Feel free to explore the code!', 'color: #4d96ff; font-size: 14px;');
console.log(`%c ${new Date().getFullYear()} Jhon Kenneth Sevillano`, 'color: #6b7280; font-size: 12px;');
