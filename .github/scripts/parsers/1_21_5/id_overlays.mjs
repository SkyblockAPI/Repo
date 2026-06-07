import {cleanObject} from "./items.mjs";

const getWiki = (item) => {
    if (item.infoType !== "WIKI_URL" || !item.info || item.info.length === 0) return undefined;

    return cleanObject({
        official: item.info.find(url => url.includes("wiki.hypixel.net")),
        independent: item.info.find(url => url.includes("hypixelskyblock.minecraft.wiki")),
        unknown: item.info.find(url => !url.includes("wiki.hypixel.net") && !url.includes("hypixelskyblock.minecraft.wiki"))
    });
};

export const getOverlay = (item) => {
    const overlay = cleanObject({
        vanilla: item.vanilla ? true : undefined,
        wiki: getWiki(item),
    });

    return Object.keys(overlay).length > 0 ? overlay : undefined;
}