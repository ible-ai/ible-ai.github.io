const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');

function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 24);
}

function closeMenu() {
    menuButton.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    header.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!isOpen));
    nav.classList.toggle('is-open', !isOpen);
    header.classList.toggle('menu-open', !isOpen);
});

nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) closeMenu();
});

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

const canvas = document.querySelector('[data-network]');
const hero = canvas.closest('.hero');
const context = canvas.getContext('2d');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const pointer = { x: -1000, y: -1000 };
let points = [];
let width = 0;
let height = 0;
let frame = 0;
let lastFrame = 0;
let isVisible = true;
let portalEnergy = 0;
let isEnteringPortal = false;

function seededRandom(seed) {
    let value = seed >>> 0;
    return () => {
        value += 0x6D2B79F5;
        let result = value;
        result = Math.imul(result ^ result >>> 15, result | 1);
        result ^= result + Math.imul(result ^ result >>> 7, result | 61);
        return ((result ^ result >>> 14) >>> 0) / 4294967296;
    };
}

function buildNetwork() {
    const bounds = hero.getBoundingClientRect();
    const scale = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.round(bounds.width);
    height = Math.round(bounds.height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);

    const random = seededRandom(ibleSeed(width, height));
    const count = width < 640 ? 30 : 58;
    points = Array.from({ length: count }, (_, index) => {
        let x = random() * width;
        const y = random() * height;

        // Leave a calmer area behind the definition and primary actions.
        if (x > width * 0.25 && x < width * 0.75 && y > height * 0.26 && y < height * 0.8) {
            x = random() < 0.5 ? random() * width * 0.27 : width * (0.73 + random() * 0.27);
        }

        return {
            x,
            y,
            vx: (random() - 0.5) * 0.11,
            vy: (random() - 0.5) * 0.08,
            radius: index % 11 === 0 ? 2.8 : 1.7 + random() * 0.8,
            depth: 0.35 + random() * 0.65
        };
    });

    drawNetwork(false);
}

function ibleSeed(w, h) {
    return 173 + Math.round(w) * 7 + Math.round(h) * 13;
}

function calmFactor(x, y) {
    const horizontal = Math.abs(x - width / 2) / (width / 2);
    const vertical = Math.abs(y - height * 0.52) / (height / 2);
    return Math.max(0.2, Math.min(1, horizontal * 1.3 + vertical * 0.55));
}

function drawNetwork(advance) {
    context.clearRect(0, 0, width, height);
    const linkDistance = width < 640 ? 155 : 205;

    if (advance) {
        if (isEnteringPortal) portalEnergy = Math.min(1, portalEnergy + 0.035);
        points.forEach((point) => {
            point.x += point.vx;
            point.y += point.vy;
            if (point.x < -20 || point.x > width + 20) point.vx *= -1;
            if (point.y < -20 || point.y > height + 20) point.vy *= -1;
        });
    }

    points.forEach((point, index) => {
        const offsetX = pointer.x > -500 ? (pointer.x - width / 2) * point.depth * 0.008 : 0;
        const offsetY = pointer.y > -500 ? (pointer.y - height / 2) * point.depth * 0.008 : 0;
        const x = point.x + offsetX;
        const y = point.y + offsetY;

        for (let otherIndex = index + 1; otherIndex < points.length; otherIndex += 1) {
            const other = points[otherIndex];
            const otherX = other.x + offsetX;
            const otherY = other.y + offsetY;
            const dx = x - otherX;
            const dy = y - otherY;
            const distance = Math.hypot(dx, dy);
            if (distance > linkDistance) continue;

            const midpointX = (x + otherX) / 2;
            const midpointY = (y + otherY) / 2;
            const pointerDistance = Math.hypot(pointer.x - midpointX, pointer.y - midpointY);
            const pointerBoost = pointerDistance < 150 ? 0.16 * (1 - pointerDistance / 150) : 0;
            const baseAlpha = (0.17 * (1 - distance / linkDistance) + pointerBoost) * calmFactor(midpointX, midpointY);
            const alpha = Math.min(0.86, baseAlpha + portalEnergy * 0.42 * (1 - distance / linkDistance));
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(otherX, otherY);
            context.strokeStyle = portalEnergy > 0.15
                ? `rgba(196, 181, 253, ${alpha})`
                : `rgba(129, 140, 248, ${alpha})`;
            context.lineWidth = 0.8 + portalEnergy * 1.4 + (pointerBoost > 0.03 ? 0.35 : 0);
            context.stroke();
        }

        const pointerDistance = Math.hypot(pointer.x - x, pointer.y - y);
        const isActive = pointerDistance < 125;
        context.beginPath();
        context.arc(x, y, point.radius + portalEnergy * 2.8 + (isActive ? 1.2 : 0), 0, Math.PI * 2);
        context.fillStyle = isActive || portalEnergy > 0.15
            ? `rgba(216, 180, 254, ${0.82 + portalEnergy * 0.18})`
            : 'rgba(165, 180, 252, 0.7)';
        context.fill();

        if (point.radius > 2.7) {
            context.beginPath();
            context.arc(x, y, point.radius + 3.8, 0, Math.PI * 2);
            context.strokeStyle = 'rgba(165, 180, 252, 0.3)';
            context.lineWidth = 1;
            context.stroke();
        }
    });
}

function animateNetwork(time) {
    if (!isVisible) {
        frame = requestAnimationFrame(animateNetwork);
        return;
    }

    if (time - lastFrame > 32) {
        drawNetwork(true);
        lastFrame = time;
    }
    frame = requestAnimationFrame(animateNetwork);
}

hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
}, { passive: true });

hero.addEventListener('pointerleave', () => {
    pointer.x = -1000;
    pointer.y = -1000;
});

new ResizeObserver(buildNetwork).observe(hero);

new IntersectionObserver(([entry]) => {
    isVisible = entry.isIntersecting;
}, { threshold: 0 }).observe(hero);

buildNetwork();
if (!reducedMotion) frame = requestAnimationFrame(animateNetwork);

const portalButton = document.querySelector('[data-portal-button]');
const portalOverlay = document.querySelector('[data-portal-overlay]');

portalButton.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (reducedMotion) return;

    event.preventDefault();
    if (isEnteringPortal) return;
    isEnteringPortal = true;
    isVisible = true;
    hero.classList.add('is-entering');
    portalButton.setAttribute('aria-disabled', 'true');
    portalOverlay.setAttribute('aria-hidden', 'false');

    window.setTimeout(() => {
        portalOverlay.classList.add('is-active');
    }, 800);

    window.setTimeout(() => {
        window.location.assign(portalButton.href);
    }, 2500);
});
