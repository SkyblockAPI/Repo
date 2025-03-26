import fs from "fs";

const RIGHT_CLICK_LORE_1 = "§7§eRight-click to add this pet to your";
const RIGHT_CLICK_LORE_2 = "§7§eRight-click to add this pet to";

const stats = JSON.parse(fs.readFileSync("neu/constants/petnums.json", "utf-8"));

const petsFile = {}

const getPetVariables = (pet, tier) => {
    if (!stats[pet]) return {}
    if (!stats[pet][tier]) {}

    const variables = {};
    const min = stats[pet][tier]["1"];
    const max = stats[pet][tier]["100"];

    for (let [index, num] of min.otherNums.entries()) {
        variables[`${index}`] = [num, max.otherNums[index]];
    }

    for (let [key, num] of Object.entries(min.statNums)) {
        variables[key] = [num, max.statNums[key]];
    }

    return variables
}

export const Pets1214 = {
    /** @param item {Item} */
    parsePet: (item) => {
        if (item.itemid !== "minecraft:skull") throw new Error(`Unknown pet: ${item.itemid}:${item.damage}`)

        const petId = item.pet.type
        if (!petId || petId.includes(";")) throw new Error(`Unknown pet: ${petId} for ${item.internalname}`)

        const data = petsFile[petId] || {
            id: petId,
            name: item.displayname.replace(/^(§.)+\[Lvl {LVL}] (§.)+/, ""),
            tiers: {}
        };

        const lore = item.lore;

        const rightClickLore1 = Math.max(lore.indexOf(RIGHT_CLICK_LORE_1), lore.indexOf(RIGHT_CLICK_LORE_2));
        if (rightClickLore1 !== -1) {
            if (rightClickLore1 > 1 && lore[rightClickLore1 - 1] === "") {
                lore.splice(rightClickLore1 - 1, 3);
            } else {
                lore.splice(rightClickLore1, 2);
            }
        }

        data.tiers[item.pet.tier] = {
            texture: item.nbt.SkullOwner.Properties.textures[0].Value,
            lore: lore,
            variables: getPetVariables(item.pet.type, item.pet.tier)
        }

        petsFile[petId] = data
    },
    writePets: (path) => {
        fs.writeFileSync(`cloudflare/${path}/pets.min.json`, JSON.stringify(petsFile));

        return JSON.stringify(petsFile);
    }
}