const url = "https://api.hypixel.net/v2/resources/skyblock/collections";

let collectionCache = null;

export async function fetchCollections() {
    if (collectionCache) return;

    await fetch(url)
        .then((res) => {
            if (!res.ok) throw new Error(`Error: ${res.status}`);
            return res.json();
        })
        .then((data) => {
            const cache = new Map();
            if (data.success && data.collections) {
                for (const category of Object.values(data.collections)) {
                    if (!category.items) continue;
                    for (const [id, item] of Object.entries(category.items)) {
                        cache.set(id, id);
                        if (item.name) {
                            cache.set(item.name.toLowerCase(), id);
                        }
                    }
                }
            }
            console.info(`Loaded ${cache.size} collection items.`);
            collectionCache = cache;
        })
        .catch((err) => {
            console.error("Failed to fetch Hypixel collections:", err);
        });
}

export const isCollectionItem = (name) => {
    if (!collectionCache) return false;
    return collectionCache.has(name) || collectionCache.has(name.toLowerCase());
};

export const getCollectionId = (name) => {
    if (!collectionCache) return null;
    return collectionCache.get(name) || collectionCache.get(name.toLowerCase());
};