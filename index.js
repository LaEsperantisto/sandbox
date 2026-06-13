const DEBUG = false;

const canvas = document.getElementById('sandbox');
const ctx = canvas.getContext('2d');
const brushSlider = document.getElementById('brush-slider');
const brushVal = document.getElementById('brush-val');
const clearBtn = document.getElementById('clear-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const btnGrid = document.getElementById('element-buttons');
const debugVal = document.getElementById('DEBUG');

const CELL_SIZE = 5; 
const WIDTH = canvas.width / CELL_SIZE;
const HEIGHT = canvas.height / CELL_SIZE;

// Grid representation: 0 = Empty, or Object with {type, color, age, state, ...}
let grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));
let new_grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));

let currentElement = 'sand';
let brushSize = 3;
let isDrawing = false;
let running = true;
pauseBtn.classList.toggle('running', running);

let DISCOVERABLE_ELEMENTS = [
    'eraser',
    'brick',
    'sand',
    'water',
    'soil',
    'grass_seed',
    'flower_seed',
    'tree_seed',
    'fire',
    'gunpowder',
    'blackhole',
    'acid',
    'lava',
    'stone',
    'glass',
    'molten_glass',
    'wet_sand',
    'fertilizer',
    'uranium',
    'thorium',
    'radium',
    'radon',
    'lead',
    'steam',
    'magma',
    'electron',
    'alpha',
    'hydrogen',
    'magnesium',
    'polonium',
    'neutron'
]

// Default unlocked elements if no save data exists
const DEFAULT_SHOWN_ELEMENTS = [
    "eraser",
    "barrier",
    "lava",
    "water",
    "soil",
    "blackhole",
    "gunpowder",
    "uranium",
    "magnesium",
    "neutron",
];

// Check cache for a save state, otherwise fall back to the defaults
let savedData = localStorage.getItem('sandbox_shown_elements');
let shown_elements = DEFAULT_SHOWN_ELEMENTS;

if (savedData) {
    try {
        let parsed = JSON.parse(savedData);
        
        // Check if the cached data is a proper Array
        if (Array.isArray(parsed)) {

            DEFAULT_SHOWN_ELEMENTS.forEach(elem => {
                if (!parsed.includes(elem)) parsed.push(elem);
            });

            shown_elements = parsed;
        } else {
            // It's the old dictionary format! Convert it to an array or clear it:
            console.warn("Old cache format detected. Resetting to defaults.");
            localStorage.removeItem('sandbox_shown_elements'); 
        }
    } catch (e) {
        console.error("Error parsing save data:", e);
        localStorage.removeItem('sandbox_shown_elements');
    }
}

// Element Configuration Matrix
const ELEMENTS = {
    eraser:     { name: '🧽 Eraser', color: '#000000' },
    brick:      { name: '🧱 Brick', color: '#888888' },
    sand:       { name: '⏳ Sand', color: '#e0c068' },
    water:      { name: '💧 Water', color: '#4080ff' },
    soil:       { name: '🟫 Soil', color: '#553b1b' },
    grass_seed: { name: '🌱 Grass Seed', color: '#77cc44' },
    flower_seed:{ name: '🌸 Flower Seed', color: '#ff66cc' },
    tree_seed:  { name: '🌳 Tree Seed', color: '#a14b00'},
    fire:       { name: '🔥 Fire', color: '#ff4500' },
    gunpowder:  { name: '💣 Gunpowder', color: '#555555' },
    blackhole:  { name: '🕳️ Black Hole', color: '#898989' },
    acid:       { name: '🧪 Acid', color: '#00ff33' },
    spout:      { name: '🚰 Water Spout', color: '#00ffff' },
    lava:       { name: '🌋 Lava', color: '#ff7520' },
    eternal_lava:{ name: '♾️🌋 Eternal Lava', color: '#ff7520'},
    stone:      { name: '🪨 Stone', color: '#4d4c4c'},
    magma:      { name: '💥 Magma', color: '#ff5500'},
    glass:      { name: '💎 Glass', color: '#b2f9ff'},
    molten_glass:{ name: '🫠 Molten Glass', color: '#f2ffb4' },
    wet_sand:   { name: '🏖️ Wet Sand', color: '#f8e65c'},
    fertilizer: { name: '💩 Fertilizer', color: '#d3d3d3' },
    uranium:    { name: '☢️ Uranium', color: '#5fbf1b'},
    thorium:    { name: '🔋 Thorium', color: '#bf9b1b'},
    radium:     { name: '✨ Radium', color: '#14ebff'},
    radon:      { name: '💨 Radon', color: '#d0d0d0'},
    lead:       { name: '🔩 Lead', color: '#919191'},
    steam:      { name: '💨 Steam', color: '#bab7b7'},
    barrier:    { name: '🚧 Barrier', color: '#000000'},
    electron:   { name: '⚛ Electron', color: '#00ffff'},
    alpha:      { name: '⚛ Alpha Particle', color: '#ff0000'},
    magnesium:  { name: '🔥 Magnesium', color: '#949494'},
    hydrogen:   { name: '🇭 Hydrogen', color: '#ffffff'},
    neutron:    { name: '⚛ Neutron', color: '#dedddd'},
    polonium:   { name: '☢️ Polonium', color: '#fbff00'}
};

