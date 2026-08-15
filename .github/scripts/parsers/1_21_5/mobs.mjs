import fs from "fs";
import { getItemId } from "./items.mjs";
import { getInputs } from "./recipes/ingredients.mjs";
import { getOverlay } from "./id_overlays.mjs";

const mobsFile = {};
const mobOverlaysFile = [];

const stripColorCodes = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/§[0-9a-fk-or]/g, '');
};

const parseDropAmountAndChance = (chanceStr, extraLines) => {
    const result = {
        chance: 1.0,
        minAmount: 1,
        maxAmount: 1,
        extra: []
    };

    if (chanceStr) {
        const cleanStr = stripColorCodes(chanceStr).trim();

        const chanceMatch = cleanStr.match(/^([\d.]+)\s*%(?:\s+(per\s+.+))?/i);

        if (chanceMatch) {
            result.chance = parseFloat(chanceMatch[1]) / 100;
            if (chanceMatch[2]) {
                result.condition = chanceMatch[2].trim();
            }
        } else {
            console.warn(`Unknown mob drop chance format: ${cleanStr}`);
            result.chance = 1;
        }
    }
    if (Array.isArray(extraLines)) {
        for (const line of extraLines) {
            const cleanLine = stripColorCodes(line).trim();

            const amountMatch = cleanLine.match(/^(?:Drop Count:\s*)?x(\d+)(?:-(\d+))?/i);

            if (amountMatch) {
                result.minAmount = parseInt(amountMatch[1], 10);
                result.maxAmount = amountMatch[2] ? parseInt(amountMatch[2], 10) : result.minAmount;
            } else if (cleanLine !== "") {
                result.extra.push(line);
            }
        }
    }

    if (result.extra.length === 0) {
        delete result.extra;
    }

    return result;
};

export const Mobs = {
    /** @param item {Item} */
    parseMob: async (item) => {
        const realId = item.internalname.replace("MAYOR_MONSTER", "MAYOR");
        const [, realName, type] = item.displayname.match(/^§.(.*?)(?: \(([^)]+)\))?$/) || [];

        const lootTables = [];

        (item.recipes || []).forEach(recipe => {
            if (recipe.type !== "drops") return;

            const drops = [];

            if (recipe.coins >= 1) {
                drops.push({
                    type: "currency",
                    currency: "coin",
                    chance: 1.0,
                    minAmount: recipe.coins,
                    maxAmount: recipe.coins,
                })
            }

            (recipe.drops || []).forEach(drop => {
                const {minAmount, maxAmount, chance, condition, extra} =
                    parseDropAmountAndChance(drop.chance, drop.extra || []);

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

                const dropData = {
                    ...properties,
                    chance: chance,
                    minAmount: minAmount !== 1 ? minAmount : inIdAmount,
                    maxAmount: maxAmount !== 1 ? maxAmount : inIdAmount,
                };

                if (condition) {
                    dropData.condition = condition;
                }

                if (extra) {
                    dropData.extraLore = extra
                }

                drops.push(dropData);
            });

            lootTables.push({
                name: stripColorCodes(recipe.name) || realName,
                mobLevel: recipe.level || 0,
                xp: recipe.xp || 0,
                combatXp: recipe.combat_xp || 0,
                drops: drops
            });
        });

        mobsFile[realId] = {
            island: item.island,
            position: item.x && item.y && item.z ? {x: item.x, y: item.y, z: item.z} : undefined,
            texture: item.nbt.SkullOwner?.Properties?.textures[0]?.Value,
            itemId: item.nbt.ItemModel ?? getItemId(item.itemid, item.damage),
            name: realName,
            type: type,
            lootTables: lootTables.length === 0 ? undefined : lootTables,
        };

        const overlayProps = await getOverlay(item);
        if (overlayProps) {
            mobOverlaysFile.push({
                type: "mob",
                id: realId,
                ...overlayProps
            });
        }
    },
    writeMobs: (path) => {
        fs.writeFileSync(`cloudflare/${path}/mobs.min.json`, JSON.stringify(mobsFile));
        fs.writeFileSync(`data/${path}/mobs.json`, JSON.stringify(mobsFile, null, 2));

        return {mobs: JSON.stringify(mobsFile), mobOverlays: mobOverlaysFile};
    }
};