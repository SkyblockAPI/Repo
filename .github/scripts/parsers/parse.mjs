import fs from "fs";
import {decode} from "../utils/snbt.mjs";
import {Mc1214} from "./1_21_4/1214.mjs";
import {Mc1215} from "./1_21_5/1215.mjs";
import {Items1214} from "./1_21_4/items1214.mjs";
import {Items1215} from "./1_21_5/items1215.mjs";
import {Pets1214} from "./1_21_4/pets1214.mjs";
import {Recipes1214} from "./1_21_4/recipes1214.mjs";
import {Mobs1214} from "./1_21_4/mobs1214.mjs";
import {clone} from "./copier.mjs";
import {Runes1214} from "./1_21_4/runes1214.mjs";

const isEntity = (file) => {
    if (file.endsWith("_NPC.json")) return true;
    if (file.endsWith("_MONSTER.json")) return true;
    if (file.endsWith("_MINIBOSS.json")) return true;
    if (file.endsWith("_BOSS.json")) return true;
    if (file.endsWith("_SC.json")) return true;
    return false;
}

for (let file of fs.readdirSync("neu/items")) {
    const data = JSON.parse(fs.readFileSync(`./neu/items/${file}`, "utf-8"));
    data.nbt = decode(data.nbttag);

    const attributes = data.nbt.ExtraAttributes;

    if (isEntity(file)) {
        Mobs1214.parseMob(data);
    } else {
        if (attributes.hasOwnProperty("runes")) {
            Runes1214.parseRune(data);
        } else if (attributes.hasOwnProperty("petInfo")) {
            data.pet = JSON.parse(attributes.petInfo.replaceAll("\\\"", "\""));
            Pets1214.parsePet(data);
        } else if (data.displayname == "§fEnchanted Book") {
            Items1214.parseItem(data);
            Items1215.parseItem(data);
        } else if (data.internalname.includes(";")) {
            // console.log(file + " is a variant");
            continue;
        } else {
            Items1214.parseItem(data);
            Items1215.parseItem(data);
        }

        Recipes1214.parse(data);
    }
}

fs.writeFileSync("cloudflare/shas.json", JSON.stringify({
    "1_21_4": Mc1214.shas(),
    "1_21_5": Mc1215.shas(),
    ... clone(),
}, null, 4));
