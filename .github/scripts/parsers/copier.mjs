import fs from "fs";
import crypto from "crypto";

const filesToCopy = {
    "constants.json": "cloudflare/constants.min.json",
    "neu/constants/reforgestones.json": "cloudflare/constants/reforge_stones.min.json",
}

export const clone = () => {
    const shas = {};
    for (const [source, target] of Object.entries(filesToCopy)) {
        const data = JSON.stringify(JSON.parse(fs.readFileSync(source, "utf-8")));
        const key = target.split("/").pop().replace(".min.json", "");
        shas[key] = crypto.createHash("sha1").update(data).digest("hex");
        fs.writeFileSync(target, data);
    }

    return shas;
}