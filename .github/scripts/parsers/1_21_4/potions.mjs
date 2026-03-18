import fs from "fs";

const potionFile = {};
export const potionIds = []

export const Potions = {
    /** @param item {Item} */
    parsePotions: (item) => {
        const originalItem = item
        item = structuredClone(item)

        const parts = item.internalname.split(";");
        const potionId = parts[0];
        const potionLevel = parseInt(parts[1]);
        originalItem.potion = {
            id: potionId,
            level: potionLevel
        }

        item.displayname = item.lore[0]
        item.lore.shift()

        potionIds.push(potionId)
        const potion = potionFile[potionId] || {
            id: potionId,
            levels: [],
            name: item.displayname.substring(0, item.displayname.lastIndexOf(" ")).trim().replace(/(§.)+/, "")
        }

        console.log(item.displayname)
        potion.levels.push({
            level: potionLevel,
            literal_level: item.displayname.substring(item.displayname.lastIndexOf(" ")).trim(),
            lore: item.lore,
        })

        potionFile[potionId] = potion
    },
    writePotions: (path) => {
        fs.writeFileSync(`cloudflare/${path}/potions.min.json`, JSON.stringify(potionFile));
        fs.writeFileSync(`data/${path}/potions.json`, JSON.stringify(potionFile, null, 2));

        return JSON.stringify(potionFile);
    }
}