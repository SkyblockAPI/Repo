import fs from "fs";
import {COINS_ID, getInputs, getResult} from "./recipes/ingredients.mjs";

const craftingRecipesKeys = ["A1", "A2", "A3", "B1", "B2", "B3", "C1", "C2", "C3"]
const notRecipes = ["trade", "drops"];

const recipesFile = [];

const parseCraftingRecipe = (item, recipe) => {
    const pattern = craftingRecipesKeys.map(it => recipe[it]);

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

const parseKatRecipe = (recipe) => {
    return {
        type: "kat",
        input: getInputs(recipe.input, 1),
        output: getInputs(recipe.output, 1),
        items: recipe.items.map(key => key.split(":")).map(([id, amount]) => getInputs(id, parseInt(amount))),
        time: recipe.time,
        coins: recipe.coins,
    }
}

export const Recipes = {
    /** @param item {Item} */
    parse: (item) => {
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
                } else if (recipe.type === "katgrade") {
                    recipesFile.push(parseKatRecipe(recipe))
                } else if (!recipe.type && craftingRecipesKeys.filter(it => Object.hasOwn(recipe, it)).length === 9) {
                    recipesFile.push(parseCraftingRecipe(item, recipe));
                } else {
                    console.log("Recipe has unknown type:", item.internalname, recipe);
                }
            }
        }
    },
    write: (path) => {
        fs.writeFileSync(`cloudflare/${path}/recipes.min.json`, JSON.stringify(recipesFile));
        fs.writeFileSync(`data/${path}/recipes.json`, JSON.stringify(recipesFile, null, 2));

        return JSON.stringify(recipesFile);
    }
}
