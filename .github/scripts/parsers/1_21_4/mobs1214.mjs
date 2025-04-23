import fs from "fs";

const mobsFile = {}

export const Mobs1214 = {
    /** @param item {Item} */
    parseMob: (item) => {
        const realName = item.internalname.replace("MAYOR_MONSTER", "MAYOR")
        mobsFile[realName] = {
            island: item.island,
            position: item.x && item.y && item.z ? { x: item.x, y: item.y, z: item.z } : undefined,
            texture: item.nbt.SkullOwner?.Properties?.textures[0]?.Value
        }
    },
    writeMobs: (path) => {
        fs.writeFileSync(`cloudflare/${path}/mobs.min.json`, JSON.stringify(mobsFile));

        return JSON.stringify(mobsFile);
    }
}