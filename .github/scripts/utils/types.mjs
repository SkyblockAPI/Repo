/**
 * @typedef {Object} PetInfo
 * @property {string} type
 * @property {string} tier
 */

/**
 * @typedef {Object} ItemNbt
 * @property {{petInfo: string}} ExtraAttributes
 * @property {number?} Unbreakable
 * @property {Object[]?} ench
 * @property {{Properties: {textures: [{ Value }]}}} SkullOwner
 */

/**
 * @typedef {Object} Item
 * @property {string} itemid
 * @property {string} internalname
 * @property {string} displayname
 * @property {string} nbttag
 * @property {number} damage
 * @property {string[]} lore
 * @property {{[key: string]: string}} recipe
 * @property {[Object]} recipes
 *
 * @property {string} island
 * @property {number} x
 * @property {number} y
 * @property {number} z
 *
 * @property {ItemNbt?} nbt
 * @property {PetInfo?} pet
 */