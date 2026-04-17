import fs from "fs";
import { checkPetVariables } from "../../tests/pet_variables.test.mjs";

const RIGHT_CLICK_LORE_1 = "§7§eRight-click to add this pet to your";
const RIGHT_CLICK_LORE_2 = "§7§eRight-click to add this pet to";
const RIGHT_CLICK_LORE_3 = "§eRight-click to add this pet to your";

const stats = JSON.parse(fs.readFileSync("neu/constants/petnums.json", "utf-8"));

const petsFile = {}
export const petIds = []

const getPetVariables = (pet, tier) => {
    if (!stats[pet]) return {}
    if (!stats[pet][tier]) return {}

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

export const Pets = {
    /** @param item {Item} */
    parsePet: (item) => {
        if (item.itemid !== "minecraft:skull") throw new Error(`Unknown pet: ${item.itemid}:${item.damage}`)

        const petId = item.pet.type
        petIds.push(petId)
        if (!petId || petId.includes(";")) throw new Error(`Unknown pet: ${petId} for ${item.internalname}`)

        const data = petsFile[petId] || {
            id: petId,
            name: item.displayname.replace(/^(§.)+\[Lvl {LVL}] (§.)+/, ""),
            tiers: {}
        };

        const lore = item.lore;

        const rightClickLore1 = Math.max(
            lore.indexOf(RIGHT_CLICK_LORE_1),
            lore.indexOf(RIGHT_CLICK_LORE_2),
            lore.indexOf(RIGHT_CLICK_LORE_3)
        );
        if (rightClickLore1 !== -1) {
            if (rightClickLore1 > 1 && lore[rightClickLore1 - 1] === "") {
                lore.splice(rightClickLore1 - 1, 3);
            } else {
                lore.splice(rightClickLore1, 2);
            }
        }

        const tier = {
            texture: item.nbt.SkullOwner.Properties.textures[0].Value,
            lore: lore,
            variables: getPetVariables(item.pet.type, item.pet.tier)
        }
        const variablesOffset = stats[petId]?.[item.pet.tier]?.["stats_levelling_curve"]?.split(":") || [];
        if (variablesOffset.length >= 2) {
            tier.variablesOffset = parseInt(variablesOffset[0]) - 1;
        }

        const checks = checkPetVariables(tier);

        if (checks.missing.length > 0) {
            console.error(`[WARN] (Pets) Missing pet variables for ${petId} ${item.pet.tier}: ${checks.missing.join(", ")}`);
            for (let missingVariable of checks.missing) {
                tier.variables[missingVariable] = [0, 0];
            }
        }
        if (checks.unused.length > 0) {
            console.warn(`[WARN] (Pets) Unused pet variables for ${petId} ${item.pet.tier}: ${checks.unused.join(", ")}`);
        }

        data.tiers[item.pet.tier] = tier;

        petsFile[petId] = data
    },
    writePets: (path) => {
        fs.writeFileSync(`cloudflare/${path}/pets.min.json`, JSON.stringify(petsFile));
        fs.writeFileSync(`data/${path}/pets.json`, JSON.stringify(petsFile, null, 2));

        return JSON.stringify(petsFile);
    }
}