function update_element_buttons() {
    btnGrid.innerHTML = "";

    if (!DEBUG) {
        shown_elements.forEach(key => {
            if (!ELEMENTS[key]) return; 

            const btn = document.createElement('button');
            btn.innerText = ELEMENTS[key].name;
            btn.style.backgroundColor = ELEMENTS[key].color === '#000000' ? '#333' : ELEMENTS[key].color;
            btn.dataset.type = key;
            if (key === currentElement) btn.classList.add('active');
            btn.addEventListener('click', () => {
                document.querySelectorAll('#element-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentElement = key;
            });
            btnGrid.appendChild(btn);
        });

        DISCOVERABLE_ELEMENTS.forEach(key => {
            
            if (!shown_elements.includes(key) && ELEMENTS[key]) {
                const btn = document.createElement('button');
                btn.disabled = true;
                btn.innerText = ELEMENTS[key].name;
                
                let baseColor = ELEMENTS[key].color === '#000000' ? '#333333' : ELEMENTS[key].color;
                btn.style.backgroundColor = adjustBrightness(baseColor, -60);
                btn.dataset.type = key;
                
                btnGrid.appendChild(btn);
            }
        });
    } else {
        
        Object.keys(ELEMENTS).forEach(key => {
            const btn = document.createElement('button');
            btn.innerText = ELEMENTS[key].name;
            
            let baseColor = ELEMENTS[key].color === '#000000' ? '#333333' : ELEMENTS[key].color;
            btn.style.backgroundColor = baseColor;
            btn.dataset.type = key;
            
            if (key === currentElement) btn.classList.add('active');
            
            btn.addEventListener('click', () => {
                document.querySelectorAll('#element-buttons button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentElement = key;
            });
            
            btnGrid.appendChild(btn);
        });
    }
}
update_element_buttons();
// Event Listeners for Drawing
canvas.addEventListener('mousedown', (e) => { isDrawing = true; draw(e); });
window.addEventListener('mouseup', () => isDrawing = false);
canvas.addEventListener('mousemove', draw);

brushSlider.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushVal.innerText = brushSize;
});

clearBtn.addEventListener('click', () => {
    grid = Array(WIDTH).fill(null).map(() => Array(HEIGHT).fill(0));
});

pauseBtn.addEventListener('click', () => {
    toggleRunning();
});

resetBtn.addEventListener('click', () => {
    // Confirm with the player before wiping progress
    if (confirm("Are you sure you want to reset your discovered elements? This will clear your save cache.")) {
        
        // Remove the data from localStorage
        localStorage.removeItem('sandbox_shown_elements');
        
        // Reset the runtime object back to defaults (matching your initial list)
        shown_elements = DEFAULT_SHOWN_ELEMENTS;
        
        // Default the current selected brush element back to sand
        currentElement = 'sand';
        
        // Re-render the element selector menu
        update_element_buttons();
        
        console.log('Cache cleared and elements reset.');
    }
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
                    createElementAt(nx, ny, currentElement);
                }
            }
        }
    }
}

function toggleRunning() {
    running = !running;
    pauseBtn.classList.toggle('running', running);
}

function addElement(type) {

    if (!DISCOVERABLE_ELEMENTS.includes(type)) return;
    
    if (!shown_elements.includes(type)) {
        
        shown_elements.push(type);
        
        // Refresh the UI button list to display the new button
        update_element_buttons();
        console.log('Discovered ' + type + ' element.')

        saveData();
    }
}

function createElementAt(x, y, type) {
    addElement(type);

    if (type === 'eraser') {
        new_grid[x][y] = 0;
        return;
    }
    
    let cell = {
        type: type,
        color: ELEMENTS[type].color,
        age: 0,
        variant: Math.random() // For subtle aesthetic color variations
    };

    // Custom properties per type
    if (type === 'fire') cell.life = 10 + Math.random() * 20;
    if (type === 'lava') cell.life = 400 + Math.random() * 50;
    if (type === 'molten_glass') cell.life = 400 + Math.random() * 40;
    if (type === 'wet_sand') cell.life = 400 + Math.random() * 40;
    if (type === 'uranium') cell.life = (1 + Math.random()) * 500;
    if (type === 'thorium') cell.life = (1 + Math.random()) * 500;
    if (type === 'radium') cell.life = (1 + Math.random()) * 500;
    if (type === 'radon') cell.life = (1 + Math.random()) * 500;
    if (type === 'blackhole') cell.color = '#898989';
    if (type === 'magma') {
        cell.color = (Math.random() < 0.2 ? '#ff5500' : '#303030');
        cell.life = 400 + Math.random() * 50;
    }
    if (type === 'steam') cell.life = 500 + Math.random() * 40;
    if (type === 'barrier') cell.color = (Math.random() < 0.5 ? '#ff0000' : '#ffffff');
    if (type === 'electron') {
        cell.direction = Math.floor(Math.random() * 8);
        cell.life = 900 + Math.random() * 40;
    }
    if (type === 'alpha') {
        cell.direction = Math.floor(Math.random() * 8);
        cell.life = 500 + Math.random() * 40;
    }
    if (type === 'neutron') {
        cell.direction = Math.floor(Math.random() * 8);
        cell.life = 1500 + Math.random() * 40;
    }
    if (type === 'hydrogen' && Math.random() > 0.9) cell.color = '#d8d7d7'
    if (type === 'polonium') {
        cell.color = (Math.random() < 0.2 ? '#303030' : '#f8ff23');
        cell.life = 400 + Math.random() * 50;
    }
    
    new_grid[x][y] = cell;
}

