import fs from "fs";
import {getResult,getInputs} from "./recipes/ingredients.mjs";

const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"))
const notRecipes = ["katgrade", "trade", "drops"];

const recipesFile = [];

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