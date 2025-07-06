import fs from "fs";

const enchantmentFile = {};

export const Enchantments = {
    /** @param item {Item} */
    parseEnchantments: (item) => {
        item = structuredClone(item)
        const id = item.nbt.ExtraAttributes.id;
        const parts = item.internalname.split(";");
        console.log(parts);
        const enchantId = parts[0];
        const enchantLevel = parts[1];
        item.nbt.ExtraAttributes.id = `ENCHANTMENT_${parts[0].toUpperCase()}_${parts[1]}`;
        item.displayname = item.lore[0]
        item.lore.shift()

        const enchant = enchantmentFile[enchantId] || {
            id: enchantId,
            levels: [],
            name: item.displayname.substring(0, item.displayname.lastIndexOf(" ")).trim().replace(/(§.)+/, ""),
            isUltimate: enchantId.startsWith("ULTIMATE_")
        }

        enchant.levels.push({
            level: parseInt(enchantLevel),
            literal_level: item.displayname.substring(item.displayname.lastIndexOf(" ")).trim(),
            lore: item.lore,
        })
        console.log(enchant)

        enchantmentFile[enchantId] = enchant
    },
    writeEnchantments: (path) => {
        fs.writeFileSync(`cloudflare/${path}/enchantments.min.json`, JSON.stringify(enchantmentFile));

        return JSON.stringify(enchantmentFile);
    }
}