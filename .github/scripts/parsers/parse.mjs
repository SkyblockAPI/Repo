import fs from "fs";
import crypto from "crypto";
import {decode} from "../utils/snbt.mjs";
import {Mc1214} from "./1_21_4/1214.mjs";
import {Mc1215} from "./1_21_5/1215.mjs";
import {Items1214} from "./1_21_4/items1214.mjs";
import {Items1215} from "./1_21_5/items1215.mjs";
import {Pets1214} from "./1_21_4/pets1214.mjs";
import {Recipes1214} from "./1_21_4/recipes1214.mjs";

const isBadFile = (file) => {
    if (file.endsWith("_NPC.json")) return true;
    if (file.endsWith("_MONSTER.json")) return true;
    if (file.endsWith("_MINIBOSS.json")) return true;
    if (file.endsWith("_BOSS.json")) return true;
    if (file.endsWith("_SC.json")) return true;
    return !file.endsWith(".json");
}

const minify = (id) => {
    const data = JSON.stringify(JSON.parse(fs.readFileSync(`${id}.json`, "utf-8")));
    fs.writeFileSync(`cloudflare/${id}.min.json`, data);
    return data;
}

for (let file of fs.readdirSync("neu/items")) {
    if (isBadFile(file)) continue;

    const data = JSON.parse(fs.readFileSync(`./neu/items/${file}`, "utf-8"));
    data.nbt = decode(data.nbttag);

    const attributes = data.nbt.ExtraAttributes;

    if (attributes.hasOwnProperty("petInfo")) {
        data.pet = JSON.parse(attributes.petInfo.replaceAll("\\\"", "\""));
        Pets1214.parsePet(data);
    } else if (data.internalname.includes(";")) {
        // console.log(file + " is a variant");
        continue;
    } else {
        Items1214.parseItem(data);
        Items1215.parseItem(data);
    }

    Recipes1214.parse(data);
}

const constantsSha = crypto.createHash("sha1").update(minify("constants")).digest("hex");

fs.writeFileSync("cloudflare/shas.json", JSON.stringify({
    "1_21_4": Mc1214.shas(),
    "1_21_5": Mc1215.shas(),
    constants: constantsSha,
}, null, 4));