// Main Physics Engine loop
function update() {
    // Process grid from bottom to top to handle gravity correctly
    // We switch up the X iteration order to prevent element physics bias leaning one direction
    const xIndices = Array.from({length: WIDTH}, (_, i) => i).sort(() => Math.random() - 0.5);

    for (let y = HEIGHT - 1; y >= 0; y--) {
        for (let i = 0; i < WIDTH; i++) {
            let x = xIndices[i];
            let cell = grid[x][y];
            if (!cell) continue;

            new_grid[x][y].age++;

            // --- BLACK HOLE ---
            if (cell.type === 'blackhole') {
                // Pull and destroy anything in an adjacent radius
                for (let dx = -2; dx <= 2; dx++) {
                    for (let dy = -2; dy <= 2; dy++) {
                        if (dx === 0 && dy === 0) continue;
                        let nx = x + dx;
                        let ny = y + dy;
                        if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                            if (grid[nx][ny] && grid[nx][ny].type !== 'blackhole') {
                                new_grid[nx][ny] = 0; 
                            }
                        }
                    }
                }
                continue; // Black hole doesn't move
            }

            // --- BRICK ---
            if (cell.type === 'brick') continue; // Static block

            // --- STONE ---
            if (cell.type === 'stone') continue; // Static block

            // --- BARRIER ---
            if (cell.type === 'barrier') continue; // Static block

            // --- SPOUT ---
            if (cell.type === 'spout') {
                if (y + 1 < HEIGHT && grid[x][y + 1] === 0 && Math.random() < 0.3) {
                    createElementAt(x, y + 1, 'water');
                }
                continue;
            }

            // --- SAND ---
            if (cell.type === 'sand') {
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

            // --- FERTILIZER ---
            if (cell.type === 'fertilizer') {
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'soil') {
                                new_grid[x][y] = 0;
                                let seeds = ['tree_seed', 'flower_seed', 'grass_seed'];
                                let i = Math.floor(Math.random() * seeds.length);
                                let seed = seeds[i];
                                createElementAt(cx, cy, seed);
                                break;
                            }
                        }
                    }
                }

                if (y + 1 < HEIGHT) {
                    if (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'acid') {
                        swap(x, y, x, y + 1);
                    } else if (x - 1 >= 0 && (grid[x - 1][y + 1] === 0 || grid[x - 1][y + 1].type === 'water') && Math.random() < 0.5) {
                        swap(x, y, x - 1, y + 1);
                    } else if (x + 1 < WIDTH && (grid[x + 1][y + 1] === 0 || grid[x + 1][y + 1].type === 'water')) {
                        swap(x, y, x + 1, y + 1);
                    }
                }
            }

            // --- WATER ---
            if (cell.type === 'water') {
                if (y + 1 < HEIGHT && grid[x][y + 1] === 0) {
                    swap(x, y, x, y + 1);
                } else if (Math.random() > 0.5) {
                    let left = x - 1 >= 0 && grid[x - 1][y] === 0;
                    let right = x + 1 < WIDTH && grid[x + 1][y] === 0;
                    if (left && right) {
                        let dir = Math.random() < 0.5 ? -1 : 1;
                        swap(x, y, x + dir, y);
                    } else if (left) {
                        swap(x, y, x - 1, y);
                    } else if (right) {
                        swap(x, y, x + 1, y);
                    }
                }

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'sand') {
                                createElementAt(cx, cy, 'wet_sand');
                            }
                            if (grid[cx][cy].type === 'magma' || grid[cx][cy].type === 'fire') {
                                createElementAt(x, y, 'steam');
                            }
                            if (grid[cx][cy].type === 'stone' || grid[cx][cy].type === 'brick') {
                                if (Math.random() > 0.999) {
                                    createElementAt(cx, cy, 'sand');
                                }
                            }
                            if (grid[cx][cy].type === 'thorium') {
                                if (Math.random() > 0.999) {
                                    createElementAt(cx, cy, 'acid');
                                }
                            }
                        }
                    }
                }
            }

            // --- STEAM ---
            if (cell.type === 'steam') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'water');
                    continue;
                }

                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 2) - 1; // 0 or -1
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && (grid[nx][ny] === 0 || grid[nx][ny].type === 'water') && Math.random() < 0.2) {
                    swap(x, y, nx, ny);
                }
            }

            // --- MOLTEN GLASS ---
            if (cell.type === 'molten_glass') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'glass');
                    continue;
                }

                if (y + 1 < HEIGHT && grid[x][y + 1] === 0) {
                    swap(x, y, x, y + 1);
                } else if (Math.random() > 0.5) {
                    let left = x - 1 >= 0 && grid[x - 1][y] === 0;
                    let right = x + 1 < WIDTH && grid[x + 1][y] === 0;
                    if (left && right) {
                        let dir = Math.random() < 0.5 ? -1 : 1;
                        swap(x, y, x + dir, y);
                    } else if (left) {
                        swap(x, y, x - 1, y);
                    } else if (right) {
                        swap(x, y, x + 1, y);
                    }
                }

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'water') {
                                createElementAt(x, y, 'glass');
                            }
                        }
                    }
                }
            }

            // --- WET SAND ---
            if (cell.type === 'wet_sand') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'brick');
                    continue;
                }

                const up = Math.random() > 0.5;

                if (grid[x][y - 1].type === 'water' && up) {
                    swap(x, y, x, y - 1);
                }
                
                if (y + 1 < HEIGHT && (grid[x][y + 1] === 0 || (grid[x][y + 1].type === 'water' && !up))) {
                    swap(x, y, x, y + 1);
                } else if (Math.random() > 0.5) {
                    let left = x - 1 >= 0 && (grid[x - 1][y] === 0 || grid[x - 1][y].type === 'water');
                    let right = x + 1 < WIDTH && (grid[x + 1][y] === 0 || grid[x + 1][y].type === 'water');
                    if (left && right) {
                        let dir = Math.random() < 0.5 ? -1 : 1;
                        swap(x, y, x + dir, y);
                    } else if (left) {
                        swap(x, y, x - 1, y);
                    } else if (right) {
                        swap(x, y, x + 1, y);
                    }
                }

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'sand') {
                                createElementAt(cx, cy, 'wet_sand');
                            }
                            if (grid[cx][cy].type === 'magma' || grid[cx][cy].type === 'fire' || grid[cx][cy].type === 'lava') {
                                createElementAt(x, y, 'brick');
                            }
                            if (grid[cx][cy].type === 'stone' || grid[cx][cy].type === 'brick') {
                                if (Math.random() > 0.999) {
                                    createElementAt(cx, cy, 'sand');
                                }
                            }
                        }
                    }
                }
            }

            // --- URANIUM ---
            if (cell.type === 'uranium') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    
                    if (Math.random() > 0.9) {
                        createElementAt(x, y, 'alpha');
                    }
                    else {
                        createElementAt(x, y, 'thorium');
                    }
                    continue;
                }

                if (y + 1 < HEIGHT) {
                    if (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'acid') {
                        swap(x, y, x, y + 1);
                    } else if (x - 1 >= 0 && (grid[x - 1][y + 1] === 0 || grid[x - 1][y + 1].type === 'water') && Math.random() < 0.5) {
                        swap(x, y, x - 1, y + 1);
                    } else if (x + 1 < WIDTH && (grid[x + 1][y + 1] === 0 || grid[x + 1][y + 1].type === 'water')) {
                        swap(x, y, x + 1, y + 1);
                    }
                }
            }

            // --- THORIUM ---
            if (cell.type === 'thorium') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    if (Math.random() > 0.9) {
                        createElementAt(x, y, 'electron');
                    }
                    else {
                        createElementAt(x, y, 'radium');
                    }
                    continue;
                }

                if (y + 1 < HEIGHT) {
                    if (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'acid') {
                        swap(x, y, x, y + 1);
                    } else if (x - 1 >= 0 && (grid[x - 1][y + 1] === 0 || grid[x - 1][y + 1].type === 'water') && Math.random() < 0.5) {
                        swap(x, y, x - 1, y + 1);
                    } else if (x + 1 < WIDTH && (grid[x + 1][y + 1] === 0 || grid[x + 1][y + 1].type === 'water')) {
                        swap(x, y, x + 1, y + 1);
                    }
                }
            }

            // --- RADIUM ---
            if (cell.type === 'radium') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'radon');
                    continue;
                }
            }

            // --- RADON ---
            if (cell.type === 'radon') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'lead');
                    continue;
                }

                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 2) - 1; // 0 or -1
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && grid[nx][ny] === 0 && Math.random() < 0.2) {
                    swap(x, y, nx, ny);
                }
            }

            // --- LEAD ---
            if (cell.type === 'lead') {
                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 3) - 1;
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && grid[nx][ny].type === 'water' && Math.random() < 0.2) {
                    swap(x, y, nx, ny);
                }
            }

            

            // --- ACID ---
            if (cell.type === 'acid') {
                // Dissolves things below it
                undisolvables = ['acid', 'blackhole', 'glass', 'barrier', 'water', 'thorium'];
                if (y + 1 < HEIGHT && grid[x][y + 1] !== 0 && !undisolvables.includes(grid[x][y + 1].type)) {
                    new_grid[x][y + 1] = 0;
                    new_grid[x][y] = 0; // Acid consumes itself
                } else if (x + 1 < WIDTH && grid[x + 1][y] !== 0 && !undisolvables.includes(grid[x + 1][y].type)) {
                    new_grid[x + 1][y] = 0;
                    new_grid[x][y] = 0; // Acid consumes itself
                } else if (x - 1 > 0 && grid[x - 1][y] !== 0 && !undisolvables.includes(grid[x - 1][y].type)) {
                    new_grid[x - 1][y] = 0;
                    new_grid[x][y] = 0; // Acid consumes itself
                }
                else if (y + 1 < HEIGHT && (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water')) {
                    swap(x, y, x, y + 1);
                } else if (Math.random() > 0.5) {
                    let dir = Math.random() < 0.5 ? -1 : 1;
                    if (x + dir >= 0 && x + dir < WIDTH && (grid[x + dir][y] === 0 || grid[x + dir][y].type === 'water')) {
                        swap(x, y, x + dir, y);
                    }
                }
            }

            // --- SOIL ---
            if (cell.type === 'soil') {
                if (y + 1 < HEIGHT) {
                    if (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'acid' || grid[x][y + 1].type === 'steam') {
                        swap(x, y, x, y + 1);
                    } else if (x - 1 >= 0 && (grid[x - 1][y + 1] === 0 || grid[x - 1][y + 1].type === 'water' || grid[x][y + 1].type === 'acid' || grid[x][y + 1].type === 'steam') && Math.random() < 0.5) {
                        swap(x, y, x - 1, y + 1);
                    } else if (x + 1 < WIDTH && (grid[x + 1][y + 1] === 0 || grid[x + 1][y + 1].type === 'water' || grid[x][y + 1].type === 'acid' || grid[x][y + 1].type === 'steam')) {
                        swap(x, y, x + 1, y + 1);
                    }
                }
            }

            // --- GUNPOWDER ---
            if (cell.type === 'gunpowder') {
                if (y + 1 < HEIGHT && grid[x][y + 1] === 0) {
                    swap(x, y, x, y + 1);
                } else if (x - 1 >= 0 && grid[x - 1][y + 1] === 0 && Math.random() < 0.5) {
                    swap(x, y, x - 1, y + 1);
                } else if (x + 1 < WIDTH && grid[x + 1][y + 1] === 0) {
                    swap(x, y, x + 1, y + 1);
                }
            }

            // --- FIRE ---
            if (cell.type === 'fire') {
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    new_grid[x][y] = 0;
                    continue;
                }
                // Spark color animation
                cell.color = `hsl(${15 + Math.random()*25}, 100%, ${50 + Math.random()*20}%)`;

                // Try to float upwards/sideways
                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 2) - 1; // 0 or -1
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && grid[nx][ny] === 0 && Math.random() < 0.2) {
                    swap(x, y, nx, ny);
                }

                // Ignite Gunpowder nearby
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'gunpowder' ||
                                grid[cx][cy].type === 'magnesium' ||
                                grid[cx][cy].type === 'hydrogen'
                            ) {
                                explode(cx, cy);
                            }
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                createElementAt(cx, cy, 'fire');
                            }
                        }
                    }
                }
            }

            // --- LAVA / ETERNAL LAVA / POLONIUM ---

            if (cell.type === 'lava' || cell.type === 'eternal_lava' || cell.type === 'polonium') {
                if (cell.type === 'lava') {
                    if (new_grid[x][y].type === 'lava') new_grid[x][y].life--;
                    else if (x <= WIDTH - 1 && new_grid[x + 1][y].type === 'lava') new_grid[x + 1][y].life--;
                    else if (x > 1 && new_grid[x - 1][y].type === 'lava') new_grid[x - 1][y].life--;


                    if (cell.life <= 0) {
                        createElementAt(x, y, 'magma');
                        continue;
                    }
                }

                else if (cell.type === 'polonium') {
                    if (new_grid[x][y].type === 'polonium') new_grid[x][y].life--;
                    else if (x < WIDTH - 1 && new_grid[x + 1][y].type === 'polonium') new_grid[x + 1][y].life--;
                    else if (x > 1 && new_grid[x - 1][y].type === 'polonium') new_grid[x - 1][y].life--;


                    if (cell.life <= 0) {
                        if (Math.random() > 0.9) {
                            createElementAt(x, y, 'alpha');
                        }
                        else {
                            createElementAt(x, y, 'uranium');
                        }
                        continue;
                    }
                }

                // Spark color animation
                if (cell.type !== 'polonium') cell.color = `hsl(${15 + Math.random()*25}, 100%, ${50 + Math.random()*20}%)`;

                // Move like water
                if (y + 1 < HEIGHT && grid[x][y + 1] === 0) {
                    swap(x, y, x, y + 1);
                } else if (Math.random() > 0.5) {
                    let left = x - 1 >= 0 && grid[x - 1][y] === 0;
                    let right = x + 1 < WIDTH && grid[x + 1][y] === 0;
                    if (left && right) {
                        let dir = Math.random() < 0.5 ? -1 : 1;
                        swap(x, y, x + dir, y);
                    } else if (left) {
                        swap(x, y, x - 1, y);
                    } else if (right) {
                        swap(x, y, x + 1, y);
                    }
                }

                // Ignite Gunpowder nearby
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            if (grid[cx][cy].type === 'gunpowder' ||
                                grid[cx][cy].type === 'magnesium' ||
                                grid[cx][cy].type === 'hydrogen'
                            ) {
                                explode(cx, cy);
                            }
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                new_grid[cx][cy] = { type: 'fire', color: '#ff4500', life: 15 };
                            }

                            // Melt sand & glass
                            if (grid[cx][cy].type === 'glass' || grid[cx][cy].type === 'sand') {
                                createElementAt(cx, cy, 'molten_glass');
                            }

                            if (grid[cx][cy].type === 'water') {
                                createElementAt(x, y, 'magma');
                            }

                            if (grid[cx][cy].type === 'brick') {
                                if (Math.random() > 0.99) createElementAt(cx, cy, 'lava');
                            }
                        }
                    }
                }
            }

            // --- MAGMA ---

            if (cell.type === 'magma') {
                
                try { new_grid[x][y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    createElementAt(x, y, 'stone');
                    continue;
                }

                // Ignite Gunpowder nearby
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                new_grid[cx][cy] = { type: 'fire', color: '#ff4500', life: 15 };
                            }

                            // Melt sand & glass
                            if (grid[cx][cy].type === 'glass' || grid[cx][cy].type === 'sand') {
                                createElementAt(cx, cy, 'molten_glass');
                            }

                            if (grid[cx][cy].type === 'water') {
                                if (Math.random() > 0.999) createElementAt(x, y, 'stone');
                            }

                            if (grid[cx][cy].type === 'brick') {
                                if (Math.random() > 0.99) createElementAt(cx, cy, 'lava');
                            }
                        }
                    }
                }
            }

            // --- GRASS SEED ---
            if (cell.type === 'grass_seed') {
                if (y + 1 < HEIGHT && (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'grass_seed' || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                    swap(x, y, x, y + 1);
                } else if (y + 1 < HEIGHT && grid[x][y + 1].type === 'soil') {
                    // Turn into grass blade
                    new_grid[x][y] = { type: 'grass', color: '#3ad43a', length: 1 };
                }
            }

            // --- GRASS GROWTH ---
            if (cell.type === 'grass') {
                if (cell.length < 5 && Math.random() < 0.02) {
                    if (y - 1 >= 0 && (grid[x][y - 1] === 0 || grid[x][y - 1].type === 'grass_seed')) {
                        new_grid[x][y - 1] = { type: 'grass', color: '#2eb32e', length: cell.length + 1 };
                    }
                }
            }

            // --- FLOWER SEED ---
            if (cell.type === 'flower_seed') {
                if (y + 1 < HEIGHT && (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                    swap(x, y, x, y + 1);
                } else if (y + 1 < HEIGHT && (grid[x][y + 1].type === 'soil' || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                    // Initiate multi-pixel stem growth
                    new_grid[x][y] = { type: 'flower', part: 'stem', length: 1, color: '#64bd64' };
                }
            }

            // --- FLOWER STRUCTURAL GROWTH ---
            if (cell.type === 'flower' && cell.part === 'stem') {
                if (cell.length < 7) {
                    if (Math.random() < 0.05 && y - 1 >= 0 && (grid[x][y - 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer' || grid[x][y + 1].type === 'flower_seed')) {
                        new_grid[x][y - 1] = { type: 'flower', part: 'stem', length: cell.length + 1, color: '#64bd64' };
                        // Convert old stem pixel to static flower stem color to halt its logic loop
                        cell.part = 'done_stem'; 
                    }
                } else {
                    // Stem reached full height! Grow custom petal structure
                    growPetals(x, y);
                    cell.part = 'done_stem';
                }
            }

            // --- TREE SEED ---
            if (cell.type === 'tree_seed') {
                if (y + 1 < HEIGHT && (grid[x][y + 1] === 0 || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                    swap(x, y, x, y + 1);
                } else if (y + 1 < HEIGHT && (grid[x][y + 1].type === 'soil' || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                    // Initiate multi-pixel stem growth
                    new_grid[x][y] = { type: 'tree', part: 'trunk', length: 1, color: '#9f3d00' };
                }
            }

            // --- TREE STRUCTURAL GROWTH ---
            if (cell.type === 'tree' && cell.part === 'trunk') {
                if (cell.length < 20) {
                    if (Math.random() < 0.05 && y - 1 >= 0 && (grid[x][y - 1] === 0 || grid[x][y - 1].type === 'tree_seed' || grid[x][y + 1].type === 'water' || grid[x][y + 1].type === 'fertilizer')) {
                        new_grid[x][y - 1] = { type: 'tree', part: 'trunk', length: cell.length + 1, color: '#9f3d00' };
                        // Convert old stem pixel to static flower stem color to halt its logic loop
                        cell.part = 'done_trunk';
                    }
                } else {
                    // Stem reached full height! Grow custom petal structure
                    growLeaves(x, y);
                    cell.part = 'done_trunk';
                }
            }

            // --- ELECTRON ---
            if (cell.type === 'electron') {

                let new_x;
                let new_y;
                switch (cell.direction) {
                    case 0:
                        new_x = x + 1;
                        new_y = y;
                        break;
                    case 1:
                        new_x = x - 1;
                        new_y = y;
                        break;
                    case 2:
                        new_x = x;
                        new_y = y + 1;
                        break;
                    case 3:
                        new_x = x;
                        new_y = y - 1;
                        break;
                    case 4:
                        new_x = x + 1;
                        new_y = y - 1;
                        break;
                    case 5:
                        new_x = x - 1;
                        new_y = y + 1;
                        break;
                    case 6:
                        new_x = x + 1;
                        new_y = y + 1;
                        break;
                    case 7:
                        new_x = x - 1;
                        new_y = y - 1;
                        break;
                    default:
                        new_x = x + 1;
                        new_y = y + 1;
                }

                if (grid[new_x] === undefined || grid[new_x][new_y] === undefined) {
                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                    try { new_grid[x][y].life--; }
                    catch (e) { }
                    if (cell.life <= 0) {
                        new_grid[x][y] = 0;
                        continue;
                    }

                    continue;
                }

                const target = grid[new_x][new_y];
            
                if (
                    target === 0 ||
                    target.type === 'water' ||
                    target.type === 'electron' ||
                    target.type === 'thorium' ||
                    target.type === 'steam' ||
                    target.type === 'hydrogen'
                ) {
                    swap(x, y, new_x, new_y);
                } else if (target.type === 'magnesium') {
                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                } else {
                    new_grid[x][y] = 0;
                    if (Math.random() > 0.99) new_grid[new_x][new_y] = 0;
                }

                try { new_grid[new_x][new_y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    new_grid[new_x][new_y] = 0;
                    continue;
                }
                

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                new_grid[cx][cy] = 0;
                                new_grid[x][y] = 0;
                            }
                        }
                    }
                }
            }
            
            

            // --- ALPHA ---
            if (cell.type === 'alpha') {

                let new_x;
                let new_y;
                switch (cell.direction) {
                    case 0:
                        new_x = x + 1;
                        new_y = y;
                        break;
                    case 1:
                        new_x = x - 1;
                        new_y = y;
                        break;
                    case 2:
                        new_x = x;
                        new_y = y + 1;
                        break;
                    case 3:
                        new_x = x;
                        new_y = y - 1;
                        break;
                    case 4:
                        new_x = x + 1;
                        new_y = y - 1;
                        break;
                    case 5:
                        new_x = x - 1;
                        new_y = y + 1;
                        break;
                    case 6:
                        new_x = x + 1;
                        new_y = y + 1;
                        break;
                    case 7:
                        new_x = x - 1;
                        new_y = y - 1;
                        break;
                    default:
                        new_x = x + 1;
                        new_y = y + 1;
                }

                if (grid[new_x] === undefined || grid[new_x][new_y] === undefined) {
                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                    try { new_grid[x][y].life--; }
                    catch (e) { }
                    if (cell.life <= 0) {
                        new_grid[x][y] = 0;
                        continue;
                    }

                    continue;
                }

                try { new_grid[new_x][new_y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    new_grid[new_x][new_y] = 0;
                    continue;
                }

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                new_grid[cx][cy] = 0;
                                new_grid[x][y] = 0;
                            }

                            if (grid[cx][cy].type === 'lead') {
                                if (Math.random() > 0.999) {
                                    createElementAt(cx, cy, 'polonium');
                                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                                }
                                else new_grid[x][y] = 0;
                            }
                        }
                    }
                }

                const target = grid[new_x][new_y];
            
                if (
                    target === 0 ||
                    target.type === 'water' ||
                    target.type === 'alpha' ||
                    target.type === 'uranium' ||
                    target.type === 'steam' ||
                    target.type === 'hydrogen'
                ) {
                    swap(x, y, new_x, new_y);
                } else if (target.type === 'magnesium') {
                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                } else {
                    new_grid[x][y] = 0;
                    if (Math.random() > 0.99) new_grid[new_x][new_y] = 0;
                }
            }

            // --- NEUTRON ---
            if (cell.type === 'neutron') {

                let new_x;
                let new_y;
                switch (cell.direction) {
                    case 0:
                        new_x = x + 1;
                        new_y = y;
                        break;
                    case 1:
                        new_x = x - 1;
                        new_y = y;
                        break;
                    case 2:
                        new_x = x;
                        new_y = y + 1;
                        break;
                    case 3:
                        new_x = x;
                        new_y = y - 1;
                        break;
                    case 4:
                        new_x = x + 1;
                        new_y = y - 1;
                        break;
                    case 5:
                        new_x = x - 1;
                        new_y = y + 1;
                        break;
                    case 6:
                        new_x = x + 1;
                        new_y = y + 1;
                        break;
                    case 7:
                        new_x = x - 1;
                        new_y = y - 1;
                        break;
                    default:
                        new_x = x + 1;
                        new_y = y + 1;
                }

                if (grid[new_x] === undefined || grid[new_x][new_y] === undefined) {
                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                    try { new_grid[x][y].life--; }
                    catch (e) { }
                    if (cell.life <= 0) {
                        new_grid[x][y] = 0;
                        continue;
                    }

                    continue;
                }

                try { new_grid[new_x][new_y].life--; }
                catch (e) { }
                if (cell.life <= 0) {
                    new_grid[new_x][new_y] = 0;
                    continue;
                }

                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'grass' || grid[cx][cy].type === 'flower' || grid[cx][cy].type === 'grass_seed' || grid[cx][cy].type === 'flower_seed' || grid[cx][cy].type === 'tree') {
                                new_grid[cx][cy] = 0;
                                new_grid[x][y] = 0;
                            }

                            if (grid[cx][cy].type === 'lead') {
                                if (Math.random() > 0.99) {
                                    createElementAt(cx, cy, 'polonium');
                                    new_grid[x][y].direction = Math.floor(Math.random() * 8);
                                }
                                else new_grid[x][y] = 0;
                            }
                        }
                    }
                }

                const target = grid[new_x][new_y];
            
                if (
                    target === 0 ||
                    (
                        target.type !== 'lead' &&
                        target.type !== 'alpha' &&
                        target.type !== 'electron'
                    )
                ) {
                    if (target.type === 'neutron' ||
                        target.type !== 'alpha' ||
                        target.type !== 'electron'
                    ) new_grid[x][y].direction = Math.floor(Math.random() * 8);
                    swap(x, y, new_x, new_y);
                }
            }

            // --- MAGNESIUM ---
            if (cell.type === 'magnesium') {
                for (let sx = -1; sx <= 1; sx++) {
                    for (let sy = -1; sy <= 1; sy++) {
                        let cx = x + sx;
                        let cy = y + sy;
                        if (cx >= 0 && cx < WIDTH && cy >= 0 && cy < HEIGHT && grid[cx][cy]) {
                            
                            // Burn away grass/flowers
                            if (grid[cx][cy].type === 'water' && Math.random() > 0.99) {
                                if (Math.random() > 0.99) createElementAt(x, y, 'fertilizer');
                                else createElementAt(x, y, 'hydrogen');
                            }
                        }
                    }
                }
            }

            // --- HYDROGEN ---
            if (cell.type === 'hydrogen') {
                if (Math.random() > 0.999) {
                    createElementAt(x, y, 'steam');
                    continue;
                }

                let dx = Math.floor(Math.random() * 3) - 1;
                let dy = Math.floor(Math.random() * 2) - 1; // 0 or -1
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT && (grid[nx][ny] === 0 || grid[nx][ny].type === 'water') && Math.random() < 0.2) {
                    swap(x, y, nx, ny);
                }
            }
        }
    }
}

