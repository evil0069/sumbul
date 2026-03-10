document.addEventListener('DOMContentLoaded', () => {
    const slides = document.querySelectorAll('.slide');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const dotsContainer = document.getElementById('navDots');
    const currentNum = document.getElementById('currentNum');
    const totalNum = document.getElementById('totalNum');
    const container = document.getElementById('slidesContainer');
    const canvas = document.getElementById('particleCanvas');
    const ctx = canvas.getContext('2d');

    let current = 0;
    const total = slides.length;
    totalNum.textContent = String(total).padStart(2, '0');

    // ---- NAV DOTS ----
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.className = 'nav-dot' + (i === 0 ? ' active' : '');
        dot.addEventListener('click', e => { e.stopPropagation(); goTo(i); });
        dotsContainer.appendChild(dot);
    });

    // ---- NAVIGATION ----
    function goTo(idx) {
        if (idx < 0 || idx >= total || idx === current) return;
        slides[current].classList.remove('active');
        current = idx;
        slides[current].classList.add('active');
        currentNum.textContent = String(current + 1).padStart(2, '0');
        document.querySelectorAll('.nav-dot').forEach((d, i) => d.classList.toggle('active', i === current));
        prevBtn.classList.toggle('hidden', current === 0);
    }

    function next() { if (current < total - 1) goTo(current + 1); }
    function prev() { if (current > 0) goTo(current - 1); }

    nextBtn.addEventListener('click', e => { e.stopPropagation(); next(); });
    prevBtn.addEventListener('click', e => { e.stopPropagation(); prev(); });
    container.addEventListener('click', next);

    document.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    });

    let tx = 0;
    document.addEventListener('touchstart', e => { tx = e.changedTouches[0].screenX; });
    document.addEventListener('touchend', e => {
        const d = e.changedTouches[0].screenX - tx;
        if (Math.abs(d) > 50) d < 0 ? next() : prev();
    });

    // ============================================================
    // SOFT GLOWING PARTICLES  (firefly / stardust effect)
    // ============================================================
    function resize() { canvas.width = innerWidth; canvas.height = innerHeight; }
    resize();
    window.addEventListener('resize', resize);

    const particles = [];
    const isMobile = innerWidth <= 768;
    const count = isMobile ? 35 : 70;

    const colors = [
        [228, 160, 183],  // rose
        [242, 196, 212],  // light rose
        [245, 239, 230],  // cream
        [180, 140, 160],  // mauve
    ];

    class P {
        constructor(init) {
            this.reset(init);
        }
        reset(init) {
            this.x = Math.random() * canvas.width;
            this.y = init ? Math.random() * canvas.height : canvas.height + 20;
            this.r = Math.random() * 2.5 + 1;
            this.vy = -(Math.random() * 0.35 + 0.15);
            this.vx = (Math.random() - 0.5) * 0.2;
            this.life = 0;
            this.maxLife = Math.random() * 600 + 400;
            const c = colors[Math.floor(Math.random() * colors.length)];
            this.color = c;
            this.baseAlpha = Math.random() * 0.4 + 0.15;
            this.wobbleAmp = Math.random() * 0.8 + 0.3;
            this.wobbleSpeed = Math.random() * 0.015 + 0.005;
        }
        update() {
            this.life++;
            this.y += this.vy;
            this.x += this.vx + Math.sin(this.life * this.wobbleSpeed) * this.wobbleAmp;

            // Fade in/out
            const fadeIn = Math.min(this.life / 60, 1);
            const fadeOut = Math.max((this.maxLife - this.life) / 60, 0);
            this.alpha = this.baseAlpha * Math.min(fadeIn, fadeOut);

            if (this.life > this.maxLife || this.y < -20) this.reset(false);
        }
        draw() {
            const [r, g, b] = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha})`;
            ctx.fill();

            // Soft glow
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r * 3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${r},${g},${b},${this.alpha * 0.2})`;
            ctx.fill();
        }
    }

    for (let i = 0; i < count; i++) particles.push(new P(true));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
});
