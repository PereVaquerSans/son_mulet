/* --- Header scroll --- */
const header = document.getElementById('header');
if (header) {
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    });
    // Apply on load if already scrolled
    header.classList.toggle('scrolled', window.scrollY > 60);
}

/* --- Mobile nav --- */
const hamburger = document.getElementById('hamburger');
const navList = document.getElementById('navList');
const overlay = document.getElementById('overlay');

function toggleNav() {
    if (navList && overlay) {
        navList.classList.toggle('open');
        overlay.classList.toggle('show');
    }
}

if (hamburger) {
    hamburger.addEventListener('click', toggleNav);
}
if (overlay) {
    overlay.addEventListener('click', toggleNav);
}
if (navList) {
    navList.querySelectorAll('a').forEach(link =>
        link.addEventListener('click', () => {
            navList.classList.remove('open');
            if (overlay) overlay.classList.remove('show');
        })
    );
}

/* --- Scroll reveal --- */
const reveals = document.querySelectorAll('.reveal');
if (reveals.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    reveals.forEach(el => revealObserver.observe(el));
}

/* --- Smooth anchor scroll --- */
document.querySelectorAll('a[href^="#"], a[href*="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        const hashIndex = href.indexOf('#');
        if (hashIndex === -1) return;

        const hash = href.substring(hashIndex);
        if (hash === '#') return;

        const target = document.querySelector(hash);
        if (target) {
            e.preventDefault();
            const offset = header ? header.offsetHeight + 10 : 80;
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top, behavior: 'smooth' });
        }
    });
});

/* --- Auto-hide flash messages --- */
const flashMsg = document.getElementById('flashMessage');
if (flashMsg) {
    setTimeout(() => {
        flashMsg.style.opacity = '0';
        flashMsg.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => flashMsg.remove(), 400);
    }, 5000);
}

/* --- Form AJAX submission (booking & contact) --- */
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(bookingForm);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/booking', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            showFlash(result.success ? 'success' : 'error', result.message);
            if (result.success) bookingForm.reset();
        } catch (err) {
            showFlash('error', 'Error de connexió. Torna-ho a provar.');
        }
    });
}

const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        try {
            const res = await fetch('/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            const result = await res.json();
            showFlash(result.success ? 'success' : 'error', result.message);
            if (result.success) contactForm.reset();
        } catch (err) {
            showFlash('error', 'Error de connexió. Torna-ho a provar.');
        }
    });
}

/* --- Flash helper --- */
function showFlash(type, message) {
    // Remove existing flash
    const existing = document.getElementById('flashMessage');
    if (existing) existing.remove();

    const flash = document.createElement('div');
    flash.id = 'flashMessage';
    flash.className = `flash-message flash-${type}`;
    flash.innerHTML = `<span>${message}</span><button onclick="this.parentElement.remove()">✕</button>`;
    document.body.appendChild(flash);

    setTimeout(() => {
        flash.style.opacity = '0';
        flash.style.transform = 'translateX(-50%) translateY(-20px)';
        setTimeout(() => flash.remove(), 400);
    }, 5000);
}
