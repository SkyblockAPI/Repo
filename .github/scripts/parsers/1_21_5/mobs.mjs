import fs from "fs";

const mobsFile = {}

export const Mobs = {
    /** @param item {Item} */
    parseMob: (item) => {
        const realId = item.internalname.replace("MAYOR_MONSTER", "MAYOR")
        const realName = item.displayname.replace(/^§.(.*) \(.*\)$/, "$1")

        mobsFile[realId] = {
            island: item.island,
            position: item.x && item.y && item.z ? { x: item.x, y: item.y, z: item.z } : undefined,
            texture: item.nbt.SkullOwner?.Properties?.textures[0]?.Value,
            name: realName
        }
    },
    writeMobs: (path) => {
        fs.writeFileSync(`cloudflare/${path}/mobs.min.json`, JSON.stringify(mobsFile));
        fs.writeFileSync(`data/${path}/mobs.json`, JSON.stringify(mobsFile, null, 2));

        return JSON.stringify(mobsFile);
    }
}