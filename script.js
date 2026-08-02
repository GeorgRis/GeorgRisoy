const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

let particles = [];
let allStateCoords = [];
let nameCoords = [];

// ============================================================================
// CV CONTENT
// ============================================================================
const stateDetails = [
    {
        tag: 'Education',
        title: 'M.Sc_Software_Engineering',
        body: 'Just started first year, with courses that use Java, Kotlin, Node, React, and Haskell.'
    },
    {
        tag: 'Experience',
        title: 'KSAT_Summer_Intern',
        body: 'Starting summer 2026 (June–August). Establishing workflows and integrations via local AI setup.'
    },
    {
        tag: 'Education',
        title: 'B.Sc_Artificial_Intelligence',
        body: 'Completed subjects consisting of linear algebra, machine learning, and deep learning, alongside a number of core computer science subjects.'
    },
    {
        tag: 'Experience',
        title: 'Tratec_Norcon_Intern',
        body: 'Developed automation tools for PLC programming using Python, tailored for Norwegian tunnels and road networks. Streamlined and automated workflows to support and enhance the productivity of other employes like project engineers.'
    },
    {
        tag: 'Startup',
        title: 'Spacedeer_Founder',
        body: 'Developing AI-driven geospatial analysis tools to track reindeer herds via satellite imagery. Pioneering advanced monitoring solutions to provide actionable insights for herd management.'
    },
    {
        tag: 'Experience',
        title: 'UiB_Teaching_Assistant',
        body: 'Teaching assistant for subject Methods in AI (INFO180). Teaching assistant in subject Machine Learning (INFO284). Helping students understand and program AI methods.'
    },
    {
        tag: 'Future',
        title: 'Master_of_Science',
        body: 'The culmination of five years of rigorous academic studies in Artificial Intelligence and Software Engineering.'
    }
];

const MAX_PARTICLES = 3000;
const LERP_SPEED = 0.006;

let mouseX = -1000;
let mouseY = -1000;
window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });

let isMorphing = false;
let morphProgress = 0;

function easeInOutQuart(t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; }

class Particle {
    constructor() {
        this.bgX = Math.random() * w;
        this.bgY = Math.random() * h;
        this.size = Math.random() * 2 + 1;
        this.baseAlpha = Math.random() * 0.4 + 0.3;
        this.offset = Math.random() * Math.PI * 2;

        const tints = [
            'rgba(255, 255, 255, ', 'rgba(180, 220, 255, ',
            'rgba(210, 240, 255, ', 'rgba(255, 255, 255, '
        ];
        this.colorPrefix = tints[Math.floor(Math.random() * tints.length)];

        this.x = this.bgX; this.y = this.bgY;
        this.fromX = this.bgX; this.fromY = this.bgY;
        this.toX = this.bgX; this.toY = this.bgY;

        this.fromAlpha = 0;
        this.toAlpha = 0;
        this.currentAlpha = 0;

        this.vx = 0; this.vy = 0;
    }
}

// ============================================================================
// SHAPE COORDINATES
// ============================================================================
function getNameCoordinates() {
    const oc = document.createElement('canvas');
    const ox = oc.getContext('2d', { willReadFrequently: true });
    oc.width = w; oc.height = h;

    const cx = w / 2; const cy = h / 2 - 20;
    const fs = Math.min(w / 16, 80);
    ox.fillStyle = '#fff'; ox.textAlign = 'center'; ox.textBaseline = 'middle';
    ox.font = `bold ${fs}px sans-serif`; ox.fillText("Georg Mykjåland Risøy", cx, cy);

    const step = 2;
    const imgData = ox.getImageData(0, 0, w, h).data;
    const coords = [];
    for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
            if (imgData[(py * w + px) * 4 + 3] > 128) {
                coords.push({ x: px + (Math.random() - 0.5) * step, y: py + (Math.random() - 0.5) * step });
            }
        }
    }
    for (let i = coords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coords[i], coords[j]] = [coords[j], coords[i]];
    }
    return coords;
}

