import { petIds, Pets } from "../pets.mjs";
import { enchantmentIds } from "../enchantments.mjs";
import { attributeIds } from "../attributes.mjs";

export const getResult = (item, count) => {
    if (item.pet) {
        return {
            type: "pet",
            pet: item.pet.type,
            tier: item.pet.tier,
            count: count,
        };
    } else if (item.isEnchantment) {
        return {
            type: "enchantment",
            id: item.enchantId,
            level: item.enchantLevel,
            count: count
        }
    } else if (item.isAttributeShard) {
        return {
            type: "attribute",
            id: item.attributeId,
            count: count
        }
    } else if (item.internalname.includes(";")) {
        throw new Error("Unsupported variant recipe " + item.internalname);
    }
    return {
        id: item.internalname,
        count: count
    };
}

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

const currencies = [BITS_ID, COINS_ID, COPPER_ID, FOSSIL_DUST_ID, BRONZE_MEDAL_ID, SILVER_MEDAL_ID, GOLD_MEDAL_ID, MOTES_ID, NORTH_STARS_ID, PELTS_ID, GEMS_ID]

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
                tier: second,
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