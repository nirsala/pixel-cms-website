/* ========================================
   Pixel CMS — App JavaScript
   ======================================== */

// YouTube IFrame API — force autoplay on mobile
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
document.head.appendChild(tag);

window.onYouTubeIframeAPIReady = function() {
    new YT.Player('heroVideo', {
        events: {
            onReady: function(e) {
                e.target.mute();
                e.target.playVideo();
            },
            onStateChange: function(e) {
                // keep looping
                if (e.data === YT.PlayerState.ENDED) {
                    e.target.playVideo();
                }
            }
        }
    });
};

document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll effect ---
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        lastScroll = currentScroll;
    });

    // --- Mobile menu toggle ---
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    mobileToggle.addEventListener('click', () => {
        mobileToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            mobileToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // --- Reveal on scroll ---
    const revealElements = document.querySelectorAll('.reveal');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // --- Counter animation ---
    const statNumbers = document.querySelectorAll('.stat-number');

    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const el = entry.target;
                const target = parseFloat(el.dataset.target);
                const isDecimal = target % 1 !== 0;
                const duration = 2000;
                const startTime = performance.now();

                const animate = (currentTime) => {
                    const elapsed = currentTime - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic

                    const current = eased * target;
                    el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current);

                    if (progress < 1) {
                        requestAnimationFrame(animate);
                    } else {
                        el.textContent = isDecimal ? target.toFixed(1) : target;
                    }
                };

                requestAnimationFrame(animate);
                counterObserver.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => counterObserver.observe(el));

    // --- FAQ accordion ---
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all
            faqItems.forEach(i => i.classList.remove('active'));

            // Toggle current
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                const navHeight = navbar.offsetHeight;
                const targetPosition = target.offsetTop - navHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // --- Contact form submission ---
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const btn = contactForm.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'נשלח בהצלחה! ✓';
            btn.style.background = '#34D399';
            btn.disabled = true;

            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.disabled = false;
                contactForm.reset();
            }, 3000);
        });
    }

    // --- Active nav link highlighting ---
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', () => {
        const scrollPos = window.pageYOffset + navbar.offsetHeight + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = document.querySelector(`.nav-links a[href="#${id}"]`);

            if (link) {
                if (scrollPos >= top && scrollPos < top + height) {
                    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
                    link.classList.add('active');
                }
            }
        });
    });

    // ===== DASHBOARD MOCKUP TABS =====
    const mockupMenuItems = document.querySelectorAll('.mockup-menu-item[data-panel]');
    const mockupPanels = document.querySelectorAll('.mockup-panel');

    mockupMenuItems.forEach(item => {
        item.addEventListener('click', () => {
            mockupMenuItems.forEach(i => i.classList.remove('active'));
            mockupPanels.forEach(p => p.classList.remove('active'));
            item.classList.add('active');
            document.getElementById('panel-' + item.dataset.panel).classList.add('active');
        });
    });

    // ===== INDUSTRIES TABS =====
    const indTabs = document.querySelectorAll('.ind-tab');
    const indCards = document.querySelectorAll('.industry-card[data-cat]');

    indTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            indTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const cat = tab.dataset.cat;
            indCards.forEach(card => {
                if (cat === 'all' || card.dataset.cat === cat) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ===== ACCESSIBILITY PANEL =====
    const accessBtn     = document.getElementById('accessBtn');
    const accessPanel   = document.getElementById('accessPanel');
    const accessOverlay = document.getElementById('accessOverlay');
    const accessClose   = document.getElementById('accessClose');
    const accessResetAll = document.getElementById('accessResetAll');

    const openAccess = () => {
        accessPanel.hidden  = false;
        accessOverlay.hidden = false;
        accessPanel.focus?.();
    };
    const closeAccess = () => {
        accessPanel.hidden  = true;
        accessOverlay.hidden = true;
        accessBtn.focus();
    };

    accessBtn.addEventListener('click', openAccess);
    accessClose.addEventListener('click', closeAccess);
    accessOverlay.addEventListener('click', closeAccess);
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && !accessPanel.hidden) closeAccess();
    });

    // Font size
    let fontSize = parseFloat(localStorage.getItem('acc-font') || 100);
    const applyFont = () => { document.documentElement.style.fontSize = (fontSize / 100) * 16 + 'px'; };
    applyFont();

    document.getElementById('fontIncrease').addEventListener('click', () => {
        if (fontSize < 150) { fontSize += 10; localStorage.setItem('acc-font', fontSize); applyFont(); }
    });
    document.getElementById('fontDecrease').addEventListener('click', () => {
        if (fontSize > 80) { fontSize -= 10; localStorage.setItem('acc-font', fontSize); applyFont(); }
    });
    document.getElementById('fontReset').addEventListener('click', () => {
        fontSize = 100; localStorage.setItem('acc-font', fontSize); applyFont();
    });

    // Toggle helpers
    const makeToggle = (btnId, bodyClass, storageKey) => {
        const btn = document.getElementById(btnId);
        const stored = localStorage.getItem(storageKey) === '1';
        if (stored) { document.body.classList.add(bodyClass); btn.setAttribute('aria-pressed', 'true'); btn.classList.add('active'); }
        btn.addEventListener('click', () => {
            const on = document.body.classList.toggle(bodyClass);
            btn.setAttribute('aria-pressed', String(on));
            localStorage.setItem(storageKey, on ? '1' : '0');
        });
    };

    makeToggle('toggleContrast',   'acc-high-contrast',  'acc-contrast');
    makeToggle('toggleGrayscale',  'acc-grayscale',       'acc-gray');
    makeToggle('toggleInvert',     'acc-invert',          'acc-invert');
    makeToggle('toggleLinks',      'acc-links',           'acc-links');
    makeToggle('toggleReadable',   'acc-readable',        'acc-readable');
    makeToggle('toggleAnimations', 'acc-no-animations',   'acc-no-anim');
    makeToggle('toggleCursor',     'acc-big-cursor',      'acc-cursor');
    makeToggle('toggleFocus',      'acc-focus-highlight', 'acc-focus');

    accessResetAll.addEventListener('click', () => {
        ['acc-contrast','acc-gray','acc-invert','acc-links','acc-readable','acc-no-anim','acc-cursor','acc-focus'].forEach(k => localStorage.removeItem(k));
        ['acc-high-contrast','acc-grayscale','acc-invert','acc-links','acc-readable','acc-no-animations','acc-big-cursor','acc-focus-highlight'].forEach(c => document.body.classList.remove(c));
        document.querySelectorAll('.access-toggle').forEach(b => b.setAttribute('aria-pressed','false'));
        fontSize = 100; localStorage.setItem('acc-font', 100); applyFont();
    });

    // ===== PRIVACY MODAL =====
    const privacyOverlay  = document.getElementById('privacyOverlay');

    const openPrivacyModal  = () => { privacyOverlay.hidden = false; document.body.style.overflow = 'hidden'; };
    const closePrivacyModal = () => { privacyOverlay.hidden = true;  document.body.style.overflow = ''; };

    // ===== PRIVACY BAR (פס תחתון) =====
    const privacyBar = document.getElementById('privacyBar');

    if (localStorage.getItem('privacy-accepted')) {
        privacyBar.classList.add('accepted');
    } else {
        privacyBar.innerHTML = `
            <span class="privacy-bar-text">
                האתר משתמש בעוגיות לשיפור חוויית הגלישה. בשימוש באתר אתם מסכימים ל<button class="privacy-bar-link" id="openPrivacy">מדיניות הפרטיות</button> שלנו.
            </span>
            <button class="btn-privacy-accept" id="privacyAcceptBtn">מאשר/ת ומסכים/ה</button>
        `;
        document.getElementById('privacyAcceptBtn').addEventListener('click', () => {
            localStorage.setItem('privacy-accepted', '1');
            privacyBar.classList.add('accepted');
        });
        document.getElementById('openPrivacy').addEventListener('click', openPrivacyModal);
    }

    const privacyClose    = document.getElementById('privacyClose');
    const privacyCloseBtn = document.getElementById('privacyCloseBtn');

    privacyClose.addEventListener('click', closePrivacyModal);
    privacyCloseBtn.addEventListener('click', closePrivacyModal);
    privacyOverlay.addEventListener('click', e => { if (e.target === privacyOverlay) closePrivacyModal(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !privacyOverlay.hidden) closePrivacyModal(); });

    // Footer privacy link
    document.querySelectorAll('a').forEach(a => {
        if (a.textContent.trim() === 'מדיניות פרטיות') {
            a.addEventListener('click', e => { e.preventDefault(); openPrivacyModal(); });
        }
    });

});