function getShapeCoordinates(stateIndex) {
    const oc = document.createElement('canvas');
    const ox = oc.getContext('2d', { willReadFrequently: true });
    oc.width = w; oc.height = h;

    const cx = w / 2; const cy = h / 2 - 20;
    ox.fillStyle = '#fff'; ox.textAlign = 'center'; ox.textBaseline = 'middle';

    let step = 4;

    if (stateIndex === 0) { // MSC / Computer
        const s = Math.min(w, h) / 400;
        ox.strokeStyle = '#fff'; ox.lineWidth = 6 * s; ox.lineJoin = 'round';

        ox.strokeRect(cx - 80 * s, cy - 60 * s, 160 * s, 100 * s);
        ox.lineWidth = 2 * s;
        ox.strokeRect(cx - 70 * s, cy - 50 * s, 140 * s, 80 * s);
        ox.lineWidth = 6 * s;
        ox.beginPath();
        ox.moveTo(cx - 20 * s, cy + 40 * s); ox.lineTo(cx - 30 * s, cy + 80 * s);
        ox.lineTo(cx + 30 * s, cy + 80 * s); ox.lineTo(cx + 20 * s, cy + 40 * s);
        ox.stroke();
        ox.beginPath();
        ox.moveTo(cx - 50 * s, cy + 80 * s); ox.lineTo(cx + 50 * s, cy + 80 * s);
        ox.stroke();
        ox.lineWidth = 3 * s;
        ox.beginPath();
        ox.moveTo(cx - 60 * s, cy - 30 * s); ox.lineTo(cx - 20 * s, cy - 30 * s);
        ox.moveTo(cx - 60 * s, cy - 10 * s); ox.lineTo(cx + 10 * s, cy - 10 * s);
        ox.moveTo(cx - 60 * s, cy + 10 * s); ox.lineTo(cx - 30 * s, cy + 10 * s);
        ox.stroke();
        step = 2;
    }
    else if (stateIndex === 1) { // KSAT Satellite
        const s = Math.min(w, h) / 450;
        ox.strokeStyle = '#fff'; ox.lineWidth = 4 * s; ox.lineJoin = 'round'; ox.lineCap = 'round';

        ox.strokeRect(cx - 20 * s, cy - 40 * s, 40 * s, 80 * s);
        ox.beginPath(); ox.moveTo(cx - 20 * s, cy - 15 * s); ox.lineTo(cx + 20 * s, cy - 15 * s); ox.stroke();
        ox.beginPath(); ox.moveTo(cx - 20 * s, cy + 15 * s); ox.lineTo(cx + 20 * s, cy + 15 * s); ox.stroke();

        ox.strokeRect(cx - 150 * s, cy - 25 * s, 110 * s, 50 * s);
        ox.beginPath(); ox.moveTo(cx - 150 * s, cy); ox.lineTo(cx - 40 * s, cy); ox.stroke();
        ox.beginPath(); ox.moveTo(cx - 113 * s, cy - 25 * s); ox.lineTo(cx - 113 * s, cy + 25 * s); ox.stroke();
        ox.beginPath(); ox.moveTo(cx - 76 * s, cy - 25 * s); ox.lineTo(cx - 76 * s, cy + 25 * s); ox.stroke();
        ox.beginPath(); ox.moveTo(cx - 40 * s, cy); ox.lineTo(cx - 20 * s, cy); ox.stroke();

        ox.strokeRect(cx + 40 * s, cy - 25 * s, 110 * s, 50 * s);
        ox.beginPath(); ox.moveTo(cx + 40 * s, cy); ox.lineTo(cx + 150 * s, cy); ox.stroke();
        ox.beginPath(); ox.moveTo(cx + 76 * s, cy - 25 * s); ox.lineTo(cx + 76 * s, cy + 25 * s); ox.stroke();
        ox.beginPath(); ox.moveTo(cx + 113 * s, cy - 25 * s); ox.lineTo(cx + 113 * s, cy + 25 * s); ox.stroke();
        ox.beginPath(); ox.moveTo(cx + 20 * s, cy); ox.lineTo(cx + 40 * s, cy); ox.stroke();

        ox.beginPath(); ox.arc(cx, cy + 40 * s, 25 * s, 0, Math.PI); ox.stroke();
        ox.beginPath(); ox.moveTo(cx, cy + 40 * s); ox.lineTo(cx, cy + 65 * s); ox.stroke();
        ox.fillStyle = '#fff';
        ox.beginPath(); ox.arc(cx, cy + 65 * s, 4 * s, 0, Math.PI * 2); ox.fill();

        ox.lineWidth = 3 * s;
        ox.beginPath(); ox.arc(cx, cy + 65 * s, 25 * s, Math.PI * 0.2, Math.PI * 0.8); ox.stroke();
        ox.beginPath(); ox.arc(cx, cy + 65 * s, 50 * s, Math.PI * 0.25, Math.PI * 0.75); ox.stroke();
        ox.beginPath(); ox.arc(cx, cy + 65 * s, 75 * s, Math.PI * 0.3, Math.PI * 0.7); ox.stroke();

        ox.beginPath(); ox.moveTo(cx, cy - 40 * s); ox.lineTo(cx, cy - 70 * s); ox.stroke();
        ox.beginPath(); ox.arc(cx, cy - 70 * s, 3 * s, 0, Math.PI * 2); ox.fill();

        step = 2;
    }
    else if (stateIndex === 2) { // B.Sc Clear & Structured Neural Network
        const s = Math.min(w, h) / 450;
        ox.strokeStyle = '#fff';
        ox.lineWidth = 1.5 * s; // Thin lines to keep particle tracking crisp

        // Simpler 3-5-5-3 architecture for visual clarity without the fuzzy overlapping blob effect
        const layers = [
            { nodes: 3, x: cx - 140 * s },
            { nodes: 5, x: cx - 50 * s },
            { nodes: 5, x: cx + 50 * s },
            { nodes: 3, x: cx + 140 * s }
        ];

        const nodeCoords = [];
        layers.forEach(layer => {
            const spacing = 45 * s;
            const startY = cy - ((layer.nodes - 1) * spacing) / 2;
            const currentLayerCoords = [];
            for (let i = 0; i < layer.nodes; i++) {
                currentLayerCoords.push({ x: layer.x, y: startY + i * spacing });
            }
            nodeCoords.push(currentLayerCoords);
        });

        // Draw elegant synaptic bezier curves
        for (let l = 0; l < nodeCoords.length - 1; l++) {
            for (const n1 of nodeCoords[l]) {
                for (const n2 of nodeCoords[l + 1]) {
                    ox.beginPath();
                    ox.moveTo(n1.x, n1.y);

                    const cpX1 = n1.x + (n2.x - n1.x) / 2;
                    const cpY1 = n1.y;
                    const cpX2 = n1.x + (n2.x - n1.x) / 2;
                    const cpY2 = n2.y;

                    ox.bezierCurveTo(cpX1, cpY1, cpX2, cpY2, n2.x, n2.y);
                    ox.stroke();
                }
            }
        }

        // Distinct node points
        ox.fillStyle = '#fff';
        nodeCoords.forEach(layer => {
            layer.forEach(n => {
                ox.beginPath(); ox.arc(n.x, n.y, 8 * s, 0, Math.PI * 2); ox.fill();
            });
        });

        step = 2;
    }
    else if (stateIndex === 3) { // Tratec
        const fs = Math.min(w / 8, 180);
        ox.font = `bold ${fs}px monospace`; ox.fillText("</>", cx, cy);
        step = 3;
    }
    else if (stateIndex === 4) { // Spacedeer
        const s = Math.min(w, h) / 350;
        ox.strokeStyle = '#fff'; ox.lineWidth = 3 * s; ox.lineJoin = 'round';

        ox.beginPath();
        ox.moveTo(cx, cy + 80 * s);
        ox.lineTo(cx - 15 * s, cy + 50 * s);
        ox.lineTo(cx - 35 * s, cy + 10 * s);
        ox.lineTo(cx - 20 * s, cy - 20 * s);
        ox.lineTo(cx, cy - 30 * s);
        ox.lineTo(cx + 20 * s, cy - 20 * s);
        ox.lineTo(cx + 35 * s, cy + 10 * s);
        ox.lineTo(cx + 15 * s, cy + 50 * s);
        ox.closePath();
        ox.stroke();

        ox.beginPath();
        ox.moveTo(cx, cy + 80 * s); ox.lineTo(cx, cy + 20 * s);
        ox.moveTo(cx - 15 * s, cy + 50 * s); ox.lineTo(cx, cy + 20 * s);
        ox.moveTo(cx + 15 * s, cy + 50 * s); ox.lineTo(cx, cy + 20 * s);
        ox.moveTo(cx - 35 * s, cy + 10 * s); ox.lineTo(cx - 10 * s, cy);
        ox.moveTo(cx + 35 * s, cy + 10 * s); ox.lineTo(cx + 10 * s, cy);
        ox.moveTo(cx, cy + 20 * s); ox.lineTo(cx - 10 * s, cy);
        ox.moveTo(cx, cy + 20 * s); ox.lineTo(cx + 10 * s, cy);
        ox.moveTo(cx - 10 * s, cy); ox.lineTo(cx, cy - 30 * s);
        ox.moveTo(cx + 10 * s, cy); ox.lineTo(cx, cy - 30 * s);
        ox.stroke();

        ox.lineWidth = 2 * s;
        function drawAntler(sx, sy, angle, len, depth) {
            if (depth === 0) return;
            const ex = sx + Math.cos(angle) * len;
            const ey = sy + Math.sin(angle) * len;
            ox.beginPath(); ox.moveTo(sx, sy); ox.lineTo(ex, ey); ox.stroke();
            drawAntler(ex, ey, angle - 0.4, len * 0.7, depth - 1);
            drawAntler(ex, ey, angle + 0.5, len * 0.65, depth - 1);
        }

        drawAntler(cx - 15 * s, cy - 25 * s, -Math.PI / 2 - 0.3, 50 * s, 4);
        drawAntler(cx + 15 * s, cy - 25 * s, -Math.PI / 2 + 0.3, 50 * s, 4);

        step = 2;
    }
    else if (stateIndex === 5) { // TA: Neural Microchip
        const s = Math.min(w, h) / 300;
        ox.strokeStyle = '#fff'; ox.lineWidth = 4 * s; ox.lineJoin = 'round';

        ox.strokeRect(cx - 50 * s, cy - 50 * s, 100 * s, 100 * s);

        ox.lineWidth = 2 * s;
        ox.strokeRect(cx - 20 * s, cy - 20 * s, 40 * s, 40 * s);
        ox.strokeRect(cx - 25 * s, cy - 25 * s, 50 * s, 50 * s);

        ox.beginPath();
        for (let i = -30; i <= 30; i += 15) {
            ox.moveTo(cx + i * s, cy - 50 * s); ox.lineTo(cx + i * s, cy - 80 * s);
            ox.arc(cx + i * s, cy - 83 * s, 3 * s, 0, Math.PI * 2);
            ox.moveTo(cx + i * s, cy + 50 * s); ox.lineTo(cx + i * s, cy + 80 * s);
            ox.arc(cx + i * s, cy + 83 * s, 3 * s, 0, Math.PI * 2);
            ox.moveTo(cx - 50 * s, cy + i * s); ox.lineTo(cx - 80 * s, cy + i * s);
            ox.arc(cx - 83 * s, cy + i * s, 3 * s, 0, Math.PI * 2);
            ox.moveTo(cx + 50 * s, cy + i * s); ox.lineTo(cx + 80 * s, cy + i * s);
            ox.arc(cx + 83 * s, cy + i * s, 3 * s, 0, Math.PI * 2);
        }
        ox.stroke();
        step = 2;
    }
    else if (stateIndex === 6) { // End of Studies (Graduation Cap)
        const s = Math.min(w, h) / 350;
        ox.strokeStyle = '#fff'; ox.lineWidth = 5 * s; ox.lineJoin = 'round';

        ox.beginPath();
        ox.moveTo(cx, cy - 40 * s); ox.lineTo(cx + 90 * s, cy); ox.lineTo(cx, cy + 40 * s); ox.lineTo(cx - 90 * s, cy);
        ox.closePath(); ox.stroke();

        ox.beginPath();
        ox.moveTo(cx - 50 * s, cy + 22 * s);
        ox.lineTo(cx - 50 * s, cy + 60 * s);
        ox.bezierCurveTo(cx - 50 * s, cy + 80 * s, cx + 50 * s, cy + 80 * s, cx + 50 * s, cy + 60 * s);
        ox.lineTo(cx + 50 * s, cy + 22 * s);
        ox.stroke();

        ox.lineWidth = 3 * s;
        ox.beginPath(); ox.moveTo(cx, cy); ox.lineTo(cx + 70 * s, cy + 15 * s); ox.lineTo(cx + 70 * s, cy + 70 * s); ox.stroke();

        ox.fillStyle = '#fff';
        ox.beginPath(); ox.arc(cx, cy, 5 * s, 0, Math.PI * 2); ox.fill();

        step = 2;
    }

    const imgData = ox.getImageData(0, 0, w, h).data;
    const coords = [];
    for (let py = 0; py < h; py += step) {
        for (let px = 0; px < w; px += step) {
            if (imgData[(py * w + px) * 4 + 3] > 128) {
                coords.push({ x: px + (Math.random() - 0.5) * step, y: py + (Math.random() - 0.5) * step });
            }
        }
    }
    for (let i = coords.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [coords[i], coords[j]] = [coords[j], coords[i]];
    }
    return coords;
}

