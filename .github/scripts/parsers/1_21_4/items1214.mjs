import fs from "fs";

const itemsFile = [];

const converter = JSON.parse(fs.readFileSync(".github/scripts/data/1_8_9_to_1_21_1.json", "utf-8"))
const specialItems = JSON.parse(fs.readFileSync(".github/scripts/data/special_items.json", "utf-8"))

const lookup = converter.lookup
const ignoreDamage = converter.ignore_damage

const getItemId = (id, damage) => {
    const newId = lookup[`${id}${ignoreDamage.includes(id) || damage === 0 ? "" : `:${damage}`}`];
    if (newId === undefined) throw new Error(`Unknown item: ${id}:${damage}`)
    return newId
}

export const Items1214 = {
    /** @param item {Item} */
    parseItem: (item) => {
        if (item.displayname.match(/§.Enchanted Book/)) {
            item = structuredClone(item)
            const id = item.nbt.ExtraAttributes.id;
            const parts = item.internalname.split(";");
            item.nbt.ExtraAttributes.id = `ENCHANTMENT_${parts[0].toUpperCase()}_${parts[1]}`;
            item.displayname = item.lore[0]
            item.lore.shift()
        } 

        if (specialItems.items.includes(item.internalname)) return;

        const isUnbreakable = item.nbt?.Unbreakable === 1;
        const isGlowing = item.nbt?.ench !== undefined;
        const itemModel = !item.nbt.ItemModel || item.nbt.ItemModel === getItemId(item.itemid, item.damage) ? undefined : item.nbt.ItemModel;

        itemsFile.push({
            id: getItemId(item.itemid, item.damage),
            components: {
                'minecraft:attribute_modifiers': { modifiers: [], show_in_tooltip: false },
                'minecraft:hide_additional_tooltip': {},
                'minecraft:custom_data': item.nbt.ExtraAttributes ?? {},
                'minecraft:unbreakable': isUnbreakable ? { show_in_tooltip: false } : undefined,
                'minecraft:enchantment_glint_override': isGlowing ? true : undefined,
                'minecraft:custom_name': JSON.stringify(item.displayname),
                'minecraft:lore': item.lore.map(line => JSON.stringify(line)),
                'minecraft:profile': item.nbt.SkullOwner ? {
                    properties: [
                        {
                            name: "textures",
                            value: item.nbt.SkullOwner.Properties.textures[0].Value
                        }
                    ]
                } : undefined,
                'minecraft:dyed_color': item.nbt?.display?.color ? {
                    rgb: item.nbt.display.color,
                    show_in_tooltip: false
                } : undefined,
                'minecraft:item_model': itemModel,
            }
        });
    },
    writeItems: (path) => {
        fs.writeFileSync(`cloudflare/${path}/items.min.json`, JSON.stringify(itemsFile));

        return JSON.stringify(itemsFile);
    }
}