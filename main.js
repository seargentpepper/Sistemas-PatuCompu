// --- State ---
let perfChart = null;

// --- Reveal Logic ---
function initReveal() {
    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Mobile constraint optimization: Stop observing after initial reveal
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px'
    });

    document.querySelectorAll('.reveal').forEach((el, index) => {
        // Subtle stagger delay for elements appearing in bulk
        const delay = (index % 3) * 0.1;
        el.style.transitionDelay = `${delay}s`;
        observer.observe(el);
    });
}

// --- Chart Logic ---
function initChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    perfChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Arranque', 'Multitarea', 'Transferencia', 'Temperatura'],
            datasets: [
                {
                    label: 'HDD / Sin Optimizar',
                    data: [15, 20, 10, 30],
                    backgroundColor: '#8E8E93',
                    borderRadius: 5
                },
                {
                    label: 'SSD + Patu Compu',
                    data: [20, 25, 15, 35],
                    backgroundColor: '#007BFF',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, max: 100 } }
        }
    });
}

window.animatePerformance = function () {
    if (!perfChart) return;
    const btn = document.getElementById('simBtn');
    btn.innerText = "¡PROCESANDO DATOS...";
    btn.style.opacity = "0.5";
    const targets = [98, 92, 95, 88];
    const original = [12, 18, 8, 45];
    perfChart.data.datasets[0].data = original;
    perfChart.data.datasets[1].data = targets;
    perfChart.update('active');
    setTimeout(() => {
        btn.innerText = "SISTEMA OPTIMIZADO ✓";
        btn.style.opacity = "1";
        setTimeout(() => btn.innerText = "Simular Prueba de Velocidad", 3000);
    }, 1000);
};

// =============================================================
//  AXIS 1: Time-of-Day Toggle (Morning / Afternoon / Night)
//  AXIS 2: Aesthetic Toggle (Default "Confiable" / Experimental)
//  These are INDEPENDENT. The user gets TWO buttons.
// =============================================================

const TIME_CLASSES = ['time-morning', 'time-afternoon', 'time-night'];
const GLOW_CLASSES = ['hero-glow-morning', 'hero-glow-afternoon', 'hero-glow-night'];
const GREETING_CLASSES = ['greeting-morning', 'greeting-afternoon', 'greeting-night'];

const states = [
    { id: 'morning', greeting: 'Buenos días', icon: '☀️', timeClass: 'time-morning', greetingClass: 'greeting-morning', glowClass: 'hero-glow-morning' },
    { id: 'afternoon', greeting: 'Buenas tardes', icon: '🌅', timeClass: 'time-afternoon', greetingClass: 'greeting-afternoon', glowClass: 'hero-glow-afternoon' },
    { id: 'night', greeting: 'Buenas noches', icon: '🌙', timeClass: 'time-night', greetingClass: 'greeting-night', glowClass: 'hero-glow-night' }
];

let currentStateIndex = 0;

// --- AXIS 1: Time-of-Day ---
function updateTimeUI(stateIndex) {
    const state = states[stateIndex];
    const greetingEl = document.getElementById('greeting-text');
    const themeIcon = document.getElementById('theme-icon');
    const heroGlow = document.getElementById('hero-glow-element');
    const body = document.body;

    if (greetingEl) {
        greetingEl.innerText = state.greeting;
        greetingEl.classList.remove(...GREETING_CLASSES);
        greetingEl.classList.add(state.greetingClass);
    }
    if (themeIcon) themeIcon.innerText = state.icon;
    if (heroGlow) {
        heroGlow.classList.remove(...GLOW_CLASSES);
        heroGlow.classList.add(state.glowClass);
    }

    body.classList.remove(...TIME_CLASSES);
    body.classList.add(state.timeClass);

    currentStateIndex = stateIndex;
    localStorage.setItem('manual-time-state', stateIndex);

    if (window.lucide) window.lucide.createIcons();
}

function initTimeContext() {
    const hour = new Date().getHours();
    let initialIndex = 0;
    if (hour >= 12 && hour < 19) initialIndex = 1;
    if (hour >= 19 || hour < 5) initialIndex = 2;

    const saved = localStorage.getItem('manual-time-state');
    if (saved !== null) initialIndex = parseInt(saved);

    updateTimeUI(initialIndex);
}

// --- AXIS 2: Aesthetic Toggle ---
function toggleAesthetic() {
    const body = document.body;
    const isExperimental = body.classList.toggle('aesthetic-experimental');
    localStorage.setItem('aesthetic-mode', isExperimental ? 'experimental' : 'default');

    // Update the aesthetic toggle button label
    const btn = document.getElementById('aesthetic-toggle');
    if (btn) {
        const label = btn.querySelector('.aesthetic-label');
        if (label) label.textContent = isExperimental ? 'EXP' : 'STD';
    }
}

function initAesthetic() {
    const saved = localStorage.getItem('aesthetic-mode');
    const body = document.body;
    const btn = document.getElementById('aesthetic-toggle');
    const label = btn ? btn.querySelector('.aesthetic-label') : null;

    let targetMode = saved;

    // Logic: If no user preference saved, set based on screen size
    if (targetMode === null) {
        // approx 1024px is common desktop breakpoint
        if (window.innerWidth >= 1024) {
            targetMode = 'experimental';
        } else {
            targetMode = 'default';
        }
    }

    if (targetMode === 'experimental') {
        body.classList.add('aesthetic-experimental');
        if (label) label.textContent = 'EXP';
    } else {
        body.classList.remove('aesthetic-experimental');
        if (label) label.textContent = 'STD';
    }
}

// --- INIT ---
document.addEventListener('DOMContentLoaded', () => {
    // Axis 1: Time toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            updateTimeUI((currentStateIndex + 1) % states.length);
        });
    }

    // Axis 2: Aesthetic toggle
    const aestheticToggleBtn = document.getElementById('aesthetic-toggle');
    if (aestheticToggleBtn) {
        aestheticToggleBtn.addEventListener('click', toggleAesthetic);
    }

    initTimeContext();
    initAesthetic();
    initReveal();
    initChart();
});
