const DEBUG = false;

if (DEBUG) document.getElementById('feedback-form').remove();

import * as Globals from './globals.js';
import * as Utils from './utils.js';

const canvas = document.getElementById('sandbox');
const ctx = canvas.getContext('2d');
const brushSlider = document.getElementById('brush-slider');
const brushVal = document.getElementById('brush-val');
const tempSlider = document.getElementById('temp-slider');
const tempVal = document.getElementById('temp-val');
const clearBtn = document.getElementById('clear-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const btnGrid = document.getElementById('particle-buttons');
const infoLbl = document.getElementById('info-label');

const bookBtn = document.getElementById('book-btn');
const bookModal = document.getElementById('book-modal');
const bookClose = document.getElementById('book-close');
const bookBody = document.getElementById('book-body');

const CELL_SIZE = 5; 
const WIDTH = canvas.width / CELL_SIZE;
const HEIGHT = canvas.height / CELL_SIZE;

// Grid representation: 0 = Empty, or Object with {type, color, age, state, ...}
let grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));
let new_grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));

let currentParticle = 'H2O';
let brushSize = 3;
let temp = 293;
if (DEBUG) brushSize = 20;
let isDrawing = false;
let running = true;
pauseBtn.classList.toggle('running', running);


let savedData = localStorage.getItem('sandbox_shown_particles');
let shown_particles = Globals.DEFAULT_SHOWN_PARTICLES;

if (savedData) {
    try {
        let parsed = JSON.parse(savedData);
        
        // Check if the cached data is a proper Array
        if (Array.isArray(parsed)) {

            Globals.DEFAULT_SHOWN_PARTICLES.forEach(elem => {
                if (!parsed.includes(elem)) parsed.push(elem);
            });

            shown_particles = parsed;
        } else {
            console.error("Invalid cache format detected. Resetting to defaults.");
            localStorage.removeItem('sandbox_shown_particles'); 
        }
    } catch (e) {
        localStorage.removeItem('sandbox_shown_particles');
        console.error("Error parsing save data:", e);
    }
}

canvas.addEventListener('mousemove', (e) => {
    const { x, y } = getCanvasPosition(e);

    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        const cell = grid[x][y];

        if (cell === 0) {
            infoLbl.innerText = `Hovering: Empty Space (X: ${x}, Y: ${y})`;
        } else {
            const shc = Utils.getChemicalProperties(cell.type)?.shc || 0;
            const temp = Utils.getTemp(cell.type, cell.heat);
            const state = Utils.getState(cell.type, cell.heat);
            const mass = Utils.getMass(cell.type);
            const density = Utils.getDensity(cell.type, cell.heat);

            infoLbl.innerText = `Particle: ${cell.type} [${state}] Mass: ${mass} | Temp: ${temp}°K (Heat: ${Math.floor(cell.heat)}) Pos: (${x}, ${y}) | SHC: ${shc} | Density: ${density}`;
        }
    }
});

// Clear debug text if the mouse leaves the canvas bounds entirely
canvas.addEventListener('mouseleave', () => {
    infoLbl.innerText = "Hovering: Outside Sandbox";
});


function createParticleAt(x, y, type, bypass_tests = false) {
    addParticle(type);

    if (
        !bypass_tests &&
        already_changed_cells.some(cell => cell.x === x && cell.y === y)
    ) return;

    if (type === 'eraser') {
        new_grid[x][y] = 0;
        return;
    }
    if (type === 'barrier') {
        new_grid[x][y] = {
            type: 'barrier',
            color: Math.random() >= 0.5 ? '#ffffff' : '#ff0000',
            direction: 0,
            heat: 0,
        }

        already_changed_cells.push({ x: x, y: y });
        return;
    }
    
    let cell = {
        type: type,
        color: Globals.PARTICLES[type].color,
        direction: Math.floor(Math.random() * 7),
    };

    const shc = Utils.getChemicalProperties(type).shc;
    cell.heat = temp * shc;
    
    new_grid[x][y] = cell;

    if (!bypass_tests) already_changed_cells.push({ x: x, y: y });
}

// Helper function to update info label when hovering over buttons
function handleButtonHover(key) {
    if (key === 'barrier' || key === 'eraser') return;

    const shc = Utils.getChemicalProperties(key)?.shc || 0;
    const mass = Utils.getMass(key);
    // Setting default heat as baseline room temperature since it's an unplaced template button
    const baseHeat = temp * shc; 
    const state = Utils.getState(key, baseHeat);
    const density = Utils.getDensity(key, baseHeat);

    infoLbl.innerText = `Element Profile: ${key} [${state}] | Base Mass: ${mass} | SHC: ${shc} | Density: ${density}`;
}

