import crypto from "crypto";
import {Recipes1214} from "./recipes1214.mjs";
import {Items1214} from "./items1214.mjs";
import {Pets1214} from "./pets1214.mjs";

export const Mc1214 = {
    recipes: Recipes1214,
    items: Items1214,
    pets: Pets1214,
    shas: () => {
        const itemsSha = crypto.createHash("sha1").update(Items1214.writeItems()).digest("hex");
        const petsSha = crypto.createHash("sha1").update(Pets1214.writePets()).digest("hex");
        const recipesSha = crypto.createHash("sha1").update(Recipes1214.write()).digest("hex");

        return {
            items: itemsSha,
            pets: petsSha,
            recipes: recipesSha,
        }
    }
}