export const DISCOVERABLE_PARTICLES = [
    'eraser',
    'barrier',
    'O',
    'O2',
    'H',
    'H2',
    'H2O2',
    'H2O',
    'S',
    'S8',
    'H2S',
    'SO2',
    'SO3',
    'H2SO4'
];

export const DEFAULT_SHOWN_PARTICLES = [
    "eraser",
    "barrier",
    'O',
    'H',
    'S'
];

export const ELEMENTAL_PROPERTIES = {
    O: {
        p: 8,
        n: 8,
        e: 8,
        mass: 16,
    },
    H: {
        p: 1,
        n: 0,
        e: 1,
        mass: 1,
    },
    S: {
        p: 16,
        n: 16,
        e: 16,
        mass: 32,
    }
};

export const CHEMICAL_PROPERTIES = {
    barrier: {
        reactivity: 0,
        nature: 'special',
        shc: 0,
        solid_density: 1000,
        liquid_density: 1000,
        gas_density: 1000
    },
    H: {
        reactivity: 95,
        nature: 'atom',
        shc: 1,
        solid_density: 0.08,    // Highly compressed/theoretical atomic solid
        liquid_density: 0.07,   // Close to liquid H2
        gas_density: 0.045      // Half the density of H2 gas
    },
    O: {
        reactivity: 100,
        nature: 'atom',
        shc: 2,
        solid_density: 1.3,     // Solid atomic/molecular estimate
        liquid_density: 1.14,
        gas_density: 0.71       // Half the density of O2 gas
    },
    S: {
        reactivity: 75,
        nature: 'atom',
        shc: 3,
        solid_density: 2.07,    // Matches bulk solid sulfur
        liquid_density: 1.80,
        gas_density: 1.35       // Vaporized atomic sulfur state
    },
    H2: {
        reactivity: 60,
        nature: 'molecule',
        shc: 4,
        solid_density: 0.086,   // Extremely light solid
        liquid_density: 0.070,  // Liquid hydrogen
        gas_density: 0.089      // g/L at STP (very buoyant)
    },
    O2: {
        reactivity: 50,
        nature: 'molecule',
        shc: 5,
        solid_density: 1.33,
        liquid_density: 1.14,
        gas_density: 1.43       // g/L at STP
    },
    S8: {
        reactivity: 40,
        nature: 'molecule',
        shc: 6,
        solid_density: 2.07,    // Standard alpha-sulfur crystalline density
        liquid_density: 1.81,   // Molten sulfur
        gas_density: 10.8       // Heavy gas vapor (g/L)
    },
    H2O: {
        reactivity: 10,
        nature: 'molecule',
        shc: 16,
        solid_density: 0.917,   // Ice (less dense than liquid water!)
        liquid_density: 1.00,   // Standard water benchmark
        gas_density: 0.804      // Water vapor (g/L)
    },
    H2O2: {
        reactivity: 80,
        nature: 'molecule',
        shc: 11,
        solid_density: 1.71,
        liquid_density: 1.45,   // Quite a bit denser than water
        gas_density: 1.52       // g/L (theoretical vapor density)
    },
    H2S: {
        reactivity: 65,
        nature: 'molecule',
        shc: 8,
        solid_density: 1.12,
        liquid_density: 0.92,
        gas_density: 1.54       // g/L (heavier than air)
    },
    SO2: {
        reactivity: 55,
        nature: 'molecule',
        shc: 7,
        solid_density: 1.43,
        liquid_density: 1.46,
        gas_density: 2.93       // g/L (dense, choking gas)
    },
    SO3: {
        reactivity: 70,
        nature: 'molecule',
        shc: 9,
        solid_density: 1.92,
        liquid_density: 1.77,
        gas_density: 3.57       // g/L
    },
    H2SO4: {
        reactivity: 85,
        nature: 'molecule',
        shc: 14,
        solid_density: 1.83,
        liquid_density: 1.84,   // Very dense, syrupy liquid
        gas_density: 4.38       // g/L (decomposes at high heat)
    }
};