function update_particle_buttons() {
    btnGrid.innerHTML = "";

    if (!DEBUG) {
        shown_particles.forEach(key => {
            if (!Globals.PARTICLES[key]) return; 

            const btn = document.createElement('button');
            btn.innerText = key;
            btn.style.backgroundColor = Globals.PARTICLES[key].color === '#000000' ? '#333' : Globals.PARTICLES[key].color;
            btn.dataset.type = key;
            if (key === currentParticle) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('#particle-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentParticle = key;
            });

            // Hover event listeners
            btn.addEventListener('mouseenter', () => handleButtonHover(key));
            btn.addEventListener('mouseleave', () => { infoLbl.innerText = "Hovering: Outside Sandbox"; });

            btnGrid.appendChild(btn);
        });

        Globals.DISCOVERABLE_PARTICLES.forEach(key => {
            if (!shown_particles.includes(key) && Globals.PARTICLES[key]) {
                const btn = document.createElement('button');
                btn.disabled = true;
                btn.innerText = "???"; // Hidden name since it's undiscovered
                
                let baseColor = Globals.PARTICLES[key].color === '#000000' ? '#333333' : Globals.PARTICLES[key].color;
                btn.style.backgroundColor = adjustBrightness(baseColor, -60);
                btn.dataset.type = key;
                
                // Hover listeners for locked buttons (shows encrypted / minimal info if you choose)
                btn.addEventListener('mouseenter', () => {
                    infoLbl.innerText = `Element Profile: [Locked / Undiscovered Particle]`;
                });
                btn.addEventListener('mouseleave', () => { infoLbl.innerText = "Hovering: Outside Sandbox"; });

                btnGrid.appendChild(btn);
            }
        });
    } else {
        Object.keys(Globals.PARTICLES).forEach(key => {
            const btn = document.createElement('button');
            btn.innerText = key;
            
            let baseColor = Globals.PARTICLES[key].color === '#000000' ? '#333333' : Globals.PARTICLES[key].color;
            btn.style.backgroundColor = baseColor;
            btn.dataset.type = key;
            
            if (key === currentParticle) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('#particle-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentParticle = key;
            });
            
            // Hover event listeners
            btn.addEventListener('mouseenter', () => handleButtonHover(key));
            btn.addEventListener('mouseleave', () => { infoLbl.innerText = "Hovering: Outside Sandbox"; });

            btnGrid.appendChild(btn);
        });
    }
}

update_particle_buttons();
// Event Listeners for Drawing
canvas.addEventListener('mousedown', (e) => { isDrawing = true; draw(e); });
window.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousemove', draw);

brushSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushVal.innerText = brushSize;
});

tempSlider.addEventListener('input', (e) => {
    temp = parseInt(e.target.value);
    tempVal.innerText = temp;
});

clearBtn.addEventListener('click', () => {
    grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));
});

pauseBtn.addEventListener('click', () => {
    toggleRunning();
});

resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset your discovered particles? This will clear your save cache.")) {
        localStorage.removeItem('sandbox_shown_particles');
        shown_particles = Globals.DEFAULT_SHOWN_PARTICLES;
        currentParticle = 'H2O';
        update_particle_buttons();
        console.log('Cache cleared and particles reset.');
    }
});

bookBtn.addEventListener('click', () => {
    renderBook();
    bookModal.style.display = 'flex';
});

bookClose.addEventListener('click', () => {
    bookModal.style.display = 'none';
});

function getCanvasPosition(e) {
    const rect = canvas.getBoundingClientRect();

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;

    const canvasX = clientX - rect.left;
    const canvasY = clientY - rect.top;

    return {
        x: Math.floor((canvasX * (canvas.width / rect.width)) / CELL_SIZE),
        y: Math.floor((canvasY * (canvas.height / rect.height)) / CELL_SIZE),
    };
}

function draw(e) {
    if (!isDrawing) return;

    e.preventDefault();

    const { x: mouseX, y: mouseY } = getCanvasPosition(e);

    for (let x = -brushSize + 1; x < brushSize; x++) {
        for (let y = -brushSize + 1; y < brushSize; y++) {
            if (Math.sqrt(x * x + y * y) <= brushSize - 0.5) {
                const nx = mouseX + x;
                const ny = mouseY + y;

                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                    createParticleAt(nx, ny, currentParticle, true);
                }
            }
        }
    }
}

