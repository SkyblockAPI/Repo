import fs from "fs";

const enchantmentFile = {};
export const enchantmentIds = []

export const Enchantments = {
    /** @param item {Item} */
    parseEnchantments: (item) => {
        const originalItem = item
        item = structuredClone(item)

        const parts = item.internalname.split(";");
        const enchantId = parts[0];
        const enchantLevel = parseInt(parts[1]);
        originalItem.enchantment = {
            id: enchantId,
            level: enchantLevel
        }

        // This is kinda ugly but needed since the neu repo contains both new and old books.
        let displayName = "";
        let isLegacy = true;

        for (let line of item.lore) {
            const strippedLine = line.replace(/(§.)+/, "");
            if (strippedLine.startsWith("Combinable in Anvil")) {
                isLegacy = false;
                continue;
            }
            if (strippedLine.trim().length === 0) continue;
            displayName = line;
            break;
        }

        item.displayname = displayName
        if (isLegacy) item.lore.shift()

        enchantmentIds.push(enchantId)
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
        fs.writeFileSync(`data/${path}/enchantments.json`, JSON.stringify(enchantmentFile, null, 2));

        return JSON.stringify(enchantmentFile);
    }
}