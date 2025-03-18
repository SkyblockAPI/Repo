import fs from "fs";
import crypto from "crypto";
import {decode} from "../utils/snbt.mjs";
import {Items} from "./items.mjs";
import {Pets} from "./pets.mjs";
import {Recipes} from "./recipes.mjs";

const isBadFile = (file) => {
    if (file.endsWith("_NPC.json")) return true;
    if (file.endsWith("_MONSTER.json")) return true;
    if (file.endsWith("_MINIBOSS.json")) return true;
    if (file.endsWith("_BOSS.json")) return true;
    if (file.endsWith("_SC.json")) return true;
    return !file.endsWith(".json");
}

for (let file of fs.readdirSync("neu/items")) {
    if (isBadFile(file)) continue;

    const data = JSON.parse(fs.readFileSync(`./neu/items/${file}`, "utf-8"));
    data.nbt = decode(data.nbttag);

    const attributes = data.nbt.ExtraAttributes;

    if (attributes.hasOwnProperty("petInfo")) {
        data.pet = JSON.parse(attributes.petInfo.replaceAll("\\\"", "\""));
        Pets.parsePet(data);
    } else if (data.internalname.includes(";")) {
        // console.log(file + " is a variant");
        continue;
    } else {
        Items.parseItem(data);
    }

    Recipes.parse(data);
}

const itemsSha = crypto.createHash("sha1").update(Items.writeItems()).digest("hex");
const petsSha = crypto.createHash("sha1").update(Pets.writePets()).digest("hex");
const recipesSha = crypto.createHash("sha1").update(Recipes.write()).digest("hex");

fs.writeFileSync("cloudflare/shas.json", JSON.stringify({
    items: itemsSha,
    pets: petsSha,
    recipes: recipesSha,
}, null, 4));
