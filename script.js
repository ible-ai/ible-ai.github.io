const header = document.querySelector('[data-header]');
const menuButton = document.querySelector('[data-menu-button]');
const nav = document.querySelector('[data-nav]');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const noHover = window.matchMedia('(hover: none)').matches;

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

// Theme: the toggle saves a choice; until then the page follows the system.
const themeToggle = document.querySelector('[data-theme-toggle]');
const themeColor = document.querySelector('[data-theme-color]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    themeColor.content = theme === 'dark' ? '#0a0a0a' : '#f8fafc';
    themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
}

function savedTheme() {
    try { return localStorage.getItem('ible-theme'); } catch { return null; }
}

themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem('ible-theme', next); } catch {}
});

systemDark.addEventListener('change', (event) => {
    if (!savedTheme()) applyTheme(event.matches ? 'dark' : 'light');
});

applyTheme(document.documentElement.dataset.theme || 'light');

window.addEventListener('scroll', updateHeader, { passive: true });
updateHeader();

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

/* Project titles. A title steps from its name to its address:
   adaptible, adapt-ible, adapt.ible, adapt.ible.ai. The hyphen opens,
   drops into a dot, and ".ai" is set after it. */

const STEP_IN = 380;
const STEP_OUT = 220;
const LAST_STEP = 3;

function createTitle(link) {
    const name = link.textContent.trim();
    const root = link.dataset.root;
    const suffixText = name.slice(root.length);
    const tailText = '.ai';

    const word = span('title-word', '');
    word.setAttribute('aria-hidden', 'true');
    const measure = span('title-measure', '');
    measure.setAttribute('aria-hidden', 'true');
    const rootPart = span('title-root', root);
    const hyphen = span('title-hyphen', '-');
    const dot = span('title-dot', '.');
    const suffix = span('title-suffix', suffixText);
    const tail = [...tailText].map((character) => span('title-tail', character));
    word.append(rootPart, hyphen, dot, suffix, ...tail);
    link.textContent = '';
    link.append(span('visually-hidden', name), word, measure);

    const size = {};
    const widthOf = (text) => {
        measure.textContent = text;
        return measure.getBoundingClientRect().width;
    };

    function measureAll() {
        size.root = widthOf(root);
        size.hyphen = widthOf('-');
        size.dot = widthOf('.');
        size.suffix = widthOf(name) - size.root;
        const full = widthOf(suffixText + tailText);
        const offsets = [...tailText].map((_, index) => widthOf(suffixText + tailText.slice(0, index)));
        size.tail = offsets.map((offset, index) => (offsets[index + 1] ?? full) - offset);
    }

    let step = 0;
    let target = 0;
    let frame = 0;
    let last = null;

    // step runs from 0 to 3; each whole step is one stage, eased on its own,
    // so the sequence pauses briefly between stages.
    function render() {
        const open = ease(step);
        const morph = ease(step - 1);
        const slot = open * (size.hyphen + (size.dot - size.hyphen) * morph);
        const junction = size.root;

        const hyphenWidth = open * (1 - 0.6 * morph);
        hyphen.style.opacity = (open * (1 - morph)).toFixed(3);
        hyphen.style.transform = `translate(${(junction + slot / 2 - size.hyphen / 2).toFixed(2)}px, ${(morph * 0.2).toFixed(3)}em) scale(${hyphenWidth.toFixed(3)}, ${(1 + 0.5 * morph).toFixed(3)})`;
        dot.style.opacity = (open * morph).toFixed(3);
        dot.style.transform = `translateX(${(junction + slot / 2 - size.dot / 2).toFixed(2)}px)`;
        suffix.style.transform = `translateX(${(junction + slot).toFixed(2)}px)`;

        let x = junction + slot + size.suffix;
        tail.forEach((letter, index) => {
            const p = ease((step - 2 - index * 0.22) / 0.56);
            letter.style.opacity = p.toFixed(3);
            letter.style.transform = `translate(${x.toFixed(2)}px, ${((1 - p) * 0.04).toFixed(4)}em)`;
            x += size.tail[index] * p;
        });
        link.style.width = `${x.toFixed(2)}px`;
    }

    function tick(now) {
        frame = 0;
        const elapsed = last === null ? 16 : Math.min(now - last, 64);
        last = now;
        const speed = 1 / (target > step ? STEP_IN : STEP_OUT);
        step = target > step ? Math.min(target, step + elapsed * speed) : Math.max(target, step - elapsed * speed);
        render();
        if (step !== target) frame = requestAnimationFrame(tick);
        else last = null;
    }

    function go(next, instantly = reducedMotion) {
        target = next;
        if (instantly) {
            step = next;
            render();
            return;
        }
        if (!frame) frame = requestAnimationFrame(tick);
    }

    measureAll();
    render();
    return {
        go,
        refresh() { measureAll(); render(); },
        get settled() { return step === target; },
    };
}

const projects = [...document.querySelectorAll('[data-project]')].map((card) => {
    const link = card.querySelector('.project-title');
    const title = createTitle(link);
    const state = { card, link, title, hovered: false, focused: false, played: false };

    state.update = () => {
        const active = state.hovered || state.focused;
        card.classList.toggle('is-active', active);
        title.go(active ? LAST_STEP : 0);
    };

    link.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'touch') return;
        state.hovered = true;
        state.update();
    });
    link.addEventListener('pointerleave', (event) => {
        if (event.pointerType === 'touch') return;
        state.hovered = false;
        state.update();
    });
    link.addEventListener('focus', () => { state.focused = true; state.update(); });
    link.addEventListener('blur', () => { state.focused = false; state.update(); });
    return state;
});