// ============================================================================
// MORPH
// ============================================================================
function morphTo(newState) {
    isMorphing = true; morphProgress = 0;
    const coords = newState >= 0 ? allStateCoords[newState] : nameCoords;

    for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.fromX = p.x; p.fromY = p.y; p.fromAlpha = p.currentAlpha;

        if (coords.length > 0) {
            const target = coords[i % coords.length];
            p.toX = target.x;
            p.toY = target.y;
            p.toAlpha = 1.0;
        }
    }
}

// ============================================================================
// DATA-MAPPED GIT GRAPH GENERATION 
// ============================================================================
const tlNodes = document.querySelectorAll('.tl-node');

function drawGitGraph() {
    const svg = document.getElementById('gitGraph');
    if (!svg) return;
    svg.innerHTML = '';
    const nodes = Array.from(document.querySelectorAll('.tl-node'));
    if (nodes.length === 0) return;

    const branchColors = { '0': '#58a6ff', '1': '#3fb950', '2': '#ff7b72' };
    const nodeMap = {};
    nodes.forEach(n => { if (n.dataset.id) nodeMap[n.dataset.id] = n; });
    const GAP = 12;

    nodes.forEach(node => {
        const parentsAttr = node.dataset.parents;
        if (!parentsAttr) return;

        const parents = parentsAttr.split(',');
        parents.forEach(parentId => {
            const pNode = nodeMap[parentId];
            if (!pNode) return;

            const dot1 = node.querySelector('.tl-dot');
            const x1 = node.offsetLeft + dot1.offsetLeft + dot1.offsetWidth / 2;
            const y1 = node.offsetTop + dot1.offsetTop + dot1.offsetHeight / 2;

            const dot2 = pNode.querySelector('.tl-dot');
            const x2 = pNode.offsetLeft + dot2.offsetLeft + dot2.offsetWidth / 2;
            const y2 = pNode.offsetTop + dot2.offsetTop + dot2.offsetHeight / 2;

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

            if (x1 === x2) {
                path.setAttribute('d', `M ${x1} ${y1 + GAP} L ${x2} ${y2 - GAP}`);
            } else {
                const cy = y1 + (y2 - y1) / 2;
                path.setAttribute('d', `M ${x1} ${y1 + GAP} C ${x1} ${cy}, ${x2} ${cy}, ${x2} ${y2 - GAP}`);
            }

            path.setAttribute('fill', 'none');

            let strokeColor = branchColors[node.dataset.branch];
            if (node.dataset.branch === "0" && pNode.dataset.branch !== "0") {
                strokeColor = branchColors[pNode.dataset.branch];
            }

            path.setAttribute('stroke', strokeColor);
            path.setAttribute('stroke-width', '4');
            path.setAttribute('stroke-linecap', 'round');

            svg.insertBefore(path, svg.firstChild);
        });
    });
}

