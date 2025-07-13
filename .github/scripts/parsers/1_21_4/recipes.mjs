import fs from "fs";
import { petIds, Pets } from "./pets.mjs";
import { enchantmentIds } from "./enchantments.mjs";
import { attributeIds } from "./attributes.mjs";

const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"))
const notRecipes = ["katgrade", "trade", "drops"];

const BITS_ID = "SKYBLOCK_BIT";
const COINS_ID = "SKYBLOCK_COIN";
const COPPER_ID = "SKYBLOCK_COPPER";
const FOSSIL_DUST_ID = "SKYBLOCK_FOSSIL_DUST";

const BRONZE_MEDAL_ID = "SKYBLOCK_BRONZE_MEDAL";
const SILVER_MEDAL_ID = "SKYBLOCK_SILVER_MEDAL";
const GOLD_MEDAL_ID = "SKYBLOCK_GOLD_MEDAL";

const MOTES_ID = "SKYBLOCK_MOTE";
const NORTH_STARS_ID = "SKYBLOCK_NORTH_STAR";
const PELTS_ID = "SKYBLOCK_PELT";
const GEMS_ID = "SKYBLOCK_GEM";

const currencies = [BITS_ID, COINS_ID, COPPER_ID, FOSSIL_DUST_ID, BRONZE_MEDAL_ID, SILVER_MEDAL_ID, GOLD_MEDAL_ID, MOTES_ID, NORTH_STARS_ID, PELTS_ID, GEMS_ID]

const recipesFile = [];

const getResult = (item, count) => {
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

const getInputs = (item, amount) => {
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
    }
}

const parseCraftingRecipe = (item, recipe) => {
    const pattern = [
        recipe["A1"], recipe["A2"], recipe["A3"],
        recipe["B1"], recipe["B2"], recipe["B3"],
        recipe["C1"], recipe["C2"], recipe["C3"]
    ];

    let keys = new Set(pattern);
    keys.delete("");
    keys = [...keys];

    return {
        type: "crafting",
        keys: keys
            .map(key => key.split(":"))
            .map(([id, amount]) => ({ id, count: amount ? parseInt(amount) : 1 })),
        pattern: pattern
            .map(key => {
                if (key === "") return -1;
                const index = keys.indexOf(key);
                if (index === -1) throw new Error(`Unknown key: ${key}`);
                return index;
            }),
        result: getResult(item, recipe.count || 1),
    };
}

const parseForgeRecipe = (item, recipe) => {
    if (recipe.overrideOutputId && item.internalname !== recipe.overrideOutputId) {
        return console.error("Unsupported forge recipe", item.internalname, recipe.overrideOutputId);
    }

    const inputs = recipe.inputs.map(key => key.split(":"))
        .map(([id, amount]) => ({ id, count: amount ? parseInt(amount) : 1 }));
    const coins = inputs.filter(it => it.id === COINS_ID)
        .reduce((acc, it) => acc + it.count, 0);

    return {
        type: "forge",
        inputs: inputs.filter(it => it.id !== COINS_ID),
        coins: coins,
        time: recipe.duration ?? 0,
        result: getResult(item, recipe.count || 1),
    }
}

const parseNpcRecipe = (recipe) => {
    const [outputId, outputAmount] = recipe.result.split(":")

    return {
        type: "shop",
        inputs: recipe.cost.map(key => key.split(":")).map(([id, amount]) => getInputs(id, parseInt(amount))),
        result: getInputs(outputId, parseInt(outputAmount))
    }
}

export const Recipes = {
    /** @param item {Item} */
    parse: (item) => {
        if (specialItems.items.includes(item.internalname)) return;
        if (item.recipe) {
            // Legacy recipes
            recipesFile.push(parseCraftingRecipe(item, item.recipe));
        } else if (item.recipes) {
            const recipes = item.recipes.filter(it => !notRecipes.includes(it.type));
            if (recipes.length === 0) return;

            for (let recipe of recipes) {
                if (recipe.type === "crafting") {
                    recipesFile.push(parseCraftingRecipe(item, recipe));
                } else if (recipe.type === "forge") {
                    recipesFile.push(parseForgeRecipe(item, recipe));
                } else if (recipe.type === "npc_shop") {
                    recipesFile.push(parseNpcRecipe(recipe));
                } else {
                    console.log(item.internalname, recipe.type);
                }
            }
        }
    },
    write: (path) => {
        fs.writeFileSync(`cloudflare/${path}/recipes.min.json`, JSON.stringify(recipesFile));

        return JSON.stringify(recipesFile);
    }
}