document.fonts.ready.then(() => projects.forEach(({ title }) => title.refresh()));
new ResizeObserver(() => projects.forEach(({ title }) => title.refresh()))
    .observe(document.querySelector('[data-project-grid]'));

// Without hover, each title plays once as its card scrolls into view.
if (noHover) {
    const seen = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const state = projects.find((project) => project.card === entry.target);
            seen.unobserve(entry.target);
            if (reducedMotion) {
                state.title.go(LAST_STEP, true);
                return;
            }
            state.card.classList.add('is-active');
            state.title.go(LAST_STEP);
            window.setTimeout(() => {
                state.card.classList.remove('is-active');
                if (!state.focused) state.title.go(0);
            }, LAST_STEP * STEP_IN + 1600);
        });
    }, { threshold: 0.6 });
    projects.forEach(({ card }) => seen.observe(card));
}

/* The portal into graphible, from its title. The hyphen draws out from the
   title and opens into a field, "graph" joins "-ible", and the link follows
   after 2.5 s. */

function createPortalWord(container) {
    const word = span('suffix-word', '');
    const measure = span('suffix-measure', '');
    const hyphen = span('suffix-hyphen', '-');
    const suffix = span('suffix-rest', 'ible');
    word.append(hyphen, suffix);
    container.append(word, measure);

    let letters = [];
    let offsets = [];
    let rootWidth = 0;
    let hyphenWidth = 0;
    let suffixWidth = 0;

    const widthOf = (text) => {
        measure.textContent = text;
        return measure.getBoundingClientRect().width;
    };

    function setRoot(root) {
        letters.forEach((letter) => letter.remove());
        letters = [...root].map((character) => span('suffix-letter', character));
        word.prepend(...letters);
        hyphenWidth = widthOf('-');
        suffixWidth = widthOf('ible');
        rootWidth = widthOf(root);
        offsets = [...root].map((_, index) => widthOf(root.slice(0, index)));
    }

    // presence(index): how much of each root letter's width is set (0 to 1).
    // alpha(index): each letter's opacity. join: how far the hyphen has closed.
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

    return { setRoot, render };
}

const portalLink = document.querySelector('[data-portal]');
const portal = document.querySelector('[data-portal-overlay]');
const portalStatus = document.querySelector('[data-portal-status]');
const portalWord = createPortalWord(document.querySelector('[data-portal-word]'));
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

portalLink.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (reducedMotion) return;

    event.preventDefault();
    if (isEnteringPortal) return;
    isEnteringPortal = true;

    const bounds = portalLink.getBoundingClientRect();
    const centre = bounds.left + bounds.width / 2;
    portal.style.setProperty('--x', `${centre}px`);
    portal.style.setProperty('--y', `${bounds.top + bounds.height / 2}px`);
    // Just long enough for both ends of the line to clear the screen.
    portal.style.setProperty('--reach', `${2 * Math.max(centre, window.innerWidth - centre) + 120}px`);

    document.body.classList.add('is-entering');
    portalLink.setAttribute('aria-disabled', 'true');
    portal.classList.add('is-active');
    portalStatus.textContent = 'Entering graphible';
    runPortalWord(performance.now());

    portalTimer = window.setTimeout(() => {
        window.location.assign(portalLink.href);
    }, 2500);
});

// Coming back through the history cache should show the page, not the portal.
window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    window.clearTimeout(portalTimer);
    isEnteringPortal = false;
    document.body.classList.remove('is-entering');
    portal.classList.remove('is-active');
    portalLink.removeAttribute('aria-disabled');
    portalStatus.textContent = '';
    projects.forEach((state) => {
        state.hovered = false;
        state.focused = document.activeElement === state.link;
        state.card.classList.remove('is-active');
        state.title.go(state.focused ? LAST_STEP : 0, true);
    });
});

/* Click to copy the install commands. */

const copyStatus = document.querySelector('[data-copy-status]');

function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).catch(() => copyFallback(text));
    }
    return copyFallback(text);
}

function copyFallback(text) {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    const ok = document.execCommand('copy');
    field.remove();
    return ok ? Promise.resolve() : Promise.reject(new Error('copy failed'));
}

document.querySelectorAll('[data-copy]').forEach((button) => {
    let reset = 0;
    button.addEventListener('click', () => {
        const text = button.dataset.copy;
        copyText(text).then(() => {
            button.classList.add('is-copied');
            copyStatus.textContent = '';
            requestAnimationFrame(() => { copyStatus.textContent = `Copied ${text}`; });
            window.clearTimeout(reset);
            reset = window.setTimeout(() => button.classList.remove('is-copied'), 1800);
        }, () => {
            copyStatus.textContent = 'Copy failed';
        });
    });
});

/* The cue to the projects shows only while the grid is below the first screen. */

const cue = document.querySelector('[data-scroll-cue]');
new IntersectionObserver(([entry]) => {
    const below = !entry.isIntersecting && entry.boundingClientRect.top > 0;
    cue.classList.toggle('is-visible', below);
}, { rootMargin: '0px 0px -12% 0px' }).observe(document.querySelector('[data-project-grid]'));
