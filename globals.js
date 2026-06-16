export const DISCOVERABLE_PARTICLES = [
    'eraser',
    'barrier',
    'heat_finger',
    'O',
    'O2',
    'O3', // Added Ozone
    'H',
    'H2',
    'H2O2',
    'H2O',
    'S',
    'S8',
    'H2S',
    'SO2',
    'SO3',
    'H2SO4',
    'K',
    'KO2',
    'K2O',
    'KOH',
    'K2S',
    'K2SO4',
    'C',
    'CO',
    'CO2',
    'CH4',
    'CS2',
    'K2CO3',
    'N',
    'N2',
    'NH3',
    'NO',
    'NO2',
    'KNO3',
    'C2N2' // Added Cyanogen
];

export const DEFAULT_SHOWN_PARTICLES = [
    'eraser',
    'barrier',
    'heat_finger',
    'O',
    'H',
    'S',
    'K',
    'C',
    'N'
];

export const ELEMENTAL_PROPERTIES = {
    O: { p: 8, n: 8, e: 8, mass: 16 },
    H: { p: 1, n: 0, e: 1, mass: 1 },
    S: { p: 16, n: 16, e: 16, mass: 32 },
    K: { p: 19, n: 20, e: 19, mass: 39 },
    C: { p: 6, n: 6, e: 6, mass: 12 },
    N: { p: 7, n: 7, e: 7, mass: 14 }
};

export const CHEMICAL_PROPERTIES = {
    barrier: { reactivity: 0, nature: 'special', shc: 0, solid_density: 1000, liquid_density: 1000, gas_density: 1000 },
    H: { reactivity: 95, nature: 'atom', shc: 1, solid_density: 0.08, liquid_density: 0.07, gas_density: 0.045 },
    O: { reactivity: 100, nature: 'atom', shc: 2, solid_density: 1.3, liquid_density: 1.14, gas_density: 0.71 },
    S: { reactivity: 75, nature: 'atom', shc: 3, solid_density: 2.07, liquid_density: 1.80, gas_density: 1.35, emission: { r: 50, g: 100, b: 255 } },
    K: { reactivity: 100, nature: 'atom', shc: 0.75, solid_density: 0.89, liquid_density: 0.83, gas_density: 1.62, emission: { r: 216, g: 180, b: 248 } },
    C: { reactivity: 60, nature: 'atom', shc: 0.71, solid_density: 2.26, liquid_density: 2.00, gas_density: 0.54, emission: { r: 255, g: 110, b: 0 } },
    N: { reactivity: 70, nature: 'atom', shc: 1.04, solid_density: 1.02, liquid_density: 0.808, gas_density: 1.25, emission: { r: 0, g: 150, b: 255 } },
    H2: { reactivity: 60, nature: 'molecule', shc: 4, solid_density: 0.086, liquid_density: 0.070, gas_density: 0.089 },
    O2: { reactivity: 50, nature: 'molecule', shc: 5, solid_density: 1.33, liquid_density: 1.14, gas_density: 1.43 },
    O3: { reactivity: 85, nature: 'molecule', shc: 0.82, solid_density: 1.61, liquid_density: 1.35, gas_density: 2.14 }, // Added Ozone properties
    S8: { reactivity: 40, nature: 'molecule', shc: 6, solid_density: 2.07, liquid_density: 1.81, gas_density: 10.8 },
    H2O: { reactivity: 10, nature: 'molecule', shc: 16, solid_density: 0.917, liquid_density: 1.00, gas_density: 0.804 },
    H2O2: { reactivity: 80, nature: 'molecule', shc: 11, solid_density: 1.71, liquid_density: 1.45, gas_density: 1.52 },
    H2S: { reactivity: 65, nature: 'molecule', shc: 8, solid_density: 1.12, liquid_density: 0.92, gas_density: 1.54 },
    SO2: { reactivity: 55, nature: 'molecule', shc: 7, solid_density: 1.43, liquid_density: 1.46, gas_density: 2.93 },
    SO3: { reactivity: 70, nature: 'molecule', shc: 9, solid_density: 1.92, liquid_density: 1.77, gas_density: 3.57 },
    H2SO4: { reactivity: 85, nature: 'molecule', shc: 14, solid_density: 1.83, liquid_density: 1.84, gas_density: 4.38 },
    KO2: { reactivity: 75, nature: 'molecule', shc: 1.1, solid_density: 2.14, liquid_density: 2.00, gas_density: 3.17 },
    K2O: { reactivity: 80, nature: 'molecule', shc: 0.9, solid_density: 2.35, liquid_density: 2.10, gas_density: 4.20 },
    KOH: { reactivity: 85, nature: 'molecule', shc: 1.3, solid_density: 2.04, liquid_density: 1.82, gas_density: 2.50 },
    K2S: { reactivity: 50, nature: 'molecule', shc: 0.8, solid_density: 1.80, liquid_density: 1.65, gas_density: 4.91 },
    K2SO4: { reactivity: 15, nature: 'molecule', shc: 0.7, solid_density: 2.66, liquid_density: 2.30, gas_density: 7.77 },
    CO: { reactivity: 65, nature: 'molecule', shc: 1.04, solid_density: 0.79, liquid_density: 0.79, gas_density: 1.25 },
    CO2: { reactivity: 5, nature: 'molecule', shc: 0.84, solid_density: 1.56, liquid_density: 1.18, gas_density: 1.98 },
    CH4: { reactivity: 45, nature: 'molecule', shc: 2.22, solid_density: 0.49, liquid_density: 0.42, gas_density: 0.66 },
    CS2: { reactivity: 70, nature: 'molecule', shc: 1.00, solid_density: 1.43, liquid_density: 1.26, gas_density: 2.67 },
    K2CO3: { reactivity: 20, nature: 'molecule', shc: 0.84, solid_density: 2.43, liquid_density: 2.10, gas_density: 5.60 },
    N2: { reactivity: 1, nature: 'molecule', shc: 1.04, solid_density: 1.03, liquid_density: 0.808, gas_density: 1.25 },
    NH3: { reactivity: 40, nature: 'molecule', shc: 2.19, solid_density: 0.817, liquid_density: 0.681, gas_density: 0.73 },
    NO: { reactivity: 60, nature: 'molecule', shc: 0.99, solid_density: 1.34, liquid_density: 1.27, gas_density: 1.34 },
    NO2: { reactivity: 75, nature: 'molecule', shc: 0.83, solid_density: 1.44, liquid_density: 1.45, gas_density: 2.62 },
    KNO3: { reactivity: 65, nature: 'molecule', shc: 0.95, solid_density: 2.11, liquid_density: 2.00, gas_density: 4.50 },
    C2N2: { reactivity: 65, nature: 'molecule', shc: 1.35, solid_density: 0.95, liquid_density: 0.95, gas_density: 2.34 } // Added Cyanogen properties
};