// ============================================================================
// SINGLE WORKSPACE APPEND/DELETE LOGIC
// ============================================================================
const detailPanel = document.getElementById('detailPanel');
const detailInner = document.getElementById('detailInner');

let activeStates = [];
const typingControllers = new Map();

function toggleState(idx) {
    if (idx === -1) {
        closeAll();
        return;
    }

    if (activeStates.includes(idx)) {
        activeStates = activeStates.filter(i => i !== idx);
        document.querySelector(`.tl-node[data-state="${idx}"]`).classList.remove('active');

        removeBlock(idx);

        const nextState = activeStates.length > 0 ? activeStates[activeStates.length - 1] : -1;
        morphTo(nextState);

        if (activeStates.length === 0) {
            closePanel();
        }
    } else {
        activeStates.push(idx);
        document.querySelector(`.tl-node[data-state="${idx}"]`).classList.add('active');

        detailPanel.classList.remove('closed');
        detailPanel.classList.remove('minimized');

        addBlock(idx);
        morphTo(idx);
    }
}

async function addBlock(idx) {
    const d = stateDetails[idx];

    const block = document.createElement('div');
    block.className = 'code-block';
    block.id = `block-${idx}`;
    block.innerHTML = `
        <div class="detail-tag"></div>
        <div class="detail-title"></div>
        <div class="detail-body"></div>
    `;
    detailInner.appendChild(block);

    const tagEl = block.querySelector('.detail-tag');
    const titleEl = block.querySelector('.detail-title');
    const bodyEl = block.querySelector('.detail-body');

    const controller = new AbortController();
    typingControllers.set(idx, controller);
    const signal = controller.signal;

    const tagStr = d.tag;
    const titleStr = d.title.replace(/\n/g, '_');
    const bodyStr = d.body;

    try {
        await typeText(tagEl, tagStr, 1, 15, signal);
        await typeText(titleEl, titleStr, 1, 15, signal);
        await typeText(bodyEl, bodyStr, 2, 5, signal);
    } catch (e) { }
}

