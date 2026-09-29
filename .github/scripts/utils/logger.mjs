let missingSnbt = []

export function warnSnbt(itemId) {
    console.warn(`[WARN] (Parse) Missing item SNBT overlay: ${itemId}`);
    missingSnbt.push(itemId);
}



export function sendAnnotations() {
    console.log(`::warning:: ${missingSnbt.length} missing SNBT files.`)
}