import fs from "fs";
import {getOverlay} from "./id_overlays.mjs";

const runesFile = {}
const runeOverlaysFile = []
export const runeIds = []

export const Runes = {
    /** @param item {Item} */
    parseRune: async (item) => {
        if (item.itemid !== "minecraft:skull") throw new Error(`Unknown rune: ${item.itemid}:${item.damage}`)

        const runes = item.nbt.ExtraAttributes.runes;

        if (Object.keys(runes).length !== 1) throw new Error(`Unknown rune: ${item.internalname} (${Object.keys(runes)})`)
        const rune = Object.keys(runes)[0];
        const tier = runes[rune];

        runeIds.push(rune);
        const runeInfo = runesFile[rune] || []
        runeInfo.push({
            tier: tier,
            texture: item.nbt.SkullOwner.Properties.textures[0].Value,
            name: item.displayname,
            lore: item.lore,
        })
        runesFile[rune] = runeInfo;

        const overlayProps = await getOverlay(item);
        if (overlayProps) {
            runeOverlaysFile.push({
                type: "rune",
                id: rune,
                tier: tier,
                ...overlayProps
            });
        }
    },
    writeRunes: (path) => {
        fs.writeFileSync(`cloudflare/${path}/runes.min.json`, JSON.stringify(runesFile));
        fs.writeFileSync(`data/${path}/runes.json`, JSON.stringify(runesFile, null, 2));

        return {runes: JSON.stringify(runesFile), runeOverlays: runeOverlaysFile};
    }
}