let already_swapped_cells = [];

function swap(x1, y1, x2, y2) {
    let cell1 = grid[x1][y1];
    let cell2 = grid[x2][y2];

    if (
        already_swapped_cells.some(cell => cell.x === x1 && cell.y === y1) || 
        already_swapped_cells.some(cell => cell.x === x2 && cell.y === y2)
    ) return false;

    new_grid[x1][y1] = cell2;
    new_grid[x2][y2] = cell1;

    already_swapped_cells.push({ x: x1, y: y1 });
    already_swapped_cells.push({ x: x2, y: y2 });

    return true;
}

function explode(x, y) {
    const radius = 20;
    for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
            if (Math.sqrt(dx*dx + dy*dy) <= radius) {
                let nx = x + dx;
                let ny = y + dy;
                if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
                    if (grid[nx][ny] && (grid[nx][ny].type === 'blackhole' || grid[nx][ny].type === 'barrier')) continue;
                    
                    if (Math.random() < 0.6) {
                        new_grid[nx][ny] = {
                            type: 'fire',
                            color: '#ff4500',
                            life: 20 + Math.random() * 20
                        };
                        addElement('fire');
                    } else {
                        new_grid[nx][ny] = 0; // Blasted away
                    }
                }
            }
        }
    }
}

function growPetals(x, y) {
    const petalColors = ['#ff3366', '#ffcc00', '#9933ff', '#ff6600', '#ffffff'];
    const flowerColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    
    // Cross layout for the flower bud bloom
    const petals = [
        {dx: 0, dy: -1}, {dx: -1, dy: -1}, {dx: 1, dy: -1},
        {dx: -1, dy: 0},  {dx: 0, dy: 0},   {dx: 1, dy: 0},
        {dx: 0, dy: 1}
    ];

    petals.forEach(p => {
        let nx = x + p.dx;
        let ny = y + p.dy;
        if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
            if (grid[nx][ny] === 0 || grid[nx][ny].type === 'flower_seed') {
                new_grid[nx][ny] = { 
                    type: 'flower', 
                    part: 'petal', 
                    color: p.dx === 0 && p.dy === 0 ? '#ffcc33' : flowerColor // Yellow center bud
                };
            }
        }
    });
}