export const MOLECULAR_PROPERTIES = {
    H2: { mp: 14, bp: 20, composition: ['H', 'H'] },
    O2: { mp: 55, bp: 90, composition: ['O', 'O'] },
    O3: { mp: 80, bp: 161, composition: ['O', 'O', 'O'] }, // Added Ozone composition
    S8: { mp: 388, bp: 718, composition: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'] },
    H2O: { mp: 273, bp: 373, composition: ['H', 'H', 'O'] },
    H2O2: { mp: 273, bp: 423, composition: ['H', 'H', 'O', 'O'] },
    H2S: { mp: 191, bp: 213, composition: ['H', 'H', 'S'] },
    SO2: { mp: 201, bp: 263, composition: ['S', 'O', 'O'] },
    SO3: { mp: 290, bp: 318, composition: ['S', 'O', 'O', 'O'] },
    H2SO4: { mp: 283, bp: 610, composition: ['H', 'H', 'S', 'O', 'O', 'O', 'O'] },
    KO2: { mp: 653, bp: 800, composition: ['K', 'O', 'O'] },
    K2O: { mp: 1013, bp: 1500, composition: ['K', 'K', 'O'] },
    KOH: { mp: 679, bp: 1593, composition: ['K', 'O', 'H'] },
    K2S: { mp: 1221, bp: 1400, composition: ['K', 'K', 'S'] },
    K2SO4: { mp: 1342, bp: 1962, composition: ['K', 'K', 'S', 'O', 'O', 'O', 'O'] },
    CO: { mp: 68, bp: 81, composition: ['C', 'O'] },
    CO2: { mp: 216, bp: 195, composition: ['C', 'O', 'O'] },
    CH4: { mp: 91, bp: 112, composition: ['C', 'H', 'H', 'H', 'H'] },
    CS2: { mp: 161, bp: 319, composition: ['C', 'S', 'S'] },
    K2CO3: { mp: 1164, bp: 1500, composition: ['K', 'K', 'C', 'O', 'O', 'O'] },
    N2: { mp: 63, bp: 77, composition: ['N', 'N'] },
    NH3: { mp: 195, bp: 240, composition: ['N', 'H', 'H', 'H'] },
    NO: { mp: 109, bp: 121, composition: ['N', 'O'] },
    NO2: { mp: 262, bp: 294, composition: ['N', 'O', 'O'] },
    KNO3: { mp: 607, bp: 673, composition: ['K', 'N', 'O', 'O', 'O'] },
    C2N2: { mp: 245, bp: 252, composition: ['C', 'C', 'N', 'N'] } // Added Cyanogen composition
};

export const PARTICLES = {
    eraser: { color: '#000000'},
    barrier: { color: '#000000' },
    heat_finger: { color: '#000000' },
    O: { color: '#ff4d4d' },
    O2: { color: '#b33636' },
    O3: { color: '#7b1fa2' }, // Dark violet for ozone gas
    H: { color: '#ffffff' },
    H2: { color: '#d9e2ec' },
    S: { color: '#ffeb3b' },
    S8: { color: '#c6a700' },
    H2O: { color: '#4a90e2' },
    H2O2: { color: '#a3c1ad' },
    H2S: { color: '#d4af37' },
    SO2: { color: '#ff9800' },
    SO3: { color: '#e65100' },
    H2SO4: { color: '#9c27b0' },
    K: { color: '#d8b4f8' },
    KO2: { color: '#ffb74d' },
    K2O: { color: '#e0e0e0' },
    KOH: { color: '#f3e5f5' },
    K2S: { color: '#ffe082' },
    K2SO4: { color: '#eceff1' },
    C: { color: '#424242' },
    CO: { color: '#78909c' },
    CO2: { color: '#90a4ae' },
    CH4: { color: '#81c784' },
    CS2: { color: '#afb42b' },
    K2CO3: { color: '#b0bec5' },
    N: { color: '#2196f3' },       
    N2: { color: '#1565c0' },      
    NH3: { color: '#00bcd4' },     
    NO: { color: '#8d6e63' },      
    NO2: { color: '#5d4037' },     
    KNO3: { color: '#e3f2fd' },
    C2N2: { color: '#ff8a80' } // Light pink-red toxic cyanogen gas
};

export const REACTIONS = [
    // --- Base Diatomic & Elemental Generation ---
    { reactants: ['H', 'H'], products: ['H2'], minTemp: 0, heatReleased: 436 },
    { reactants: ['O', 'O'], products: ['O2'], minTemp: 0, heatReleased: 498 },
    { reactants: ['S', 'S', 'S', 'S', 'S', 'S', 'S', 'S'], products: ['S8'], minTemp: 0, heatReleased: 800 },
    { reactants: ['N', 'N'], products: ['N2'], minTemp: 0, heatReleased: 945 },

    // --- Ozone Interactions ---
    {
        reactants: ['O2', 'O'],
        products: ['O3'],
        minTemp: 250,
        heatReleased: 105
    },
    {
        reactants: ['O3'], // Thermal decomposition of ozone back to oxygen at elevated heat
        products: ['O2', 'O'],
        minTemp: 523,
        heatReleased: -105
    },

    // --- Methane Combustion ---
    {
        reactants: ['CH4', 'O2', 'O2'], // Complete combustion
        products: ['CO2', 'H2O', 'H2O'],
        minTemp: 873,
        heatReleased: 891
    },
    {
        reactants: ['CH4', 'CH4', 'O2', 'O2', 'O2'], // Incomplete combustion (produces toxic CO)
        products: ['CO', 'CO', 'H2O', 'H2O', 'H2O', 'H2O'],
        minTemp: 800,
        heatReleased: 519
    },

    // --- Carbon Disulfide Combustion & Synthesis Updates ---
    {
        reactants: ['CS2', 'O2', 'O2', 'O2'],
        products: ['CO2', 'SO2', 'SO2'],
        minTemp: 363, // Low flashpoint combustion
        heatReleased: 1075
    },

    // --- Cyanogen Synthesis & Combustion ---
    {
        reactants: ['C', 'C', 'N2'],
        products: ['C2N2'],
        minTemp: 1200,
        heatReleased: -300 // Endothermic synthesis
    },
    {
        reactants: ['C2N2', 'O2', 'O2'],
        products: ['CO2', 'CO2', 'N2'],
        minTemp: 900,
        heatReleased: 1095 // Extremely hot flame profile
    },

    // --- Gunpowder / Black Powder Deflagration ---
    // Classic reaction using Charcoal (C), Sulfur (S), and Saltpeter (KNO3)
    {
        reactants: ['KNO3', 'KNO3', 'S', 'C', 'C', 'C'],
        products: ['K2S', 'N2', 'CO2', 'CO2', 'CO2'],
        minTemp: 573,
        heatReleased: 650
    },

    // --- Nitrogen Fixation & Compounds ---
    { reactants: ['N2', 'H2', 'H2', 'H2'], products: ['NH3', 'NH3'], minTemp: 673, heatReleased: 92.4 },
    { reactants: ['N2', 'O2'], products: ['NO', 'NO'], minTemp: 2200, heatReleased: -180 },
    { reactants: ['NO', 'NO', 'O2'], products: ['NO2', 'NO2'], minTemp: 293, heatReleased: 114 },
    { reactants: ['NH3', 'NH3', 'NH3', 'NH3', 'O2', 'O2', 'O2', 'O2', 'O2'], products: ['NO', 'NO', 'NO', 'NO', 'H2O', 'H2O', 'H2O', 'H2O', 'H2O', 'H2O'], minTemp: 773, heatReleased: 905 },
    { reactants: ['KOH', 'NO2', 'NO2', 'O'], products: ['KNO3', 'KNO3'], minTemp: 323, heatReleased: 220 },

    // --- Carbon & Oxygen (Combustion) ---
    { reactants: ['C', 'O2'], products: ['CO2'], minTemp: 673, heatReleased: 393.5 },
    { reactants: ['C', 'C', 'O2'], products: ['CO', 'CO'], minTemp: 673, heatReleased: 221 },
    { reactants: ['CO', 'CO', 'O2'], products: ['CO2', 'CO2'], minTemp: 880, heatReleased: 566 },

    // --- Carbon & Hydrogen (Methane Synthesis) ---
    { reactants: ['C', 'H2', 'H2'], products: ['CH4'], minTemp: 873, heatReleased: 74.8 },

    // --- Carbon & Sulfur (Carbon Disulfide Synthesis) ---
    { reactants: ['C', 'S', 'S'], products: ['CS2'], minTemp: 1123, heatReleased: -89 },

    // --- Carbon & Potassium Complexes ---
    { reactants: ['KOH', 'KOH', 'CO2'], products: ['K2CO3', 'H2O'], minTemp: 293, heatReleased: 114 },

    // --- Water & Peroxide Generation ---
    { reactants: ['H2', 'H2', 'O2'], products: ['H2O', 'H2O'], minTemp: 573, heatReleased: 572 },
    { reactants: ['H2', 'O2'], products: ['H2O2'], minTemp: 400, heatReleased: 136 },
    { reactants: ['H2O2'], products: ['H2O', 'O'], minTemp: 350, heatReleased: 100 },

    // --- Sulfur Compounds (H2S, SO2, SO3) ---
    { reactants: ['H2', 'S'], products: ['H2S'], minTemp: 523, heatReleased: 21 },
    { reactants: ['S', 'O2'], products: ['SO2'], minTemp: 523, heatReleased: 297 },
    { reactants: ['SO2', 'O'], products: ['SO3'], minTemp: 673, heatReleased: 99 },
    { reactants: ['H2S', 'H2S', 'O2', 'O2', 'O2'], products: ['SO2', 'SO2', 'H2O', 'H2O'], minTemp: 523, heatReleased: 1036 },

    // --- Acid Synthesis (H2SO4) ---
    { reactants: ['SO3', 'H2O'], products: ['H2SO4'], minTemp: 293, heatReleased: 130 },

    // --- Potassium Reactions ---
    { reactants: ['K', 'O2'], products: ['KO2'], minTemp: 293, heatReleased: 284 },
    { reactants: ['K', 'K', 'O'], products: ['K2O'], minTemp: 293, heatReleased: 363 },
    { reactants: ['K', 'K', 'H2O'], products: ['KOH', 'KOH', 'H2'], minTemp: 250, heatReleased: 390 },
    { reactants: ['K', 'K', 'S'], products: ['K2S'], minTemp: 373, heatReleased: 381 },
    { reactants: ['KOH', 'KOH', 'H2SO4'], products: ['K2SO4', 'H2O', 'H2O'], minTemp: 273, heatReleased: 114 }
];

export const ROOM_TEMP = 293;