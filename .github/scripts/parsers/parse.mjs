import fs from "fs";
import {decode} from "../utils/snbt.mjs";
import {Mc1214} from "./1_21_4/1214.mjs";
import {Mc1215} from "./1_21_5/1215.mjs";
import {Pets} from "./1_21_4/pets.mjs";
import {Recipes} from "./1_21_4/recipes.mjs";
import {Mobs} from "./1_21_4/mobs.mjs";
import {clone} from "./copier.mjs";
import {Runes} from "./1_21_4/runes.mjs";
import {Enchantments } from "./1_21_4/enchantments.mjs";
import { Attributes } from "./1_21_4/attributes.mjs";

const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"));

const isEntity = (file) => {
    if (file.startsWith("PET_SKIN_")) return false;
    if (file.endsWith("_NPC.json")) return true;
    if (file.endsWith("_MONSTER.json")) return true;
    if (file.endsWith("_MINIBOSS.json")) return true;
    if (file.endsWith("_BOSS.json")) return true;
    if (file.endsWith("_SC.json")) return true;
    if (file.endsWith("_ANIMAL.json")) return true;
    return false;
}

const post = []
for (let file of fs.readdirSync("neu/items")) {
    if (!file.endsWith(".json")) {
        console.error("[WARN] (Parse) Skipping non-json file found in items directory: " + file);
        continue;
    }
    const data = JSON.parse(fs.readFileSync(`./neu/items/${file}`, "utf-8"));
    data.nbt = decode(data.nbttag);

    if (specialItems.items.includes(data.internalname)) continue;

    const attributes = data.nbt.ExtraAttributes;

    post.push(() => {
        Recipes.parse(data)
    })

    if (isEntity(file)) {
        Mobs.parseMob(data);
    } else {
        if (attributes.hasOwnProperty("attributes") && data.internalname.startsWith("ATTRIBUTE_SHARD_")) {
            Attributes.parseAttribute(data)
        } else if (attributes.hasOwnProperty("runes")) {
            Runes.parseRune(data);
        } else if (attributes.hasOwnProperty("petInfo")) {
            data.pet = JSON.parse(attributes.petInfo.replaceAll("\\\"", "\""));
            Pets.parsePet(data);
        } else if (data.displayname.match(/§.Enchanted Book/) && data.itemid === "minecraft:enchanted_book" && attributes.enchantments) {
            Enchantments.parseEnchantments(data);
        } else if (data.internalname.includes(";")) {
            // console.log(file + " is a variant");
        } else {
            Mc1214.items.parseItem(data);
            Mc1215.items.parseItem(data);
        }
    }
}

post.forEach((recipe) => recipe())

fs.writeFileSync("cloudflare/shas.json", JSON.stringify({
    "1_21_4": Mc1214.shas(),
    "1_21_5": Mc1215.shas(),
    ... clone(),
}, null, 4));
