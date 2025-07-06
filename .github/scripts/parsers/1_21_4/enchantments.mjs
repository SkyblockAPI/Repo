import fs from "fs";

const enchantmentFile = {};

export const Enchantments = {
    /** @param item {Item} */
    parseEnchantments: (item) => {
        item.isEnchantment = true
        const originalItem = item
        item = structuredClone(item)

        const parts = item.internalname.split(";");
        const enchantId = parts[0];
        const enchantLevel = parseInt(parts[1]);
        originalItem.enchantId = enchantId
        originalItem.enchantLevel = enchantLevel

        item.displayname = item.lore[0]
        item.lore.shift()

        const enchant = enchantmentFile[enchantId] || {
            id: enchantId,
            levels: [],
            name: item.displayname.substring(0, item.displayname.lastIndexOf(" ")).trim().replace(/(§.)+/, ""),
            isUltimate: enchantId.startsWith("ULTIMATE_")
        }

        enchant.levels.push({
            level: enchantLevel,
            literal_level: item.displayname.substring(item.displayname.lastIndexOf(" ")).trim(),
            lore: item.lore,
        })

        enchantmentFile[enchantId] = enchant
    },
    writeEnchantments: (path) => {
        fs.writeFileSync(`cloudflare/${path}/enchantments.min.json`, JSON.stringify(enchantmentFile));

        return JSON.stringify(enchantmentFile);
    }
}