function toggleRunning() {
    running = !running;
    pauseBtn.classList.toggle('running', running);
}

function addParticle(type) {
    if (!Globals.DISCOVERABLE_PARTICLES.includes(type)) return;
    
    if (!shown_particles.includes(type)) {
        shown_particles.push(type);
        update_particle_buttons();
        console.log('Discovered ' + type + ' particle.')
        saveData();
    }
}

// Main Physics Engine loop
function update() {
    // --- THERMODYNAMICS PASS (Heat Conduction) ---
    for (let y = 0; y < HEIGHT; y++) {
        for (let x = 0; x < WIDTH; x++) {
            let cell = grid[x][y];
            if (!cell || cell === 0 || cell.type === 'barrier') continue;

            // Pick a random neighbor (Right or Down to avoid redundant calculation looping)
            let checkX = x + (Math.random() < 0.5 ? 1 : 0);
            let checkY = y + (checkX === x ? 1 : 0); // If we didn't look right, look down

            if (checkX < WIDTH && checkY < HEIGHT) {
                let neighbor = grid[checkX][checkY];
                if (neighbor && neighbor !== 0 && neighbor.type !== 'barrier') {
                    // Create working copies in new_grid if they don't exist yet
                    if (!new_grid[x][y]) new_grid[x][y] = { ...cell };
                    if (!new_grid[checkX][checkY]) new_grid[checkX][checkY] = { ...neighbor };

                    // Diffuse heat between the working references
                    Utils.diffuseHeat(new_grid[x][y], new_grid[checkX][checkY], 0.15);
                    
                    // Sync the local loop's reference variable so reactions/movement 
                    // read the updated temperature immediately
                    cell.heat = new_grid[x][y].heat;
                }
            }
        }
    }

    // --- MOVEMENT & REACTION PASS ---
    const xIndices = Array.from({length: WIDTH}, (_, i) => i).sort(() => Math.random() - 0.5);

    for (let y = HEIGHT - 1; y >= 0; y--) {
        for (let i = 0; i < WIDTH; i++) {
            let x = xIndices[i];
            let cell = grid[x][y];
            if (cell === 0) continue;

            const currentType = cell.type;
            if (currentType === 'barrier') continue;
            
            const currentState = Utils.getState(currentType, cell.heat);


            // --- Chemical Reaction Pass ---
            if (Math.random() < 0.1) { 
                let localMolecules = [];
                
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT) {
                            let neighbor = grid[cx][cy];
                            if (neighbor && neighbor !== 0 && neighbor.type !== 'barrier') {
                                let alreadyReacted = already_changed_cells.some(c => c.x === cx && c.y === cy);
                                if (!alreadyReacted) {
                                    localMolecules.push({ type: neighbor.type, x: cx, y: cy, heat: neighbor.heat });
                                }
                            }
                        }
                    }
                }

                const successfulReaction = Utils.tryReaction(localMolecules);

                if (successfulReaction) {
                    const { reaction, participants } = successfulReaction;
                    let randomizedProducts = [...reaction.products].sort(() => Math.random() - 0.5);
                    
                    const baseTotalHeat = participants.reduce((sum, p) => sum + p.heat, 0);
                    const heatPerProduct = Math.floor(baseTotalHeat / randomizedProducts.length);

                    participants.forEach((participant, index) => {
                        let px = participant.x;
                        let py = participant.y;
                        let productType = randomizedProducts[index];

                        if (productType) {
                            new_grid[px][py] = {
                                type: productType,
                                color: Globals.PARTICLES[productType].color,
                                direction: Math.floor(Math.random() * 7),
                                heat: heatPerProduct
                            };
                            addParticle(productType);
                        } else {
                            new_grid[px][py] = 0;
                        }

                        already_changed_cells.push({ x: px, y: py });
                    });
                    
                    continue; 
                }
            }
                        
            if (currentState === 'gas') {
                if (Math.random() > 0.9) continue;
            }

            if (currentState === 'liquid') {
                let continue_requested = false;
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            const c_cell = grid[cx][cy];
                            if (Utils.getState(c_cell.type, c_cell.heat) === 'liquid') {
                                if (Math.random() > 0.99) continue_requested = true;
                            }
                        }
                    }
                }
                if (continue_requested) continue;
            }

            if (currentState === 'solid') {
                let continue_requested = false;
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            const c_cell = grid[cx][cy];
                            if (Utils.getState(c_cell.type, c_cell.heat) === 'solid') {
                                if (Math.random() > 0.9) continue_requested = true;
                            }
                        }
                    }
                }

                if (continue_requested) continue;
            }

            if (currentState === 'gas') {
                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 3) - 1; 
                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                    const n_cell = grid[nx][ny];
                    
                    if (n_cell === 0 && Math.random() < 0.2) {
                        swap(x, y, nx, ny);
                    } 
                    
                    if (n_cell !== 0) {
                        const n_density = Utils.getDensity(n_cell.type, n_cell.heat);
                        const my_density = Utils.getDensity(currentType, cell.heat);
                        
                        if (ny > y && my_density > n_density) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                        if (ny < y && my_density < n_density) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                        
                        if (my_density === n_density && Math.random() < 0.05) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                    }
                }
            }



            if (Math.random() > 0.9 && grid[x][y + 1]) swap(x, y, x, y + 1);



            if (currentState === 'liquid') {
                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.random() > 0.7 ? -1 : Math.floor(Math.random() * 2) + 1; 
                let nx = x + dx;
                let ny = y + dy;

                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                    const n_cell = grid[nx][ny];
                    
                    if (n_cell === 0 && Math.random() < 0.2) {
                        swap(x, y, nx, ny);
                    } 
                    
                    if (n_cell !== 0) {
                        const n_density = Utils.getDensity(n_cell.type, n_cell.heat);
                        const my_density = Utils.getDensity(currentType, cell.heat);
                        
                        if (ny > y && my_density > n_density) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                        if (ny < y && my_density < n_density) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                        
                        if (my_density === n_density && Math.random() < 0.05) {
                            swap(x, y, nx, ny);
                            continue;
                        }
                    }
                }
            }

            else if (currentState === 'solid') {
                if (y + 1 < HEIGHT) {
                    if (grid[x][y + 1] === 0 ) {
                        swap(x, y, x, y + 1);
                    } else if (x - 1 >= 0 && grid[x - 1][y + 1] === 0 && Math.random() < 0.5) {
                        swap(x, y, x - 1, y + 1);
                    } else if (x + 1 < WIDTH && grid[x + 1][y + 1] === 0) {
                        swap(x, y, x + 1, y + 1);
                    }
                }
            }

        }
    }
}