async function typeText(element, text, charsPerTick, delayMs, signal) {
    element.textContent = '';
    for (let i = 0; i < text.length; i += charsPerTick) {
        if (signal.aborted) throw new Error('aborted');
        element.textContent += text.substr(i, charsPerTick);
        detailInner.scrollTop = detailInner.scrollHeight;
        await new Promise(r => setTimeout(r, delayMs));
    }
    if (!signal.aborted) {
        element.textContent = text;
        detailInner.scrollTop = detailInner.scrollHeight;
    }
}

async function removeBlock(idx) {
    if (typingControllers.has(idx)) {
        typingControllers.get(idx).abort();
        typingControllers.delete(idx);
    }

    const block = document.getElementById(`block-${idx}`);
    if (!block) return;

    const tagEl = block.querySelector('.detail-tag');
    const titleEl = block.querySelector('.detail-title');
    const bodyEl = block.querySelector('.detail-body');

    await deleteText(bodyEl, 4, 10);
    await deleteText(titleEl, 2, 10);
    await deleteText(tagEl, 2, 10);

    block.style.opacity = '0';
    setTimeout(() => block.remove(), 300);
}

async function deleteText(element, charsPerTick, delayMs) {
    let text = element.textContent;
    for (let i = text.length; i >= 0; i -= charsPerTick) {
        element.textContent = text.substring(0, i);
        detailInner.scrollTop = detailInner.scrollHeight;
        await new Promise(r => setTimeout(r, delayMs));
    }
    element.textContent = '';
}

