import {cleanObject} from "./items.mjs";
import {romanToInt} from "../../utils/roman_numeral.mjs";
import {isCollectionItem,getCollectionId} from "../../utils/collection.mjs";

const getWiki = (item) => {
    if (item.infoType !== "WIKI_URL" || !item.info || item.info.length === 0) return undefined;

    return cleanObject({
        official: item.info.find(url => url.includes("wiki.hypixel.net")),
        independent: item.info.find(url => url.includes("hypixelskyblock.minecraft.wiki")),
        unknown: item.info.find(url => !url.includes("wiki.hypixel.net") && !url.includes("hypixelskyblock.minecraft.wiki"))
    });
};

const hotm = ["hotm", "heart of the mountain", "heart of the mountain tier"]
const hotf = ["hotf", "heart of the forest", "heart of the forest tier"]
const bossCollection = ["bonzo", "scarf", "the professor", "thorn", "livid", "sadan", "necron"]
const skills = ["combat", "farming", "fishing", "mining", "foraging", "enchanting", "alchemy", "carpentry", "taming", "hunting", "duneoneering"]

const getRequirements = async (item) => {
    if (!item.crafttext.startsWith("Requires")) {
        console.warn("Non Requirement crafttext found: " + item.crafttext);
        return undefined
    }
    const stringReqs = item.crafttext.replace(/^(Requires:?)/, "").trim().split(" & ");

    const out = [];

    for (let req of stringReqs) {
        const match = req.match(/^(.*?)\s+([0-9]+|[IVXLCDM]+)$/);

        if (match) {
            const name = match[1];
            const levelStr = match[2];

            const levelNum = !isNaN(levelStr) ? parseInt(levelStr, 10) : romanToInt(levelStr);

            if (name.toLowerCase().endsWith("slayer")) {
                out.push({
                    type: "slayer",
                    name: name.substring(0, name.length - 6).trim(),
                    level: levelNum
                })
            } else if (hotm.includes(name.toLowerCase())) {
                out.push({
                    type: "hotm",
                    level: levelNum
                });
            } else if (hotf.includes(name.toLowerCase())) {
                out.push({
                    type: "hotf",
                    level: levelNum
                });
            } else if (bossCollection.includes(name.toLowerCase())) {
                out.push({
                    type: "bossCollection",
                    name: name,
                    level: levelNum
                });
            } else if (skills.includes(name.toLowerCase())) {
                out.push({
                    type: "skill",
                    name: name,
                    level: levelNum
                });
            } else if (await isCollectionItem(name)) {
                out.push({
                    type: "collection",
                    name: name,
                    id: getCollectionId(name),
                    level: levelNum
                })
            } else {
                out.push({
                    type: "unknown",
                    name: name,
                    level: levelNum
                });
            }
        } else {
            out.push({
                type: "unknown",
                name: req,
                level: null
            });
        }
    }

    return out
}

export const getOverlay = async (item) => {
    const overlay = cleanObject({
        vanilla: item.vanilla ? true : undefined,
        requirements: item.crafttext && item.crafttext !== "" ? await getRequirements(item) : undefined, // Add await here
        wiki: getWiki(item),
    });

    return Object.keys(overlay).length > 0 ? overlay : undefined;
}