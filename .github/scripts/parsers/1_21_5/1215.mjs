import crypto from "crypto";
import {Recipes1214} from "../1_21_4/recipes1214.mjs";
import {Pets1214} from "../1_21_4/pets1214.mjs";
import {Items1215} from "./items1215.mjs";
import {Mobs1214} from "../1_21_4/mobs1214.mjs";
import {Runes1214} from "../1_21_4/runes1214.mjs";

export const Mc1215 = {
    shas: () => {
        const path = "1_21_5";
        const itemsSha = crypto.createHash("sha1").update(Items1215.writeItems(path)).digest("hex");
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