function closeAll() {
    activeStates.forEach(idx => {
        document.querySelector(`.tl-node[data-state="${idx}"]`).classList.remove('active');
        removeBlock(idx);
    });
    activeStates = [];
    closePanel();
    morphTo(-1);
}

function closePanel() {
    detailPanel.classList.add('closed');
    resetPanelPosition();
}

tlNodes.forEach(btn => {
    btn.addEventListener('click', () => { toggleState(parseInt(btn.dataset.state, 10)); });

    btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const dx = e.clientX - (rect.left + rect.width / 2);
        const dy = e.clientY - (rect.top + rect.height / 2);
        btn.style.transform = `translate(${dx * 0.1}px, ${dy * 0.3}px)`;
    });

    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0px, 0px)';
        btn.style.transition = 'transform 0.5s cubic-bezier(0.19, 1, 0.22, 1)';
    });

    btn.addEventListener('mouseenter', () => { btn.style.transition = 'none'; });
});

document.getElementById('cornerName').addEventListener('click', () => { toggleState(-1); });

// ============================================================================
// DRAGGING AND WINDOW BUTTONS
// ============================================================================
const header = document.getElementById('editorHeader');
const closeBtn = document.getElementById('closeBtn');
const minBtn = document.getElementById('minBtn');
const maxBtn = document.getElementById('maxBtn');

