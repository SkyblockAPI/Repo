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

        console.log(item.displayname)
        item.lore.shift()

        potionIds.push(potionId)
        const potion = potionFile[potionId] || {
            id: potionId,
            levels: [],
            name: item.displayname.replaceAll(/^(.*) [IV]{1,4}(?: Splash)?( Potion)?.*?$/g, "$1").replace(/§[0-9a-f]/ig, "")
        }

        potion.levels.push({
            level: potionLevel,
            literal_level: item.displayname.replaceAll(/^.*?([IV]{1,4}).*?$/g, "$1"),
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