export const MOLECULAR_PROPERTIES = {
    H2: {
        mp: 14,
        bp: 20,
        composition: ['H', 'H'],
    },
    O2: {
        mp: 55,
        bp: 90,
        composition: ['O', 'O'],
    },
    S8: {
        mp: 388,
        bp: 718,
        composition: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
    },
    H2O: {
        mp: 273,
        bp: 373,
        composition: ['H', 'H', 'O'],
    },
    H2O2: {
        mp: 273,
        bp: 423,
        composition: ['H', 'H', 'O', 'O'],
    },
    H2S: {
        mp: 191,
        bp: 213,
        composition: ['H', 'H', 'S'],
    },
    SO2: {
        mp: 201,
        bp: 263,
        composition: ['S', 'O', 'O'],
    },
    SO3: {
        mp: 290,
        bp: 318,
        composition: ['S', 'O', 'O', 'O'],
    },
    H2SO4: {
        mp: 283,
        bp: 610,
        composition: ['H', 'H', 'S', 'O', 'O', 'O', 'O'],
    }
};

export const PARTICLES = {
    eraser: { color: '#000000'},
    barrier: { color: '#000000'},
    
    // --- Oxygen Family (Red/Gray-Red Spectrum) ---
    O: { color: '#ff4d4d' },     // Bright, energetic red for the reactive atom
    O2: { color: '#b33636' },    // Deeper, stable brick-red for the gas molecule
    
    // --- Hydrogen Family (White/Light Blue-Gray Spectrum) ---
    H: { color: '#ffffff' },     // Pure white for the highly reactive atom
    H2: { color: '#d9e2ec' },    // Muted, pale silvery-blue for the stable gas molecule
    
    // --- Sulfur Family (Yellow/Gold/Mustard Spectrum) ---
    S: { color: '#ffeb3b' },     // Vibrant yellow for the raw sulfur atom
    S8: { color: '#c6a700' },    // Darker, crystalline mustard yellow for octasulfur
    
    // --- Hydrogen/Oxygen/Sulfur Compounds ---
    H2O: { color: '#4a90e2' },   // Classic clear blue for water
    H2O2: { color: '#a3c1ad' },  // Pale, slightly sickly greenish-blue for peroxide
    H2S: { color: '#d4af37' },   // Pale brownish-yellow (evoking a foul gas vibe)
    SO2: { color: '#ff9800' },   // Striking orange for sulfur dioxide gas
    SO3: { color: '#e65100' },   // Deep, heavy burnt orange for sulfur trioxide
    H2SO4: { color: '#9c27b0' }, // Toxic/acidic purple to highlight sulfuric acid danger
};

export const REACTIONS = [
    // --- Base Diatomic & Elemental Generation ---
    {
        reactants: ['H', 'H'],
        products: ['H2'],
        minTemp: 0, 
        heatReleased: 436 // Highly exothermic radical combination
    },
    {
        reactants: ['O', 'O'],
        products: ['O2'],
        minTemp: 0, 
        heatReleased: 498
    },
    {
        reactants: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'],
        products: ['S8'],
        minTemp: 0, 
        heatReleased: 800
    },

    // --- Water & Peroxide Generation ---
    {
        reactants: ['H2', 'H2', 'O2'],
        products: ['H2O', 'H2O'],
        minTemp: 573, 
        heatReleased: 572 
    },
    {
        reactants: ['H2', 'O2'],
        products: ['H2O2'],
        minTemp: 400,
        heatReleased: 136
    },
    {
        reactants: ['H2O2'],
        products: ['H2O', 'O'],
        minTemp: 350, 
        heatReleased: 100
    },

    // --- Sulfur Compounds ($H_2S$, $SO_2$, $SO_3$) ---
    {
        reactants: ['H2', 'S'],
        products: ['H2S'],
        minTemp: 523,
        heatReleased: 21
    },
    {
        reactants: ['S', 'O2'],
        products: ['SO2'],
        minTemp: 523,
        heatReleased: 297
    },
    {
        reactants: ['SO2', 'O'],
        products: ['SO3'],
        minTemp: 673,
        heatReleased: 99
    },
    {
        reactants: ['H2S', 'H2S', 'O2', 'O2', 'O2'],
        products: ['SO2', 'SO2', 'H2O', 'H2O'],
        minTemp: 523,
        heatReleased: 1036
    },

    // --- Acid Synthesis ($H_2SO_4$) ---
    {
        reactants: ['SO3', 'H2O'],
        products: ['H2SO4'],
        minTemp: 293, // Readily combines at room temp
        heatReleased: 130
    }
];

export const ROOM_TEMP = 293.5;