function growLeaves(x, y) {
    const leafColor = '#a2ff00';
    
    // Cross layout for the flower bud bloom
    const leaves = [
        {dx: 0, dy: -2}, {dx: -1, dy: -2}, {dx: 1, dy: -2}, {dx: -2, dy: -2}, {dx: 2, dy: -2},
        {dx: 0, dy: -1}, {dx: -1, dy: -1}, {dx: 1, dy: -1}, {dx: -2, dy: -1}, {dx: 2, dy: -1},
        {dx: -2, dy: 0}, {dx: -1, dy: 0},  {dx: 0, dy: 0},   {dx: 1, dy: 0},  {dx: 2, dy: 0},
        {dx: 0, dy: 1},  {dx: -1, dy: 1},  {dx: 1, dy: 1},  {dx: -2, dy: 1},  {dx: 2, dy: 1},
        { dx: 0, dy: 2 }, { dx: -1, dy: 2 }, { dx: 1, dy: 2 },
        {dx: 0, dy: -3}, {dx: -1, dy: -3}, {dx: 1, dy: -3}, {dx: -3, dy: -3}, {dx: 3, dy: -3},
        {dx: -3, dy: -1}, {dx: 3, dy: -1},
        {dx: -3, dy: 0},
        {dx: -3, dy: 1},  {dx: 3, dy: 1},
        { dx: 0, dy: 3 }, { dx: -1, dy: 3 }, { dx: 1, dy: 3 }, { dx: -2, dy: -3 }, { dx: 2, dy: -3 },
        { dx: -3, dy: -2 }, { dx: 3, dy: -2 }, { dx: 3, dy: 0 }, { dx: 2, dy: 3 }, { dx: -2, dy: 3 }, { dx: 1, dy: 3 },
        { dx: -1, dy: 3 }, { dx: 3, dy: 3 }, { dx: -3, dy: 3 }, { dx: 2, dy: 2 }, { dx: -2, dy: 2 }, 
        { dx: 3, dy: 2 }, { dx: -3, dy: 2}, 
    ];

    leaves.forEach(p => {
        let nx = x + p.dx;
        let ny = y + p.dy;
        if (nx >= 0 && nx < WIDTH && ny >= 0 && ny < HEIGHT) {
            if (grid[nx][ny] === 0 || grid[nx][ny].type === 'tree_seed') {
                new_grid[nx][ny] = { 
                    type: 'tree', 
                    part: 'leaf', 
                    color: leafColor
                };
            }
        }
    });
}

