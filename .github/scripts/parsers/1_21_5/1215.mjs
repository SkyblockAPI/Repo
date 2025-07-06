import crypto from "crypto";
import {Items} from "./items.mjs";
import {Mc1214} from "../1_21_4/1214.mjs";

export const Mc1215 = {
    items: Items,
    pets: Mc1214.pets,
    recipes: Mc1214.recipes,
    mobs: Mc1214.mobs,
    runes: Mc1214.runes,
    enchantments: Mc1214.enchantments,
    attributes: Mc1214.attributes,

    shas: () => {
        const path = "1_21_5";
        const itemsSha = crypto.createHash("sha1").update(Mc1215.items.writeItems(path)).digest("hex");
        const petsSha = crypto.createHash("sha1").update(Mc1215.pets.writePets(path)).digest("hex");
        const recipesSha = crypto.createHash("sha1").update(Mc1215.recipes.write(path)).digest("hex");
        const mobsSha = crypto.createHash("sha1").update(Mc1215.mobs.writeMobs(path)).digest("hex");
        const runesSha = crypto.createHash("sha1").update(Mc1215.runes.writeRunes(path)).digest("hex");
        const enchantmentsSha = crypto.createHash("sha1").update(Mc1215.enchantments.writeEnchantments(path)).digest("hex");
        const attributeSha = crypto.createHash("sha1").update(Mc1215.attributes.writeAttributes(path)).digest("hex");

        return {
            items: itemsSha,
            pets: petsSha,
            recipes: recipesSha,
            mobs: mobsSha,
            runes: runesSha,
            enchantments: enchantmentsSha,
            attributes: attributeSha,
        }
    }
}