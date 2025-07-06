import crypto from "crypto";
import {Recipes} from "./recipes.mjs";
import {Items} from "./items.mjs";
import {Pets} from "./pets.mjs";
import {Mobs} from "./mobs.mjs";
import {Runes} from "./runes.mjs";
import {Enchantments} from "./enchantments.mjs";

export const Mc1214 = {

    items: Items,
    enchantments: Enchantments,
    pets: Pets,
    recipes: Recipes,
    mobs: Mobs,
    runes: Runes,

    shas: () => {
        const path = "1_21_4";
        const itemsSha = crypto.createHash("sha1").update(Mc1214.items.writeItems(path)).digest("hex");
        const petsSha = crypto.createHash("sha1").update(Mc1214.pets.writePets(path)).digest("hex");
        const recipesSha = crypto.createHash("sha1").update(Mc1214.recipes.write(path)).digest("hex");
        const mobsSha = crypto.createHash("sha1").update(Mc1214.mobs.writeMobs(path)).digest("hex");
        const runesSha = crypto.createHash("sha1").update(Mc1214.runes.writeRunes(path)).digest("hex");
        const enchantmentsSha = crypto.createHash("sha1").update(Mc1214.enchantments.writeEnchantments(path)).digest("hex");

        return {
            items: itemsSha,
            pets: petsSha,
            recipes: recipesSha,
            mobs: mobsSha,
            runes: runesSha,
            enchantments: enchantmentsSha
        }
    }
}