let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

closeBtn.addEventListener('click', () => {
    closeAll();
});

minBtn.addEventListener('click', () => {
    detailPanel.classList.toggle('minimized');
    detailPanel.classList.remove('maximized');
});

maxBtn.addEventListener('click', () => {
    detailPanel.classList.toggle('maximized');
    detailPanel.classList.remove('minimized');
});

header.addEventListener('mousedown', (e) => {
    if (e.target === closeBtn || e.target === minBtn || e.target === maxBtn) return;

    isDragging = true;
    const rect = detailPanel.getBoundingClientRect();
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;

    detailPanel.style.right = 'auto';
    detailPanel.style.bottom = 'auto';
    detailPanel.style.left = rect.left + 'px';
    detailPanel.style.top = rect.top + 'px';
    detailPanel.style.transition = 'none';
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    detailPanel.style.left = (e.clientX - dragOffsetX) + 'px';
    detailPanel.style.top = (e.clientY - dragOffsetY) + 'px';
});

window.addEventListener('mouseup', () => {
    if (isDragging) {
        isDragging = false;
        detailPanel.style.transition = 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.19, 1, 0.22, 1), width 0.4s ease, height 0.4s ease, visibility 0.3s ease';
    }
});

function resetPanelPosition() {
    setTimeout(() => {
        detailPanel.style.left = '';
        detailPanel.style.top = '';
        detailPanel.style.right = '40px';
        detailPanel.style.bottom = '40px';
        detailPanel.classList.remove('maximized');
        detailPanel.classList.remove('minimized');
    }, 300);
}

// ============================================================================
// INIT
// ============================================================================
function init() {
    nameCoords = getNameCoordinates();
    allStateCoords = [];
    for (let s = 0; s < stateDetails.length; s++) {
        allStateCoords.push(getShapeCoordinates(s));
    }

    particles = [];
    for (let i = 0; i < MAX_PARTICLES; i++) {
        const p = new Particle();
        p.currentAlpha = 0;
        particles.push(p);
    }

    toggleState(-1);

    requestAnimationFrame(animate);
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================
function animate(currentTime) {
    ctx.clearRect(0, 0, w, h);

    if (isMorphing) {
        morphProgress += LERP_SPEED;
        if (morphProgress >= 1) { morphProgress = 1; isMorphing = false; }
    }
    const ease = easeInOutQuart(Math.min(morphProgress, 1));

    for (const p of particles) {
        if (isMorphing) {
            p.x = p.fromX + (p.toX - p.fromX) * ease;
            p.y = p.fromY + (p.toY - p.fromY) * ease;
            p.currentAlpha = p.fromAlpha + (p.toAlpha - p.fromAlpha) * ease;
        }

        const wx = Math.sin(currentTime * 0.0007 + p.offset) * 0.3;
        const wy = Math.cos(currentTime * 0.0005 + p.offset + 1.5) * 0.3;
        let dx = p.x + wx; let dy = p.y + wy;

        const distToMouseX = dx - mouseX; const distToMouseY = dy - mouseY;
        const dist = Math.sqrt(distToMouseX * distToMouseX + distToMouseY * distToMouseY);
        const maxDist = 100;

        if (dist < maxDist && dist > 0) {
            const force = (maxDist - dist) / maxDist;
            const angle = Math.atan2(distToMouseY, distToMouseX);
            p.vx += Math.cos(angle) * force * 0.4; p.vy += Math.sin(angle) * force * 0.4;
        }

        p.vx *= 0.85; p.vy *= 0.85;
        dx += p.vx; dy += p.vy;

        if (p.currentAlpha > 0.01) {
            ctx.fillStyle = p.colorPrefix + p.currentAlpha.toFixed(2) + ')';
            ctx.fillRect(dx - p.size * 0.5, dy - p.size * 0.5, p.size, p.size);
        }
    }
    requestAnimationFrame(animate);
}

let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
        init();
        drawGitGraph();
    }, 250);
});

init();
setTimeout(drawGitGraph, 100);