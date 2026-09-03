import {cleanObject} from "./items.mjs";
import {romanToInt} from "../../utils/roman_numeral.mjs";
import {isCollectionItem,getCollectionId} from "../../utils/collection.mjs";

const getWiki = (item) => {
    if (item.infoType !== "WIKI_URL" || !item.info || item.info.length === 0) return undefined;

    return cleanObject({
        independent: item.info.find(url => url.includes("hypixelskyblock.minecraft.wiki")),
        unknown: item.info.find(url => !url.includes("hypixelskyblock.minecraft.wiki"))
    });
};

const hotm = ["hotm", "heart of the mountain", "heart of the mountain tier"];
const hotf = ["hotf", "heart of the forest", "heart of the forest tier"];
const bossCollection = ["bonzo", "scarf", "the professor", "thorn", "livid", "sadan", "necron"];
const skills = ["combat", "farming", "fishing", "mining", "foraging", "enchanting", "alchemy", "carpentry", "taming", "hunting", "duneoneering"];
const slayers = ["zombie", "spider", "wolf", "enderman", "blaze", "vampire"];

const parseLevel = (levelStr) => !isNaN(levelStr) ? parseInt(levelStr, 10) : romanToInt(levelStr);

const getRequirements = (item) => {
    const out = [];

    if (item.crafttext) {
        if (item.crafttext.startsWith("Requires")) {
            const stringReqs = item.crafttext.replace(/^(Requires:?)/, "").trim().split(" & ");

            for (const req of stringReqs) {
                const match = req.match(/^(.*?)\s+([0-9]+|[IVXLCDM]+)$/);

                if (match) {
                    const [, name, levelStr] = match;
                    const lowerName = name.toLowerCase();

                    const reqData = { level: parseLevel(levelStr) };

                    if (lowerName.endsWith("slayer")) {
                        reqData.type = "slayer";
                        reqData.name = name.substring(0, name.length - 6).trim();
                    } else if (hotm.includes(lowerName)) {
                        reqData.type = "hotm";
                    } else if (hotf.includes(lowerName)) {
                        reqData.type = "hotf";
                    } else if (bossCollection.includes(lowerName) || skills.includes(lowerName)) {
                        reqData.type = bossCollection.includes(lowerName) ? "bossCollection" : "skill";
                        reqData.name = name;
                    } else if (isCollectionItem(name)) {
                        reqData.type = "collection";
                        reqData.name = name;
                        reqData.id = getCollectionId(name);
                    } else {
                        reqData.type = "unknown";
                        reqData.name = name;
                    }

                    out.push(reqData);
                } else {
                    out.push({ type: "unknown", name: req, level: null });
                }
            }
        } else {
            console.warn("Non Requirement crafttext found: " + item.crafttext);
        }
    }

    if (item.slayer_req) {
        const [nameStr, levelStr] = item.slayer_req.split("_");
        const lowerName = nameStr?.toLowerCase();

        if (slayers.includes(lowerName)) {
            out.push({
                type: "slayer",
                name: lowerName.charAt(0).toUpperCase() + lowerName.slice(1),
                level: parseLevel(levelStr)
            });
        }
    }

    if (out.length === 0) return undefined;

    const uniqueReqs = new Map();
    for (const req of out) {
        const key = `${req.type}_${req.name || ''}`;
        const existing = uniqueReqs.get(key);

        if (!existing || (req.level !== null && existing.level !== null && req.level > existing.level)) {
            uniqueReqs.set(key, req);
        }
    }

    return Array.from(uniqueReqs.values());
}

export const getOverlay = (item) => {
    const overlay = cleanObject({
        vanilla: item.vanilla ? true : undefined,
        requirements: getRequirements(item),
        wiki: getWiki(item),
    });

    return Object.keys(overlay).length > 0 ? overlay : undefined;
}