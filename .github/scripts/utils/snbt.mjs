class Reader {

    /**
     *
     * @param input {string}
     */
    constructor(input) {
        this.input = input;
        this.index = 0;
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
    while (reader.peek() !== '}') {
        const key = reader.readUntil(c => c !== ':');
        reader.expect(":");
        result[key] = decode(reader);
        reader.readIf(',');
    }
    reader.expect("}");
    return result;
}

const decodeArray = (reader) => {
    const result = [];

    reader.expect("[");
    while (reader.peek() !== ']') {
        const value = reader.readUntil(c => c !== ':' && c !== ',' && c !== ']');
        if (reader.peek() !== ':') {
            result.push(decode(value));
            reader.readIf(',');
        } else {
            reader.expect(":");
            result.push(decode(reader));
            reader.readIf(',');
        }
    }
    reader.expect("]");
    return result;
}

/**
 *
 * @param input {string}
 */
export const decode = (input) => {
    const reader = input instanceof Reader ? input : new Reader(input);

    if (reader.peek() === '{') {
        return decodeObject(reader);
    } else if (reader.peek() === '[') {
        return decodeArray(reader);
    } else if (reader.peek() === '"') {
        reader.expect('"');
        let skip = false;
        const result = reader.readUntil(c => {
            if (skip) {
                skip = false;
                return true;
            } else if (c === '\\') {
                skip = true;
                return true;
            }
            return c !== '"';
        });
        reader.expect('"');
        return result;
    } else {
        const digits = reader.readUntil(c => !isNaN(c) || c === '.' || c === '-');
        reader.readIf('b');
        reader.readIf('B');
        reader.readIf('s');
        reader.readIf('S');
        reader.readIf('l');
        reader.readIf('L');
        reader.readIf('f');
        reader.readIf('F');
        return parseFloat(digits);
    }
}