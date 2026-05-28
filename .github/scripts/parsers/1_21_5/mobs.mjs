import fs from "fs";
import { getItemId } from "./items.mjs";
import { getInputs } from "./recipes/ingredients.mjs";

const mobsFile = {};

const stripColorCodes = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/§[0-9a-fk-or]/g, '');
};

const parseDropAmountAndChance = (chanceStr, extraLines) => {
    const result = {
        chance: 1.0,
        minAmount: 1,
        maxAmount: 1
    };

    const extractAmount = (str) => {
        const range = str.substring(1).split('-');
        if (range.length === 2) {
            result.minAmount = parseInt(range[0], 10);
            result.maxAmount = parseInt(range[1], 10);
        } else {
            const amount = parseInt(range[0], 10);
            result.minAmount = amount;
            result.maxAmount = amount;
        }
    };

    if (chanceStr) {
        const cleanStr = stripColorCodes(chanceStr).trim();

        if (cleanStr.endsWith('%')) {
            const percentValue = parseFloat(cleanStr.replace('%', ''));
            if (!isNaN(percentValue)) {
                result.chance = percentValue / 100;
            }
        } else if (cleanStr.startsWith('x')) {
            extractAmount(cleanStr);
        } else {
            const val = parseFloat(cleanStr);
            if (!isNaN(val)) {
                result.chance = val <= 1 ? val : val / 100;
            }
        }
    }
    if (Array.isArray(extraLines)) {
        for (const line of extraLines) {
            const cleanLine = stripColorCodes(line).trim();
            if (cleanLine.startsWith('x') && !isNaN(parseInt(cleanLine.charAt(1), 10))) {
                extractAmount(cleanLine);
                break;
            }
        }
    }

    return result;
};

export const Mobs = {
    /** @param item {Item} */
    parseMob: (item) => {
        const realId = item.internalname.replace("MAYOR_MONSTER", "MAYOR");
        const [, realName, type] = item.displayname.match(/^§.(.*) \((.*)\)$/) || [];

        const lootTables = [];

        (item.recipes || []).forEach(recipe => {
            if (recipe.type !== "drops") return;

            const drops = [];

            (recipe.drops || []).forEach(drop => {
                const {minAmount, maxAmount, chance} = parseDropAmountAndChance(drop.chance, drop.extra || []);

                let rawId = drop.id;
                let inIdAmount = 1;

                if (rawId.includes(':')) {
                    const parts = rawId.split(':');
                    rawId = parts[0];
                    const amount = parseInt(parts[1], 10);
                    if (!isNaN(amount)) {
                        inIdAmount = amount;
                    }
                }

                const { count, ...properties } = getInputs(rawId, inIdAmount);

                drops.push({
                    ...properties,
                    chance: chance,
                    minAmount: minAmount !== 1 ? minAmount : inIdAmount,
                    maxAmount: maxAmount !== 1 ? maxAmount : inIdAmount,
                });
            });

            lootTables.push({
                name: stripColorCodes(recipe.name) || realName,
                mobLevel: recipe.level || 0,
                coins: recipe.coins || 0,
                xp: recipe.xp || 0,
                combatXp: recipe.combat_xp || 0,
                drops: drops
            });
        });

        mobsFile[realId] = {
            island: item.island,
            position: item.x && item.y && item.z ? {x: item.x, y: item.y, z: item.z} : undefined,
            texture: item.nbt.SkullOwner?.Properties?.textures[0]?.Value,
            itemId: getItemId(item.itemid, item.damage),
            name: realName,
            type: type,
            lootTables: lootTables.length === 0 ? undefined : lootTables,
        };
    },
    writeMobs: (path) => {
        fs.writeFileSync(`cloudflare/${path}/mobs.min.json`, JSON.stringify(mobsFile));
        fs.writeFileSync(`data/${path}/mobs.json`, JSON.stringify(mobsFile, null, 2));

        return JSON.stringify(mobsFile);
    }
};