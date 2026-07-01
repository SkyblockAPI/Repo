class Reader {

    /**
     *
     * @param input {string}
     */
    constructor(input) {
        this.input = input;
        this.index = 0;
        this.keyStack = [];
        this.typedArrayDepth = 0;
    }

    readIf(char) {
        if (this.peek() === char) {
            this.read();
            return true;
        }
        return false;
    }

    expect(char) {
        if (!this.readIf(char)) throw new Error(`Expected ${char}`);
    }

    read() {
        if (this.index >= this.input.length) {
            throw new Error("Unexpected end of input for: " + this.input);
        }
        return this.input[this.index++];
    }

    peek() {
        return this.input[this.index];
    }

    skipWhitespace() {
        this.readUntil(c => c !== undefined && /\s/.test(c));
    }

    readUntil(predicate) {
        let result = '';
        while (predicate(this.peek())) {
            result += this.read();
        }
        return result;
    }
}

const decodeObject = (reader) => {
    const result = {};

    reader.expect("{");
    reader.skipWhitespace();
    while (reader.peek() !== '}') {
        const key = decodeKey(reader);
        reader.skipWhitespace();
        reader.expect(":");
        reader.skipWhitespace();
        reader.keyStack.push(key);
        try {
            result[key] = decode(reader);
        } finally {
            reader.keyStack.pop();
        }
        reader.skipWhitespace();
        reader.readIf(',');
        reader.skipWhitespace();
    }
    reader.expect("}");
    return result;
}

const decodeArray = (reader) => {
    const result = [];

    reader.expect("[");
    reader.skipWhitespace();
    const arrayType = reader.peek();
    const typedArray = (arrayType === 'B' || arrayType === 'I' || arrayType === 'L') && reader.input[reader.index + 1] === ';';
    if (typedArray) {
        reader.read();
        reader.expect(';');
        reader.skipWhitespace();
    }

    if (typedArray) reader.typedArrayDepth++;
    try {
        while (reader.peek() !== ']') {
            const start = reader.index;
            if (reader.peek() !== '{' && reader.peek() !== '[' && reader.peek() !== '"' && reader.peek() !== "'") {
                reader.readUntil(c => c !== undefined && !/\s/.test(c) && c !== ':' && c !== ',' && c !== ']');
                reader.skipWhitespace();
                if (reader.readIf(':')) {
                    reader.skipWhitespace();
                } else {
                    reader.index = start;
                }
            }
            result.push(decode(reader));
            reader.skipWhitespace();
            reader.readIf(',');
            reader.skipWhitespace();
        }
    } finally {
        if (typedArray) reader.typedArrayDepth--;
    }
    reader.expect("]");
    return result;
}

const decodeKey = (reader) => {
    reader.skipWhitespace();
    if (reader.peek() === '"' || reader.peek() === "'") {
        return decodeString(reader);
    }

    return reader.readUntil(c => c !== undefined && c !== ':' && !/\s/.test(c));
}

const decodeString = (reader) => {
    const quote = reader.read();
    let result = "";
    let escaped = false;

    while (true) {
        const char = reader.read();
        if (escaped) {
            result += char;
            escaped = false;
        } else if (char === "\\") {
            escaped = true;
        } else if (char === quote) {
            return result;
        } else {
            result += char;
        }
    }
}

const booleanByteKeys = new Set([
    "ambient",
    "dungeon_potion",
    "dontsavetoprofile",
    "enhanced",
    "extended",
    "hypixelpopulated",
    "minecraft:enchantment_glint_override",
    "overridemeta",
    "rift_transferred",
    "should_give_alchemy_exp",
    "show_icon",
    "show_particles",
    "splash",
    "unbreakable",
]);

const isBooleanByte = (reader, token) => {
    if (!/^[01][bB]$/.test(token)) return false;
    if (reader.typedArrayDepth > 0) return false;

    const key = reader.keyStack.at(-1);
    return key === undefined || booleanByteKeys.has(key.toLowerCase());
}

const decodeScalar = (reader) => {
    const token = reader.readUntil(c => c !== undefined && !/\s/.test(c) && c !== ',' && c !== ']' && c !== '}');
    if (token === "") throw new Error(`Expected scalar at index ${reader.index}`);

    if (token === "true") return true;
    if (token === "false") return false;
    if (isBooleanByte(reader, token)) return token[0] === "1";

    const numberMatch = token.match(/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[eE][+-]?\d+)?[bBsSlLfFdD]?$/);
    if (numberMatch) {
        return parseFloat(token.replace(/[bBsSlLfFdD]$/, ""));
    }

    return token;
}

/**
 *
 * @param input {string}
 */
export const decode = (input) => {
    const reader = input instanceof Reader ? input : new Reader(input);

    reader.skipWhitespace();
    if (reader.peek() === '{') {
        return decodeObject(reader);
    } else if (reader.peek() === '[') {
        return decodeArray(reader);
    } else if (reader.peek() === '"' || reader.peek() === "'") {
        return decodeString(reader);
    } else {
        return decodeScalar(reader);
    }
}
