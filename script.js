const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
        menuButton.focus();
    }
});

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

/* A word built from a root and "-ible". The root's letters fade in, the
   word re-centres as it grows, and the hyphen closes up to join them. */

const clamp = (value) => Math.min(1, Math.max(0, value));
const ease = (value) => {
    const t = clamp(value);
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};

function span(className, text) {
    const element = document.createElement('span');
    element.className = className;
    element.textContent = text;
    return element;
}

function createSuffixWord(container) {
    const word = span('suffix-word', '');
    const measure = span('suffix-measure', '');
    const hyphen = span('suffix-hyphen', '-');
    const suffix = span('suffix-rest', 'ible');
    word.append(hyphen, suffix);
    container.append(word, measure);

    let root = '';
    let letters = [];
    let offsets = [];
    let rootWidth = 0;
    let hyphenWidth = 0;
    let suffixWidth = 0;

    const widthOf = (text) => {
        measure.textContent = text;
        return measure.getBoundingClientRect().width;
    };

    function measureAll() {
        hyphenWidth = widthOf('-');
        suffixWidth = widthOf('ible');
        rootWidth = widthOf(root);
        offsets = [...root].map((_, index) => widthOf(root.slice(0, index)));
    }

    function setRoot(next) {
        root = next;
        letters.forEach((letter) => letter.remove());
        letters = [...root].map((character) => span('suffix-letter', character));
        word.prepend(...letters);
        measureAll();
    }

    // presence(index): how much of each root letter's width is set (0 to 1).
    // alpha(index): each root letter's opacity. join: how far the hyphen has closed.
    function render(presence, alpha, join) {
        const open = 1 - join;
        const widths = offsets.map((offset, index) => (offsets[index + 1] ?? rootWidth) - offset);
        const set = widths.map((width, index) => width * presence(index));
        const setWidth = set.reduce((sum, width) => sum + width, 0);
        const junction = (setWidth - hyphenWidth * open - suffixWidth) / 2;
        let x = junction - setWidth;
        letters.forEach((letter, index) => {
            const a = alpha(index);
            letter.style.opacity = a.toFixed(3);
            letter.style.transform = `translate(${x.toFixed(2)}px, ${((1 - a) * 0.04).toFixed(4)}em)`;
            x += set[index];
        });
        hyphen.style.opacity = open.toFixed(3);
        hyphen.style.transform = `translateX(${(junction - hyphenWidth / 2 + (hyphenWidth * open) / 2).toFixed(2)}px) scaleX(${open.toFixed(3)})`;
        suffix.style.transform = `translateX(${(junction + hyphenWidth * open).toFixed(2)}px)`;
    }

    return { setRoot, measureAll, render };
}

/* The hero: adapt-, graph-, and viz- take turns attaching to "-ible". */

const hero = document.querySelector('[data-hero]');
const stage = document.querySelector('[data-suffix]');
const roots = stage.dataset.roots.split(' ');
const heroWord = createSuffixWord(stage);

// One cycle per root, in milliseconds: rest on "-ible", set the root a letter
// at a time, close the hyphen, hold the word, then let the root go.
const CYCLE = 9500;
function heroFrame(t) {
    if (t < 7200) {
        heroWord.render(
            (index) => ease((t - 1500 - index * 190) / 520),
            (index) => ease((t - 1560 - index * 190) / 620),
            ease((t - 3300 - roots[rootIndex].length * 60) / 900)
        );
    } else {
        const fade = 1 - ease((t - 7200) / 650);
        const collapse = 1 - ease((t - 7500) / 1000);
        heroWord.render(() => collapse, () => fade, 1 - ease((t - 7300) / 900));
    }
}

let rootIndex = 0;
let elapsed = 0;
let lastTime = null;
let heroVisible = true;
let heroRunning = !reducedMotion;
let rafId = 0;

heroWord.setRoot(roots[rootIndex]);
heroFrame(0);

function tick(now) {
    rafId = 0;
    if (!heroRunning || !heroVisible || document.hidden) {
        lastTime = null;
        return;
    }
    if (lastTime !== null) elapsed += Math.min(now - lastTime, 100);
    lastTime = now;
    if (elapsed >= CYCLE) {
        elapsed -= CYCLE;
        rootIndex = (rootIndex + 1) % roots.length;
        heroWord.setRoot(roots[rootIndex]);
    }
    heroFrame(elapsed);
    rafId = requestAnimationFrame(tick);
}

function resume() {
    if (!rafId && heroRunning && heroVisible && !document.hidden) rafId = requestAnimationFrame(tick);
}

new IntersectionObserver(([entry]) => {
    heroVisible = entry.isIntersecting;
    resume();
}).observe(stage);

document.addEventListener('visibilitychange', resume);

new ResizeObserver(() => {
    heroWord.measureAll();
    heroFrame(elapsed);
}).observe(stage);

document.fonts.ready.then(() => {
    heroWord.measureAll();
    heroFrame(elapsed);
    resume();
});

/* The portal into graphible. The hyphen draws out from the button and opens
   into a field, "graph" joins "-ible", and the link follows after 2.5 s. */

const portalButton = document.querySelector('[data-portal-button]');
const portal = document.querySelector('[data-portal]');
const portalStatus = document.querySelector('[data-portal-status]');
const portalWord = createSuffixWord(document.querySelector('[data-portal-word]'));
let isEnteringPortal = false;
let portalTimer = 0;

function runPortalWord(start) {
    portalWord.setRoot('graph');
    const frame = (now) => {
        if (!isEnteringPortal) return;
        const t = now - start;
        portalWord.render(
            (index) => ease((t - 1300 - index * 90) / 300),
            (index) => ease((t - 1320 - index * 90) / 340),
            ease((t - 1950) / 420)
        );
        if (t < 2600) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
}

portalButton.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (reducedMotion) return;

    event.preventDefault();
    if (isEnteringPortal) return;
    isEnteringPortal = true;
    heroRunning = false;

    const bounds = portalButton.getBoundingClientRect();
    portal.style.setProperty('--x', `${bounds.left + bounds.width / 2}px`);
    portal.style.setProperty('--y', `${bounds.top + bounds.height / 2}px`);

    hero.classList.add('is-entering');
    portalButton.setAttribute('aria-disabled', 'true');
    portal.classList.add('is-active');
    portalStatus.textContent = 'Entering graphible';
    runPortalWord(performance.now());

    portalTimer = window.setTimeout(() => {
        window.location.assign(portalButton.href);
    }, 2500);
});

// Coming back through the history cache should show the page, not the portal.
window.addEventListener('pageshow', (event) => {
    if (!event.persisted || !isEnteringPortal) return;
    window.clearTimeout(portalTimer);
    isEnteringPortal = false;
    heroRunning = !reducedMotion;
    hero.classList.remove('is-entering');
    portal.classList.remove('is-active');
    portalButton.removeAttribute('aria-disabled');
    portalStatus.textContent = '';
    resume();
});
