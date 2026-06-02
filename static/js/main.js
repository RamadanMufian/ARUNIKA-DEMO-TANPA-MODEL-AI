/**
 * ARUNIKA — Global Premium JS
 * Particles, Scroll Reveal, Counter Animations, Navbar Effects
 */

/* =============================================
   1. CANVAS PARTICLE BACKGROUND
   ============================================= */
class ParticleCanvas {
    constructor(canvasId, options = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        this.opts = {
            particleCount: options.particleCount || 60,
            color: options.color || 'rgba(99,102,241,',
            maxRadius: options.maxRadius || 2,
            speed: options.speed || 0.4,
            lineDistance: options.lineDistance || 130,
            lineOpacity: options.lineOpacity || 0.08,
        };

        this.particles = [];
        this.mouse = { x: null, y: null, radius: 120 };
        this.animId = null;

        this.resize();
        this.init();
        this.listen();
        this.animate();
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.opts.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * this.opts.speed,
                vy: (Math.random() - 0.5) * this.opts.speed,
                r: Math.random() * this.opts.maxRadius + 0.5,
                opacity: Math.random() * 0.4 + 0.1,
            });
        }
    }

    listen() {
        window.addEventListener('resize', () => {
            this.resize();
            this.init();
        });
        this.canvas.addEventListener('mousemove', e => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });
        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = null;
            this.mouse.y = null;
        });
    }

    drawParticle(p) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        this.ctx.fillStyle = `${this.opts.color}${p.opacity})`;
        this.ctx.fill();
    }

    drawLine(p1, p2, dist) {
        const alpha = (1 - dist / this.opts.lineDistance) * this.opts.lineOpacity;
        this.ctx.beginPath();
        this.ctx.moveTo(p1.x, p1.y);
        this.ctx.lineTo(p2.x, p2.y);
        this.ctx.strokeStyle = `${this.opts.color}${alpha})`;
        this.ctx.lineWidth = 0.8;
        this.ctx.stroke();
    }

    step() {
        for (const p of this.particles) {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

            // Mouse repulsion
            if (this.mouse.x !== null) {
                const dx = p.x - this.mouse.x;
                const dy = p.y - this.mouse.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.mouse.radius) {
                    const force = (this.mouse.radius - dist) / this.mouse.radius;
                    p.x += (dx / dist) * force * 2;
                    p.y += (dy / dist) * force * 2;
                }
            }
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw connections
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < this.opts.lineDistance) {
                    this.drawLine(this.particles[i], this.particles[j], dist);
                }
            }
        }

        // Draw particles
        for (const p of this.particles) {
            this.drawParticle(p);
        }

        this.step();
        this.animId = requestAnimationFrame(() => this.animate());
    }
}

/* =============================================
   2. SCROLL REVEAL
   ============================================= */
function initScrollReveal() {
    const els = document.querySelectorAll('.reveal, .fade-up');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    e.target.classList.add('visible');
                }, (e.target.dataset.delay || 0));
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    els.forEach((el, i) => {
        if (!el.dataset.delay) el.dataset.delay = i * 80;
        obs.observe(el);
    });
}

/* =============================================
   3. ANIMATED COUNTERS
   ============================================= */
function animateCounter(el, target, duration = 1800, suffix = '') {
    let start = null;
    const isFloat = target % 1 !== 0;

    function update(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        // Ease out expo
        const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const val = ease * target;
        el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

function initCounters() {
    const counterEls = document.querySelectorAll('[data-count]');
    if (!counterEls.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const el = e.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                const duration = parseInt(el.dataset.duration) || 1800;
                animateCounter(el, target, duration, suffix);
                obs.unobserve(el);
            }
        });
    }, { threshold: 0.5 });

    counterEls.forEach(el => obs.observe(el));
}

/* =============================================
   4. NAVBAR SCROLL EFFECT
   ============================================= */
function initNavbar() {
    const nav = document.querySelector('.site-navbar, #main-nav');
    if (!nav) return;

    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
}

/* =============================================
   5. PROGRESS BAR ANIMATE-IN
   ============================================= */
function initProgressBars() {
    const bars = document.querySelectorAll('.progress-fill[data-width]');
    if (!bars.length) return;

    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                const w = e.target.dataset.width;
                setTimeout(() => { e.target.style.width = w; }, 200);
                obs.unobserve(e.target);
            }
        });
    }, { threshold: 0.3 });

    bars.forEach(bar => {
        const targetW = bar.style.width;
        bar.dataset.width = targetW;
        bar.style.width = '0';
        obs.observe(bar);
    });
}

/* =============================================
   6. SMOOTH HOVER TILT
   ============================================= */
function initCardTilt() {
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            const maxRot = 6;
            const rotX = (-y / (rect.height / 2)) * maxRot;
            const rotY = (x / (rect.width / 2)) * maxRot;
            card.style.transform = `perspective(600px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(600px) rotateX(0) rotateY(0) scale(1)';
        });
    });
}

/* =============================================
   7. FORM PROGRESS UPDATER
   ============================================= */
function initFormProgress(formId, barId, labelId) {
    const form = document.getElementById(formId);
    const bar = document.getElementById(barId);
    const label = document.getElementById(labelId);
    if (!form || !bar) return;

    const update = () => {
        const inputs = form.querySelectorAll('input:not([type=submit]), select');
        let filled = 0;
        inputs.forEach(inp => { if (inp.value && inp.value.trim()) filled++; });
        const pct = Math.round((filled / inputs.length) * 100);
        bar.style.width = pct + '%';
        if (label) label.textContent = pct + '% Lengkap';
        if (pct === 100) bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
        else bar.style.background = '';
    };

    form.querySelectorAll('input, select').forEach(inp => {
        inp.addEventListener('input', update);
        inp.addEventListener('change', update);
    });
    update();
}

/* =============================================
   8. TOAST NOTIFICATIONS
   ============================================= */
function showToast(msg, type = 'info', duration = 4000) {
    const icons = { success: 'fa-circle-check', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', info: 'fa-circle-info' };
    const colors = { success: '#10b981', error: '#f43f5e', warning: '#f59e0b', info: '#6366f1' };

    const toast = document.createElement('div');
    toast.style.cssText = `
        position:fixed; bottom:24px; right:24px; z-index:9999;
        background: rgba(18,18,22,0.95); backdrop-filter: blur(16px);
        border: 1px solid rgba(255,255,255,0.1); border-left: 3px solid ${colors[type]};
        border-radius: 14px; padding: 14px 20px;
        display: flex; align-items: center; gap: 12px;
        font-family: 'Plus Jakarta Sans', sans-serif; font-size: 14px; color: #f4f4f5;
        box-shadow: 0 8px 30px rgba(0,0,0,0.4);
        animation: fadeInUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
        max-width: 360px;
    `;
    toast.innerHTML = `<i class="fa-solid ${icons[type]}" style="color:${colors[type]};font-size:18px;flex-shrink:0;"></i><span>${msg}</span>`;

    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(40px)';
        toast.style.transition = '0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, duration);
}

/* =============================================
   INIT ALL
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
    initScrollReveal();
    initCounters();
    initNavbar();
    initProgressBars();
    initCardTilt();

    // Form progress (if on form page)
    initFormProgress('exportForm', 'progress-bar', 'progress-label');

    // Expose globally
    window.ParticleCanvas = ParticleCanvas;
    window.showToast = showToast;
    window.animateCounter = animateCounter;
});