// Render Engine loop
function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let x = 0; x < WIDTH; x++) {
        for (let y = 0; y < HEIGHT; y++) {
            let cell = grid[x][y];
            if (cell) {
                ctx.fillStyle = cell.color;
                // Add texture to grainy substances like Sand/Soil/Gunpowder
                if (cell.variant &&
                    (
                        cell.type === 'sand' ||
                        cell.type === 'soil' ||
                        cell.type === 'gunpowder' ||
                        cell.type === 'lava' ||
                        cell.type === 'eternal_lava' ||
                        cell.type === 'stone' ||
                        cell.type === 'fertilizer' ||
                        cell.type === 'magnesium'
                    )
                ) { 
                    ctx.fillStyle = adjustBrightness(cell.color, (cell.variant * 20) - 10);
                }
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
        localStorage.setItem('sandbox_shown_elements', JSON.stringify(shown_elements));
        if (DEBUG) console.log('Progress saved successfully!');
    } catch (error) {
        console.error('Failed to save data to cache:', error);
    }
}

function loop() {
    if (running) {
        already_swapped_cells = Array(0).fill(null);
        new_grid = grid.map(col => col.map(cell => cell ? { ...cell } : 0));
        update();
        grid = new_grid;
    }

    render();
}

// Kick off the sandbox
setInterval(loop, 20);
requestAnimationFrame(loop);