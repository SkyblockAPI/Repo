
const variableRegex = /\{([A-Z0-9_]+)}/g;

/**
 * Returns missing and unused pet variables in a pet tier.
 * @returns {{
 * missing: string[],
 * unused: string[]
 * }}
 */
export const checkPetVariables = (tier) => {
    const lore = tier.lore.join("\n");
    const availableVariables = new Set(Object.keys(tier.variables));
    const unusedVariables = new Set(availableVariables);
    const missingVariables = [];
    for (let match of lore.matchAll(variableRegex)) {
        const variable = match[1];
        unusedVariables.delete(variable);
        if (!availableVariables.has(variable)) {
            missingVariables.push(variable);
        }
    }
    return {
        missing: missingVariables,
        unused: [...unusedVariables],
    };
}

