import { CHEMICAL_PROPERTIES, MOLECULAR_PROPERTIES, ELEMENTAL_PROPERTIES, REACTIONS } from "./globals.js";

export function getChemicalProperties(type) {
    return CHEMICAL_PROPERTIES[type];
}

export function getMolecularProperties(type) {
    return MOLECULAR_PROPERTIES[type];
}

export function getElementalProperties(type) {
    return ELEMENTAL_PROPERTIES[type];
}

export function getTemp(type, heat) {
    const particle = getChemicalProperties(type);
    return Math.floor(heat / particle.shc);
}

export function getNature(type) {
    const properties = getChemicalProperties(type);
    return properties.nature;
}

export function getState(type, heat) {
    const nature = getNature(type);
    const temp = getTemp(type, heat);
    
    if (nature === 'atom') {
        return 'gas';
    } 
    
    if (nature === 'molecule') {
        const molProps = getMolecularProperties(type);
        const mp = molProps.mp;
        const bp = molProps.bp;
        
        if (temp <= mp) return 'solid';
        if (temp <= bp) return 'liquid';
        return 'gas';
    }
    
    if (nature === 'special') return 'solid';
    console.warn(`Unrecognized particle nature: ${nature} for type: ${type}`);
    return 'gas';
}

export function getMass(type) {
    const nature = getNature(type);
    if (nature === 'atom') return getElementalProperties(type).mass;
    else if (nature === 'molecule') {
        const props = getMolecularProperties(type);
        let mass = 0;
        props.composition.forEach(element => {
            mass += getMass(element);
        });
        return mass;
    }
}

export function getDensity(type, heat) {
    const mass = getMass(type);
    
    const state = getState(type, heat);
    
    let modifier;

    switch (state) {
        case 'gas':
            modifier = CHEMICAL_PROPERTIES[type].gas_density;
            break;
        case 'liquid':
            modifier = CHEMICAL_PROPERTIES[type].liquid_density;
            break;
        case 'solid':
            modifier = CHEMICAL_PROPERTIES[type].solid_density;
            break;
        default:
            console.log("THIS SHOULD BE UNREACHABLE");
    }

    return Math.floor(mass * modifier);
}

export function tryReaction(availableMolecules) {
    const shuffledReactions = [...REACTIONS].sort(() => Math.random() - 0.5);

    for (let reaction of shuffledReactions) {
        const totalHeat = availableMolecules.reduce((sum, m) => sum + m.heat, 0);
        const totalSHC = availableMolecules.reduce((sum, m) => sum + (CHEMICAL_PROPERTIES[m.type]?.shc || 1), 0);
        const avgTemp = Math.floor(totalHeat / totalSHC);

        if (avgTemp < reaction.minTemp) continue;

        let reactantCounts = {};
        reaction.reactants.forEach(r => reactantCounts[r] = (reactantCounts[r] || 0) + 1);

        let matchingMolecules = [];
        let clearToReact = true;

        for (let type in reactantCounts) {
            let found = availableMolecules.filter(m => m.type === type);
            if (found.length < reactantCounts[type]) {
                clearToReact = false;
                break;
            }
            matchingMolecules.push(...found.slice(0, reactantCounts[type]));
        }

        if (clearToReact) {
            return {
                reaction: reaction,
                participants: matchingMolecules
            };
        }
    }
    return null;
}

export function diffuseHeat(cell1, cell2, rate = 0.2) {
    // rate (0.0 to 1.0) controls how fast heat moves. 0.2 means 20% equalizer per frame.
    const shc1 = CHEMICAL_PROPERTIES[cell1.type]?.shc || 1;
    const shc2 = CHEMICAL_PROPERTIES[cell2.type]?.shc || 1;

    const temp1 = cell1.heat / shc1;
    const temp2 = cell2.heat / shc2;

    // If temperatures are practically the same, don't do anything
    if (Math.abs(temp1 - temp2) < 0.1) return;

    // Calculate the target equilibrium temperature
    // Total Heat / Total Capacity = Final Temperature
    const equilibriumTemp = (cell1.heat + cell2.heat) / (shc1 + shc2);

    // Calculate how much heat cell1 needs to lose/gain to reach equilibrium
    const targetHeat1 = equilibriumTemp * shc1;
    const heatDelta = (targetHeat1 - cell1.heat) * rate;

    // Transfer the heat chunk safely
    cell1.heat += heatDelta;
    cell2.heat -= heatDelta;
}

export function getDynamicColor(baseHex, type, heat) {
    if (type === 'barrier' || type === 'eraser' || type === 'heat_finger') return baseHex;

    const temp = getTemp(type, heat);
    
    let r = parseInt(baseHex.substring(1, 3), 16);
    let g = parseInt(baseHex.substring(3, 5), 16);
    let b = parseInt(baseHex.substring(5, 7), 16);

    const variation = (Math.sin(heat * 0.08) * 10);
    r = Math.min(255, Math.max(0, r + variation));
    g = Math.min(255, Math.max(0, g + variation));
    b = Math.min(255, Math.max(0, b + variation));

    if (temp > 600) {
        let emitR = 255;
        let emitG = 65;
        let emitB = 0;

        const chem = CHEMICAL_PROPERTIES[type];
        
        if (chem) {
            if (chem.nature === 'atom' && chem.emission) {
                emitR = chem.emission.r;
                emitG = chem.emission.g;
                emitB = chem.emission.b;
            } else if (chem.nature === 'molecule') {
                const mol = MOLECULAR_PROPERTIES[type];
                if (mol && mol.composition) {
                    let sourceAtom = mol.composition.find(atom => CHEMICAL_PROPERTIES[atom]?.emission);
                    if (sourceAtom) {
                        const targetEmission = CHEMICAL_PROPERTIES[sourceAtom].emission;
                        emitR = targetEmission.r;
                        emitG = targetEmission.g;
                        emitB = targetEmission.b;
                    }
                }
            }
        }

        let blendFactor = Math.min(1, (temp - 600) / 400); // Maxes fully out at 1000°K
        r = Math.floor(r * (1 - blendFactor) + emitR * blendFactor);
        g = Math.floor(g * (1 - blendFactor) + emitG * blendFactor);
        b = Math.floor(b * (1 - blendFactor) + emitB * blendFactor);

        if (temp > 1000) {
            let whiteHotFactor = Math.min(1, (temp - 1000) / 500); // Scales up to 1500°K
            r = Math.floor(r * (1 - whiteHotFactor) + 255 * whiteHotFactor);
            g = Math.floor(g * (1 - whiteHotFactor) + 230 * whiteHotFactor);
            b = Math.floor(b * (1 - whiteHotFactor) + 200 * whiteHotFactor);
        }
    }

    return `rgb(${Math.min(255, Math.max(0, r))}, ${Math.min(255, Math.max(0, g))}, ${Math.min(255, Math.max(0, b))})`;
}