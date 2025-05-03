import fs from "fs";

const runesFile = {}

export const Runes1214 = {
    /** @param item {Item} */
    parseRune: (item) => {
        if (item.itemid !== "minecraft:skull") throw new Error(`Unknown rune: ${item.itemid}:${item.damage}`)

        const runes = item.nbt.ExtraAttributes.runes;

        if (Object.keys(runes).length !== 1) throw new Error(`Unknown rune: ${item.internalname} (${Object.keys(runes)})`)
        const rune = Object.keys(runes)[0];
        const tier = runes[rune];

        const runeInfo = runesFile[rune] || []
        runeInfo.push({
            tier: tier,
            texture: item.nbt.SkullOwner.Properties.textures[0].Value,
            name: item.displayname,
            lore: item.lore,
        })
        runesFile[rune] = runeInfo;
    },
    writeRunes: (path) => {
        fs.writeFileSync(`cloudflare/${path}/runes.min.json`, JSON.stringify(runesFile));

        return JSON.stringify(runesFile);
    }
}