import fs from "fs";
import {getOverlay} from "./id_overlays.mjs";

const itemsFile = [];
const itemOverlaysFile = [];

const converter = JSON.parse(fs.readFileSync(".github/scripts/data/1_8_9_to_1_21_1.json", "utf-8"));
const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"));
const customDataExclusionList = JSON.parse(fs.readFileSync(".github/scripts/data/custom_data_exclusion_list.json", "utf-8"));

const lookup = converter.lookup;
const ignoreDamage = converter.ignore_damage;

export const cleanObject = (obj) => {
    const cleaned = {};
    for (const key in obj) {
        if (obj[key] !== undefined) {
            cleaned[key] = obj[key];
        }
    }
    return cleaned;
};

export const getItemId = (id, damage) => {
    const newId = lookup[`${id}${ignoreDamage.includes(id) || damage === 0 ? "" : `:${damage}`}`];

    if (newId === undefined) {
        if (Object.values(lookup).includes(id)) {
            return id;
        }
        throw new Error(`Unknown item: ${id}:${damage}`);
    }
    return newId;
}

const applyItemOverlay = (itemStack, itemOverlay) => {
    if (!itemOverlay) return itemStack;

    if (typeof itemOverlay.id === "string") {
        itemStack.id = itemOverlay.id;
    }

    // Delete item_model from .json if .snbt is present since NEU repo abuses it to store the item's modern ID
    delete itemStack.components["minecraft:item_model"];

    if (itemOverlay.components && typeof itemOverlay.components === "object" && !Array.isArray(itemOverlay.components)) {
        for (const [key, value] of Object.entries(itemOverlay.components)) {
            itemStack.components[key] = value;
        }
    }

    return itemStack;
}

export const Items = {
    /** @param item {Item} */
    parseItem: (item) => {
        if (specialItems.items.includes(item.internalname)) return;

        const isUnbreakable = item.nbt?.Unbreakable === true || item.nbt?.Unbreakable === 1;
        const isGlowing = item.nbt?.ench !== undefined;
        const itemModel = !item.nbt.ItemModel || item.nbt.ItemModel === getItemId(item.itemid, item.damage) ? undefined : item.nbt.ItemModel;

        const itemId = getItemId(item.itemid, item.damage);

        if (!item.nbt.ExtraAttributes.hasOwnProperty("id")) {
            console.warn(`Found Item without SkyBlockId, skipping: id: ${itemId}, name: ${item.displayname}`);
            return;
        }

        const itemStack = applyItemOverlay({
            id: itemId,
            components: {
                "minecraft:custom_data": item.nbt.ExtraAttributes ?? {},
                "minecraft:unbreakable": isUnbreakable ? {} : undefined,
                "minecraft:enchantment_glint_override": isGlowing ? true : undefined,
                "minecraft:custom_name": {text: item.displayname},
                "minecraft:lore": item.lore.map(line => ({text: line})),
                "minecraft:profile": item.nbt.SkullOwner ? {
                    properties: [
                        {
                            name: "textures",
                            value: item.nbt.SkullOwner.Properties.textures[0].Value,
                        }
                    ]
                } : undefined,
                "minecraft:dyed_color": item.nbt?.display?.color ?? undefined,
                "minecraft:item_model": itemModel,
            }
        }, item.itemOverlay);

        delete itemStack.components["minecraft:entity_data"];
        delete itemStack.components["minecraft:jukebox_playable"];
        delete itemStack.components["minecraft:map_id"];

        for (const [key, value] of Object.entries(itemStack.components ?? {})) {
            if (value == null) continue;

            switch (key) {
                case "minecraft:profile":
                    delete value.name;
                    delete value.id;
                    for (const property of value.properties) {
                        if (property.name === "textures") {
                            delete property.signature;
                        }
                    }
                    break;
                case "minecraft:custom_data":
                    for (const [k, v] of Object.entries(value)) {
                        if (customDataExclusionList.keys.includes(k)) delete value[k];
                        if (k === "minecraft:attribute_modifiers" && !(v?.length > 0)) delete value[k];
                    }
                    break;
            }
        }

        itemsFile.push(itemStack);

        const overlayProps = getOverlay(item);
        if (overlayProps) {
            itemOverlaysFile.push({
                type: "item",
                id: item.nbt.ExtraAttributes.id,
                ...getOverlay(item),
            });
        }
    },
    writeItems: (path) => {
        fs.writeFileSync(`cloudflare/${path}/items.min.json`, JSON.stringify(itemsFile));
        fs.writeFileSync(`data/${path}/items.json`, JSON.stringify(itemsFile, null, 2));

        return {items: JSON.stringify(itemsFile), itemOverlays: itemOverlaysFile};
    }
}
