import fs from "fs";
import crypto from "crypto";

const filesToCopy = {
    "constants.json": "constants.min.json",
    "neu/constants/reforgestones.json": "constants/reforge_stones.min.json",
}

export const clone = () => {
    const shas = {};
    for (const [source, target] of Object.entries(filesToCopy)) {
        const rawData = JSON.parse(fs.readFileSync(source, "utf-8"));
        const key = target.split("/").pop().replace(".min.json", "");
        const data = JSON.stringify(rawData);
        shas[key] = crypto.createHash("sha1").update(data).digest("hex");
        fs.writeFileSync(`cloudflare/${target}`, data);
        fs.writeFileSync(`data/${target.replace(".min.json", ".json")}`, JSON.stringify(rawData, null, 2));
    }

    return shas;
}