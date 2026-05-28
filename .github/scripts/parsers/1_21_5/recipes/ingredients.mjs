import {petIds} from "../pets.mjs";
import {enchantmentIds} from "../enchantments.mjs";
import {attributeIds} from "../attributes.mjs";
import {potionIds} from "../potions.mjs";
import {runeIds} from "../runes.mjs";

export const BITS_ID = "SKYBLOCK_BIT";
export const COINS_ID = "SKYBLOCK_COIN";
export const COPPER_ID = "SKYBLOCK_COPPER";
export const FOSSIL_DUST_ID = "SKYBLOCK_FOSSIL_DUST";
export const FOSSIL_DUST_ID_2 = "ESSENCE_FOSSIL";
export const KERNEL_ID = "SKYBLOCK_KERNEL";
export const BINGO_POINT = "SKYBLOCK_BINGO_POINT";

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

const currencies = {
    [BITS_ID]: BITS_ID.substring(9),
    [COINS_ID]: COINS_ID.substring(9),
    [COPPER_ID]: COPPER_ID.substring(9),
    [FOSSIL_DUST_ID]: FOSSIL_DUST_ID.substring(9),
    [FOSSIL_DUST_ID_2]: FOSSIL_DUST_ID.substring(9),
    [KERNEL_ID]: KERNEL_ID.substring(9),
    [BINGO_POINT]: BINGO_POINT.substring(9),
    [BRONZE_MEDAL_ID]: BRONZE_MEDAL_ID.substring(9),
    [SILVER_MEDAL_ID]: SILVER_MEDAL_ID.substring(9),
    [GOLD_MEDAL_ID]: GOLD_MEDAL_ID.substring(9),
    [MOTES_ID]: MOTES_ID.substring(9),
    [NORTH_STARS_ID]: NORTH_STARS_ID.substring(9),
    [PELTS_ID]: PELTS_ID.substring(9),
    [GEMS_ID]: GEMS_ID.substring(9),
    [CARNIVAL_POINT_ID]: CARNIVAL_POINT_ID.substring(9),
    [ENIGMA_SOUL_ID]: ENIGMA_SOUL_ID.substring(9),
    [PEST_ID]: PEST_ID.substring(9),
    [FLY_ID]: FLY_ID.substring(9),
    [SPIDER_ID]: SPIDER_ID.substring(9),
    [SILVERFISH_ID]: SILVERFISH_ID.substring(9),
    [FOREST_WHISPERS_ID]: FOREST_WHISPERS_ID.substring(9),
    [GEMSTONE_POWDER_ID]: GEMSTONE_POWDER_ID.substring(9),
    [GLACITE_POWDER_ID]: GLACITE_POWDER_ID.substring(9),
    [MITHRIL_POWDER_ID]: MITHRIL_POWDER_ID.substring(9),
}

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
    } else if (Object.keys(currencies).includes(item.internalname)) {
        return {
            type: "currency",
            currency: currencies[item.internalname],
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
    if (Object.keys(currencies).includes(item)) {
        return {
            type: "currency",
            currency: currencies[item],
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
        } else if (attributeIds.includes(itemId.replace("ATTRIBUTE_SHARD_", ""))) {
            return {
                type: "attribute",
                id: itemId.replace("ATTRIBUTE_SHARD_", ""),
                count: amount,
            }
        } else if (potionIds.includes(itemId)) {
            return {
                type: "potion",
                id: itemId,
                level: second,
                count: amount
            }
        } else if (runeIds.includes(itemId.replace("_RUNE", ""))) {
            return {
                type: "rune",
                id: itemId.replace("_RUNE", ""),
                tier: second,
                count: amount
            }
        }
    }

    return {
        id: item,
        count: amount,
    };
};
