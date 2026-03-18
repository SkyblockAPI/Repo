import fs from "fs";

/**
 * @type {Object.<number, string>}
 */
const potionTypeMappings = {
    0: "water",
    1: "regeneration",
    2: "swiftness",
    3: "fire_resistance",
    4: "poison",
    5: "healing",
    6: "night_vision",
    8: "weakness",
    9: "strength",
    10: "slowness",
    11: "leaping",
    12: "harming",
    13: "water_breathing",
    14: "invisibility",
    16: "awkward",
    17: "regeneration",
    18: "swiftness",
    19: "fire_resistance",
    20: "poison",
    21: "healing",
    22: "night_vision",
    24: "weakness",
    25: "strength",
    26: "slowness",
    27: "leaping",
    28: "harming",
    29: "water_breathing",
    30: "invisibility",
    32: "thick",
    33: "strong_regeneration",
    34: "strong_swiftness",
    35: "fire_resistance",
    36: "strong_poison",
    37: "strong_healing",
    38: "night_vision",
    40: "weakness",
    41: "strong_strength",
    42: "slowness",
    43: "strong_leaping",
    44: "strong_harming",
    45: "water_breathing",
    46: "invisibility",
    49: "strong_regeneration",
    50: "strong_swiftness",
    51: "fire_resistance",
    52: "strong_poison",
    53: "strong_healing",
    54: "night_vision",
    56: "weakness",
    57: "strong_strength",
    58: "slowness",
    59: "strong_leaping",
    60: "strong_harming",
    61: "water_breathing",
    62: "invisibility",
    64: "mundane",
    65: "long_regeneration",
    66: "long_swiftness",
    67: "long_fire_resistance",
    68: "long_poison",
    69: "healing",
    70: "long_night_vision",
    72: "long_weakness",
    73: "long_strength",
    74: "long_slowness",
    75: "long_leaping",
    76: "harming",
    77: "long_water_breathing",
    78: "long_invisibility",
    80: "awkward",
    81: "long_regeneration",
    82: "long_swiftness",
    83: "long_fire_resistance",
    84: "long_poison",
    85: "healing",
    86: "long_night_vision",
    88: "long_weakness",
    89: "long_strength",
    90: "long_slowness",
    91: "long_leaping",
    92: "harming",
    93: "long_water_breathing",
    94: "long_invisibility",
    96: "thick",
    97: "regeneration",
    98: "swiftness",
    99: "long_fire_resistance",
    100: "poison",
    101: "strong_healing",
    102: "long_night_vision",
    104: "long_weakness",
    105: "strength",
    106: "long_slowness",
    107: "leaping",
    108: "strong_harming",
    109: "long_water_breathing",
    110: "long_invisibility",
    113: "regeneration",
    114: "swiftness",
    115: "long_fire_resistance",
    116: "poison",
    117: "strong_healing",
    118: "long_night_vision",
    120: "long_weakness",
    121: "strength",
    122: "long_slowness",
    123: "leaping",
    124: "strong_harming",
    125: "long_water_breathing",
    126: "long_invisibility",
}

const potionFile = {};
export const potionIds = []

export const Potions = {
    /** @param item {Item} */
    parsePotions: (item) => {
        const originalItem = item
        item = structuredClone(item)

        const parts = item.internalname.split(";");
        const potionId = parts[0];
        const potionLevel = parseInt(parts[1]);
        originalItem.potion = {
            id: potionId,
            level: potionLevel
        }

        let meta = item.damage ?? 0

        item.lore.shift()


        potionIds.push(potionId)
        const potion = potionFile[potionId] || {
            levels: [],
            internal_name: item.nbt.ExtraAttributes.potion_name || undefined,
            type: item.nbt.ExtraAttributes.potion_type || undefined,
            internal_potion: item.nbt.ExtraAttributes.potion || undefined,
            name: item.displayname.replaceAll(/^(.*) [IV]{1,4}(?: Splash)?(?: Potion)?.*?$/g, "$1").replace(/§[0-9a-f]/ig, ""),
            vanilla_effect: potionTypeMappings[meta & 127] || "water",
        }

        potion.levels.push({
            level: potionLevel || undefined,
            literal_level: item.displayname.replaceAll(/^.*?([IV]{1,4}).*?$/g, "$1"),
            lore: item.lore,
            splash: (meta & 16348) === 16348 ? true : undefined,
        })

        potionFile[potionId] = potion
    },
    writePotions: (path) => {
        fs.writeFileSync(`cloudflare/${path}/potions.min.json`, JSON.stringify(potionFile));
        fs.writeFileSync(`data/${path}/potions.json`, JSON.stringify(potionFile, null, 2));

        return JSON.stringify(potionFile);
    }
}