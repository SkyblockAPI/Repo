import {petIds} from "../pets.mjs";
import {enchantmentIds} from "../enchantments.mjs";
import {attributeIds} from "../attributes.mjs";

export const BITS_ID = "SKYBLOCK_BIT";
export const COINS_ID = "SKYBLOCK_COIN";
export const COPPER_ID = "SKYBLOCK_COPPER";
export const FOSSIL_DUST_ID = "SKYBLOCK_FOSSIL_DUST";

export const BRONZE_MEDAL_ID = "SKYBLOCK_BRONZE_MEDAL";
export const SILVER_MEDAL_ID = "SKYBLOCK_SILVER_MEDAL";
export const GOLD_MEDAL_ID = "SKYBLOCK_GOLD_MEDAL";

export const MOTES_ID = "SKYBLOCK_MOTE";
export const NORTH_STARS_ID = "SKYBLOCK_NORTH_STAR";
export const PELTS_ID = "SKYBLOCK_PELT";
export const GEMS_ID = "SKYBLOCK_GEM";

export const CARNIVAL_POINT_ID = "SKYBLOCK_CARNIVAL_POINT";
export const ENIGMA_SOUL_ID = "SKYBLOCK_ENIGMA_SOUL";
export const PEST_ID = "SKYBLOCK_PEST";
export const FLY_ID = "SKYBLOCK_FLY";
export const SPIDER_ID = "SKYBLOCK_SPIDER";
export const SILVERFISH_ID = "SKYBLOCK_SILVERFISH";

// Currently not used by NEU but added just in case
export const FOREST_WHISPERS_ID = "SKYBLOCK_FOREST_WHISPERS"
export const GEMSTONE_POWDER_ID = "SKYBLOCK_POWDER_GEMSTONE"
export const GLACITE_POWDER_ID = "SKYBLOCK_POWDER_GLACITE"
export const MITHRIL_POWDER_ID = "SKYBLOCK_POWDER_MITHRIL"

const currencies = [
    BITS_ID, COINS_ID, COPPER_ID, FOSSIL_DUST_ID,
    BRONZE_MEDAL_ID, SILVER_MEDAL_ID, GOLD_MEDAL_ID,
    MOTES_ID, NORTH_STARS_ID, PELTS_ID, GEMS_ID,
    CARNIVAL_POINT_ID,
    ENIGMA_SOUL_ID, PEST_ID, FLY_ID, SPIDER_ID, SILVERFISH_ID,
    FOREST_WHISPERS_ID, GEMSTONE_POWDER_ID, GLACITE_POWDER_ID, MITHRIL_POWDER_ID
]

const rarityMap = {
    0: "COMMON",
    1: "UNCOMMON",
    2: "RARE",
    3: "EPIC",
    4: "LEGENDARY",
    5: "MYTHIC",
    6: "DIVINE",
    7: "ULTIMATE",
    8: "SPECIAL",
    9: "VERY_SPECIAL",
    10: "ADMIN",
}

/**
 * @param item {Item}
 * @param count {number}
 * */
export const getResult = (item, count) => {
    if (item.pet) {
        return {
            type: "pet",
            pet: item.pet.type,
            tier: item.pet.tier,
            count: count,
        };
    } else if (item.enchantment) {
        return {
            type: "enchantment",
            id: item.enchantment.id,
            level: item.enchantment.level,
            count: count
        }
    } else if (item.attribute) {
        return {
            type: "attribute",
            id: item.attribute.id,
            count: count
        }
    } else if (currencies.includes(item.internalname)) {
        return {
            type: "currency",
            currency: item.internalname.substring(9),
            count: count,
        }
    } else if (item.internalname.includes(";")) {
        throw new Error("Unsupported variant recipe " + item.internalname);
    }
    return {
        id: item.internalname,
        count: count
    };
}

export const getInputs = (item, amount) => {
    amount = parseInt(amount) || 1
    if (currencies.includes(item)) {
        return {
            type: "currency",
            currency: item.substring(9),
            count: amount,
        }
    } else if (item.includes(";")) {
        let [itemId, second] = item.split(";")
        second = parseInt(second)
        if (petIds.includes(itemId)) {
            return {
                type: "pet",
                pet: itemId,
                tier: rarityMap[second] || second,
                count: amount,
            }
        } else if (enchantmentIds.includes(itemId)) {
            return {
                type: "enchantment",
                id: itemId,
                level: second,
                count: amount,
            }
        } else if (attributeIds.includes(itemId)) {
            return {
                type: "attribute",
                id: itemId,
                count: amount,
            }
        }
    }

    return {
        id: item,
        count: amount,
    };
};