let missingSnbt = [];
let abiphoneMissingOrWrongId = [];
let unknownAttributeId = [];
const duplicateIds = [];

export function warnSnbt(itemId) {
    console.warn(`[WARN] (Parse) Missing item SNBT overlay: ${itemId}`);
    missingSnbt.push(itemId);
}

export function warnNpcMatchedByName(npcId, abiphoneId) {
    console.warn(`[WARN] (Parse) Abiphone contact was matched by name and island - npc id:`, npcId, "abiphone id:", abiphoneId);
    abiphoneMissingOrWrongId.push(npcId);
}

export function warnAttributeShard(id) {
    console.warn(`[WARN] Attribute shard ${id} not found in neu/constants/attribute_shards.json`);
    unknownAttributeId.push(id);
}

export function warnDuplicateId(category, id, extra = "") {
    const detail = extra !== "" ? `${id} (${extra})` : `${id}`;
    console.warn(`[WARN] (${category}) Duplicate ID found: ${detail}`);
    duplicateIds.push({ category, id, extra });
}

export function sendAnnotations() {
    if (missingSnbt.length > 0 ) {
        console.log(`::warning:: ${missingSnbt.length} missing SNBT files.`);
    }
    if (abiphoneMissingOrWrongId.length > 0 ) {
        console.log(`::warning:: ${abiphoneMissingOrWrongId.length} abiphone contacts matched by island and name.`);
    }
    if (unknownAttributeId.length > 0) {
        console.log(`::error:: ${unknownAttributeId.length} unknown Attribute Shards`);
    }
    if (duplicateIds.length > 0) {
        console.log(`::warning:: ${duplicateIds.length} duplicate IDs detected: ${duplicateIds.map(d => `${d.category}:${d.id}`).join(", ")}`);
    }
}