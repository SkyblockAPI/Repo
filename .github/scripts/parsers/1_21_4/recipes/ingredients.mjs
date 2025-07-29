export const getResult = (item, count) => {
    if (item.pet) {
        return {
            type: "pet",
            pet: item.pet.type,
            tier: item.pet.tier,
            count: count,
        };
    } else if (item.isEnchantment) {
        return {
            type: "enchantment",
            id: item.enchantId,
            level: item.enchantLevel,
            count: count
        }
    } else if (item.isAttributeShard) {
        return {
            type: "attribute",
            id: item.attributeId,
            count: count
        }
    } else if (item.internalname.includes(";")) {
        throw new Error("Unsupported variant recipe " + item.internalname);
    }
    return {
        id: item.internalname,
        count: count
    };
}