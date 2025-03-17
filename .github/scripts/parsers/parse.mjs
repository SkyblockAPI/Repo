import fs from "fs";
import crypto from "crypto";
import {decode} from "../utils/snbt.mjs";
import {Items} from "./items.mjs";
import {Pets} from "./pets.mjs";

for (let file of fs.readdirSync("neu/items")) {
    if (!file.endsWith(".json")) continue;
    if (file.endsWith("_NPC.json") || file.endsWith("_MONSTER.json") || file.endsWith("_MINIBOSS") || file.endsWith("_BOSS")) continue;

    const data = JSON.parse(fs.readFileSync(`./neu/items/${file}`, "utf-8"));
    data.nbt = decode(data.nbttag);

    const attributes = data.nbt.ExtraAttributes;

    if (attributes.hasOwnProperty("petInfo")) {
        data.pet = JSON.parse(attributes.petInfo.replaceAll("\\\"", "\""));
        Pets.parsePet(data);
    } else if (data.internalname.includes(";")) {
        // console.log(file + " is a variant");
    } else {
        Items.parseItem(data);
    }
}

const itemsSha = crypto.createHash("sha1").update(Items.writeItems()).digest("hex");
const petsSha = crypto.createHash("sha1").update(Pets.writePets()).digest("hex");

fs.writeFileSync("cloudflare/shas.json", JSON.stringify({
    items: itemsSha,
    pets: petsSha
}, null, 4));
