import fs from "fs";

const neuAttributes = JSON.parse(fs.readFileSync("neu/constants/attribute_shards.json", "utf-8"));

export const NeuData = {
    attributes: {
        lookup: Object.fromEntries(neuAttributes.attributes.map(attr => {
            const id = attr.internalName.replace(/^ATTRIBUTE_SHARD_(.*);1$/, "$1");
            return [id, attr]
        })),
        levels: Object.fromEntries(Object.entries(neuAttributes.attribute_levelling).map(([id, levels]) => {
            return [id, levels.reduce((acc, level) => acc + level, 0)];
        }))
    }
}