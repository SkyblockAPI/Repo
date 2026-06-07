import fs from "fs";
import crypto from "crypto";
import {Recipes} from "./recipes.mjs";
import {Items} from "./items.mjs";
import {Pets} from "./pets.mjs";
import {Mobs} from "./mobs.mjs";
import {Runes} from "./runes.mjs";
import {Enchantments} from "./enchantments.mjs";
import {Potions} from "./potions.mjs";
import {Attributes} from "./attributes.mjs";

export const Mc1215 = {
    items: Items,
    pets: Pets,
    recipes: Recipes,
    mobs: Mobs,
    runes: Runes,
    enchantments: Enchantments,
    potions: Potions,
    attributes: Attributes,

    shas: () => {
        const path = "1_21_5";
        const {items, itemOverlays} = Mc1215.items.writeItems(path);
        const {pets, petOverlays} = Mc1215.pets.writePets(path);
        const {mobs, mobOverlays} = Mc1215.mobs.writeMobs(path);
        const {runes, runeOverlays} = Mc1215.runes.writeRunes(path);
        const {enchantments, enchantmentOverlays} = Mc1215.enchantments.writeEnchantments(path);
        const {potions, potionOverlays} = Mc1215.potions.writePotions(path);
        const {attributes, attributeOverlays} = Mc1215.attributes.writeAttributes(path);
        const itemsSha = crypto.createHash("sha1").update(items).digest("hex");
        const petsSha = crypto.createHash("sha1").update(pets).digest("hex");
        const recipesSha = crypto.createHash("sha1").update(Mc1215.recipes.write(path)).digest("hex");
        const mobsSha = crypto.createHash("sha1").update(mobs).digest("hex");
        const runesSha = crypto.createHash("sha1").update(runes).digest("hex");
        const enchantmentsSha = crypto.createHash("sha1").update(enchantments).digest("hex");
        const potionsSha = crypto.createHash("sha1").update(potions).digest("hex");
        const attributeSha = crypto.createHash("sha1").update(attributes).digest("hex");

        const overlays = itemOverlays.concat(petOverlays, mobOverlays, runeOverlays, enchantmentOverlays, potionOverlays, attributeOverlays);
        fs.writeFileSync(`cloudflare/${path}/id_overlays.min.json`, JSON.stringify(overlays));
        fs.writeFileSync(`data/${path}/id_overlays.json`, JSON.stringify(overlays, null, 2));
        const idOverlays = crypto.createHash("sha1").update(JSON.stringify(overlays)).digest("hex");

        return {
            items: itemsSha,
            id_overlays: idOverlays,
            pets: petsSha,
            recipes: recipesSha,
            mobs: mobsSha,
            runes: runesSha,
            enchantments: enchantmentsSha,
            potions: potionsSha,
            attributes: attributeSha,
        }
    }
}