let already_changed_cells = [];

function swap(x1, y1, x2, y2) {
    let cell1 = grid[x1][y1];
    let cell2 = grid[x2][y2];

    if (cell1.type === 'barrier' || cell2.type === 'barrier') return false;

    if (
        already_changed_cells.some(cell => cell.x === x1 && cell.y === y1) || 
        already_changed_cells.some(cell => cell.x === x2 && cell.y === y2)
    ) return false;

    new_grid[x1][y1] = cell2;
    new_grid[x2][y2] = cell1;

    already_changed_cells.push({ x: x1, y: y1 });
    already_changed_cells.push({ x: x2, y: y2 });

    return true;
}

// Render Engine loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            let cell = grid[x][y];
            if (cell) {
                ctx.fillStyle = cell.color;
                ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
        }
    }
}

function adjustBrightness(hex, percent) {
    let R = parseInt(hex.substring(1,3),16);
    let G = parseInt(hex.substring(3,5),16);
    let B = parseInt(hex.substring(5,7),16);
    R = Math.min(255, Math.max(0, R + percent));
    G = Math.min(255, Math.max(0, G + percent));
    B = Math.min(255, Math.max(0, B + percent));
    return `rgb(${R},${G},${B})`;
}


function saveData() {
    try {
        localStorage.setItem('sandbox_shown_particles', JSON.stringify(shown_particles));
        if (DEBUG) console.log('Progress saved successfully!');
    } catch (error) {
        console.error('Failed to save data to cache:', error);
    }
}

function loop() {
    if (running) {
        already_changed_cells = Array(0).fill(null);
        new_grid = grid.map(col => col.map(cell => cell ? { ...cell } : 0));
        update();
        grid = new_grid;
    }

    render();
}

