import fs from "fs";
import { getItemId, Items } from "./items.mjs";

const attributesFile = [];
export const attributeIds = []

export const Attributes = {
    /** @param item {Item} */
    parseAttribute: (item) => {
        item.isAttributeShard = true
        const originalItem = item
        item = structuredClone(item)

        const attributeId = Object.keys(item.nbt.ExtraAttributes.attributes)[0].toUpperCase();
        originalItem.attributeId = attributeId;

        const name = item.displayname
        item.displayname = item.lore[0]
        item.lore.shift()

        const newLore = []

        item.lore.forEach(element => {
            if (
                element.replace(/§./g, "") === "Right-click to send to Hunting Box!" ||
                element.replace(/§./g, "") === "Shift Right-click to move all!"
            ) return
            if (element === newLore.at(-1)) return
            newLore.push(element)
        });

        
        const lastLine = newLore.at(-1).replace(/.*?§8\(ID (.*?)\)/, "$1");
        const rarity = newLore.pop();
        newLore.push(rarity.substring(0, rarity.lastIndexOf("§")).trim())

        attributeIds.push(attributeId)
        const attribute = {
            id: attributeId,
            lore: newLore,
            attribute_id: lastLine,
            shard_name: name.replace(/(§.)+/, ""),
            name: item.displayname.substring(0, item.displayname.lastIndexOf(" ")).trim().replace(/§./g, ""),
            item: getItemId(item.itemid, item.damage),
            texture: item.nbt.SkullOwner ? item.nbt.SkullOwner.Properties.textures[0].Value : undefined
        }

        attributesFile.push(attribute)
    },
    writeAttributes: (path) => {
        fs.writeFileSync(`cloudflare/${path}/attributes.min.json`, JSON.stringify(attributesFile));

        return JSON.stringify(attributesFile);
    }
}