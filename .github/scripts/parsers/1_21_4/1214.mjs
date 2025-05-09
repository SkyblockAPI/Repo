import crypto from "crypto";
import {Recipes1214} from "./recipes1214.mjs";
import {Items1214} from "./items1214.mjs";
import {Pets1214} from "./pets1214.mjs";
import {Mobs1214} from "./mobs1214.mjs";
import {Runes1214} from "./runes1214.mjs";

export const Mc1214 = {
    shas: () => {
        const path = "1_21_4";
        const itemsSha = crypto.createHash("sha1").update(Items1214.writeItems(path)).digest("hex");
        const petsSha = crypto.createHash("sha1").update(Pets1214.writePets(path)).digest("hex");
        const recipesSha = crypto.createHash("sha1").update(Recipes1214.write(path)).digest("hex");
        const mobsSha = crypto.createHash("sha1").update(Mobs1214.writeMobs(path)).digest("hex");
        const runesSha = crypto.createHash("sha1").update(Runes1214.writeRunes(path)).digest("hex");

        return {
            items: itemsSha,
            pets: petsSha,
            recipes: recipesSha,
            mobs: mobsSha,
            runes: runesSha,
        }
    }
}