// --- Dynamic Book Generator Loop ---
function renderBook() {
    bookBody.innerHTML = '';

    const discovered = Globals.DISCOVERABLE_PARTICLES.filter(p => shown_particles.includes(p) || DEBUG);

    const chemicalList = [];
    const elementalList = [];
    const molecularList = [];

    discovered.forEach(type => {
        const chem = Utils.getChemicalProperties(type);
        if (!chem) return;

        chemicalList.push({ type, chem });

        if (chem.nature === 'atom') {
            const elem = Utils.getElementalProperties(type);
            if (elem) elementalList.push({ type, elem });
        } else if (chem.nature === 'molecule') {
            const mol = Utils.getMolecularProperties(type);
            if (mol) molecularList.push({ type, mol });
        }
    });

    // 1. Section: Chemical Properties
    let chemHtml = `<div class="book-section"><div class="book-section-title">Chemical Properties</div><div class="book-grid">`;
    chemicalList.forEach(item => {
        const color = Globals.PARTICLES[item.type]?.color || '#fff';
        chemHtml += `
            <div class="book-card">
                <div class="book-card-title"><span class="color-indicator" style="background-color: ${color}"></span>${item.type}</div>
                <div class="book-card-prop">Nature: ${item.chem.nature}</div>
                <div class="book-card-prop">Reactivity: ${item.chem.reactivity}%</div>
                <div class="book-card-prop">Spec. Heat: ${item.chem.shc}</div>
            </div>`;
    });
    chemHtml += `</div></div>`;
    bookBody.innerHTML += chemHtml;

    // 2. Section: Elemental Properties
    let elemHtml = `<div class="book-section"><div class="book-section-title">Elemental Properties</div><div class="book-grid">`;
    elementalList.forEach(item => {
        elemHtml += `
            <div class="book-card">
                <div class="book-card-title">${item.type}</div>
                <div class="book-card-prop">Protons: ${item.elem.p}</div>
                <div class="book-card-prop">Neutrons: ${item.elem.n}</div>
                <div class="book-card-prop">Electrons: ${item.elem.e}</div>
                <div class="book-card-prop">Mass value: ${item.elem.mass}</div>
            </div>`;
    });
    elemHtml += `</div></div>`;
    bookBody.innerHTML += elemHtml;

    // 3. Section: Molecular Properties
    let molHtml = `<div class="book-section"><div class="book-section-title">Molecular Properties</div><div class="book-grid">`;
    molecularList.forEach(item => {
        // Map composition components to colored span tags
        const coloredComp = item.mol.composition.map(p => {
            const color = Globals.PARTICLES[p]?.color || '#ffffff';
            return `<span style="color: ${color}; font-weight: bold;">${p}</span>`;
        }).join(', ');

        molHtml += `
            <div class="book-card">
                <div class="book-card-title">${item.type}</div>
                <div class="book-card-prop">Melting Point: ${item.mol.mp}°K</div>
                <div class="book-card-prop">Boiling Point: ${item.mol.bp}°K</div>
                <div class="book-card-prop">Formula composition: ${coloredComp}</div>
            </div>`;
    });
    molHtml += `</div></div>`;
    bookBody.innerHTML += molHtml;

    // 4. Section: Discovered Reactions
    let rxnHtml = `<div class="book-section"><div class="book-section-title">Discovered Reactions</div><div class="book-grid" style="grid-template-columns: 1fr;">`;
    let reactionsCount = 0;

    Globals.REACTIONS.forEach(rxn => {
        const structuralElements = [...rxn.reactants, ...rxn.products];
        const fullyDiscovered = structuralElements.every(p => shown_particles.includes(p) || DEBUG);

        if (fullyDiscovered) {
            reactionsCount++;

            // Map reactants array to styled components
            const coloredReactants = rxn.reactants.map(p => {
                const color = Globals.PARTICLES[p]?.color || '#ffffff';
                return `<span style="color: ${color}; font-weight: bold;">${p}</span>`;
            }).join(' + ');

            // Map products array to styled components
            const coloredProducts = rxn.products.map(p => {
                const color = Globals.PARTICLES[p]?.color || '#ffffff';
                return `<span style="color: ${color}; font-weight: bold;">${p}</span>`;
            }).join(' + ');

            rxnHtml += `
                <div class="book-card">
                    <div class="book-card-title" style="color: #6cff37;">Equation Formula</div>
                    <div class="book-card-prop" style="font-size: 14px; font-family: monospace; letter-spacing: 0.5px;">
                        ${coloredReactants} ➔ ${coloredProducts}
                    </div>
                    <div class="book-card-prop" style="margin-top: 5px;">Activation threshold: ${rxn.minTemp}°K</div>
                </div>`;
        }
    });

    if (reactionsCount === 0) {
        rxnHtml += `<div class="book-card-prop" style="font-style: italic; color:#777;">No chemical recipes logged yet. Experiment with mixing components under varied temperatures.</div>`;
    }

    rxnHtml += `</div></div>`;
    bookBody.innerHTML += rxnHtml;
}

setInterval(loop, 20);
requestAnimationFrame(loop);