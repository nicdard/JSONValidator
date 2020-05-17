const isWhiteSpace = char =>
    char === '\u0020'
    || char === '\u000A'
    || char === '\u000D'
    || char === '\u0009';

const keywordsMap = {
    '[': 'array_opening',
    ']': 'array_closing',
    '{': 'object_opening',
    '}': 'object_closing',
    ',': 'comma',
    ':': 'colon'
};

const isCharacter = (char, expected) => char === expected;

const isKeyword = char => keywordsMap[char] != null;

const isZero = char => isCharacter(char, '0');
const isOneNine = char => char >= '1' && char <= '9';
const isDigit = char => isZero(char) || isOneNine(char);
const isExp = char => isCharacter(char, 'e') || isCharacter(char, 'E');
const isFractional = char => isCharacter(char, '.');
const isMinus = char => isCharacter(char, '-');
const isPlus = char => isCharacter(char, '+');

const isStringDelimiter = char => isCharacter(char, '"');
const isEscapable = char =>
    isCharacter(char, '"')
    || isCharacter(char, 't')
    || isCharacter(char, 'n')
    || isCharacter(char, 'r')
    || isCharacter(char, 'f')
    || isCharacter(char, 'b')
    || isCharacter(char, '/')
    || isCharacter(char, '\\');
const isUnicodePrefix = char => isCharacter(char, 'u');
const isHex = char =>
    isDigit(char)
    || (char >= 'A' && char <= 'F')
    || (char >= 'a' && char <= 'f');

const unrecognisedError = (char, state, index) => { throw new Error(`Unexpected char  ${char} at ${index} in ${state}`)};

const transition = ({state, tokens, current}, char, index) => {
    switch (state) {
        case 'all':
            // Push the token and reset current.
            if (current !== '') {
                tokens.push(current);
                current = '';
            }
            if (isWhiteSpace(char)) {
                // Ignore initial and trailing white spaces.
            } else if (isKeyword(char)) {
                tokens.push(keywordsMap[char]);
            } else if (isStringDelimiter(char)) {
                tokens.push('string_delimiter');
                state = 'string';
            } else if (isCharacter(char, 't')) {
                current += 't';
                state = 'true1';
            } else if (isCharacter(char, 'f')) {
                current += 'f';
                state = 'false1';
            } else if (isCharacter(char, 'n')) {
                current += 'n';
                state = 'null1';
            } else if (isZero(char)) {
                current += char;
                state = 'number3';
            } else if (isOneNine(char)) {
                current += char;
                state = 'number2'
            } else if (isMinus(char)) {
                current += char;
                state = 'number1';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'true1':
            if (isCharacter(char, 'r')) {
                current += char;
                state = 'true2';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'true2':
            if (isCharacter(char, 'u')) {
                current += char;
                state = 'true3';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'true3':
            if (isCharacter(char,'e')) {
                current += char;
                state = 'all';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'null1':
            if (isCharacter(char, 'u')) {
                current += char;
                state = 'null2';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'null2':
            if (isCharacter(char, 'l')) {
                current += char;
                state = 'null3';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'null3':
            if (isCharacter(char, 'l')) {
                current += char;
                state = 'all';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'false1':
            if (isCharacter(char, 'a')) {
                current += char;
                state = 'false2';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'false2':
            if (isCharacter(char,'l')) {
                current += char;
                state = 'false3';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'false3':
            if (isCharacter(char,'s')) {
                current += char;
                state = 'false4';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'false4':
            if (isCharacter(char, 'e')) {
                current += char;
                state = 'all';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'number1':
            if (isOneNine(char)) {
                current += char;
                state = 'number2';
            } else if (isZero(char)) {
                current += char;
                state = 'number3';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'number2':
            if (isDigit(char)) {
                current += char;
                state = 'number2';
            } else if (isFractional(char)) {
                current += char;
                state = 'numberF1';
            } else if (isExp(char)) {
                current += char;
                state = 'numberExp';
            } else {
                state = 'all';
                return transition({state, tokens, current}, char, ++index);
            }
            break;
        case 'number3':
            if (isExp(char)) {
                current += char;
                state = 'numberExp';
            } else if (isFractional(char)) {
                current += char;
                state = 'numberF0';
            } else {
                state = 'all';
                return transition({state, tokens, current}, char, ++index);
            }
            break;
        case 'numberF0':
            if (isDigit(char)) {
                current += char;
                state = 'numberF1';
            } else if (isExp(char)) {
                state = 'numberExp';
                current += char;
            } else {
                unrecognisedError(char, state, ++index);
            }
            break;
        case "numberF1":
            if (isDigit(char)) {
                current += char;
            } else if (isExp(char)) {
                current += char;
                state = 'numberExp';
            } else {
                state = 'all';
                return transition({state, tokens, current}, char, ++index);
            }
            break;
        case 'numberExp':
            if (isDigit(char)) {
                state = 'numberExpN';
                current += char;
            } else if (isMinus(char) || isPlus(char)) {
                state = 'numberExpS';
                current += char;
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'numberExpS':
            if (isDigit(char)) {
                state = 'numberExpN';
                current += char;
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case 'numberExpN':
            if (isDigit(char)) {
                current += char;
            } else {
                state = 'all';
                return transition({state, tokens, current}, char, index);
            }
            break;
        case 'string':
            if (isStringDelimiter(char)) {
                state = 'all';
                if (current !== '') {
                    tokens.push(current);
                    current = '';
                }
                tokens.push('string_delimiter');
            } else if (isCharacter(char, '\\')) {
                state = 'stringEscape';
                current += char;
            } else {
                current += char;
            }
            break;
        case "stringEscape":
            if (isEscapable(char)) {
                current += char;
                state = 'string';
            } else if (isUnicodePrefix(char)) {
                current += char;
                state = 'unicode1';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case "unicode1":
            if (isHex(char)) {
                current += char;
                state = 'unicode2';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case "unicode2":
            if (isHex(char)) {
                current += char;
                state = 'unicode3';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case "unicode3":
            if (isHex(char)) {
                current += char;
                state = 'unicode4';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        case "unicode4":
            if (isHex(char)) {
                current += char;
                state = 'all';
            } else {
                unrecognisedError(char, state, index);
            }
            break;
        default:
            throw new Error("Unknown state");
    }
    return {state, tokens, current};
};

const lex = str => str
    .split('')
    .reduce((acc, char, index) => {
        const t = transition(acc, char, index);
        if (t.current !== '' && index === str.length - 1) {
            t.tokens.push(t.current);
        }
        return t;
    }, {state: 'all', tokens: [], current: ''})
    .tokens;


const JSONNumber = Symbol('number');
const JSONString = Symbol('string');
const JSONNull = Symbol('null');
const JSONBoolean = Symbol('boolean');
const JSONArray = Symbol('array');
const JSONObject = Symbol('object');

const parse = tokens => {
    let c = 0;

    const peek = () => tokens[c];
    const consume = () => tokens[c++];

    const parseNum = () => ({ val: Number(consume()), type: JSONNumber });
    const parseBoolean = () => ({ val: consume() === 'true', type: JSONBoolean });
    const parseNull = () => { consume(); return ({ val: null, type: JSONNull }); };
    const parseString = () => {
        const opening = consume();
        const val = consume();
        const closing = peek();
        if (opening === 'string_delimiter' && closing === 'string_delimiter') {
            // Consume the closing delimiter.
            consume();
            return ({ val, type: JSONString });
        } else if (opening === 'string_delimiter' && val === 'string_delimiter') {
            // The empty string.
            return ({ val: '', type: JSONString });
        } else throw new Error(`Malformed JSON: Invalid tokens ${opening} ${closing} as delimiters for string value ${val}`);
    };

    const parseArray = () => {
        // Consume array_opening.
        consume();
        // Create an array node.
        const node = {val: [], type: JSONArray};
        if (peek() !== 'array_closing') {
            // Add first value to the array
            node.val.push(parseExpr());
            while (peek() !== 'array_closing') {
                // Check if values are comma separated.
                const delimiter = consume();
                if (delimiter === 'comma') {
                    node.val.push(parseExpr());
                } else {
                    throw new Error(`Malformed Array expression, expected comma but found ${delimiter}`);
                }
            }
        }
        // Consume array_closing.
        consume();
        return node;
    };

    const parseAttribute = () => {
        const key = parseString();
        const colon = consume();
        if (colon !== 'colon') throw new Error(`Expected colon but got token ${colon} while parsing an object attribute`);
        const value = parseExpr();
        return {key, value};
    };

    const parseObject = () => {
        // eliminate opening.
        consume();
        // create object node.
        const node = { val: {}, type: JSONObject };
        if (peek() !== 'object_closing') {
            const {key, value} = parseAttribute();
            node.val[key.val] = value;
            while (peek() !== 'object_closing') {
                // Check if values are comma separated.
                const delimiter = consume();
                if (delimiter === 'comma') {
                    const {key, value} = parseAttribute();
                    node.val[key.val] = value;
                } else {
                    throw new Error(`Malformed Array expression, expected comma but found ${delimiter}`);
                }
            }
        }
        // remove object_closing
        consume();
        return node;
    };

    const parseExpr = () => {
        if (peek() === 'object_opening') {
            return parseObject();
        } else if (peek() === 'array_opening') {
            return parseArray();
        } else if (peek() === 'string_delimiter') {
            return parseString();
        } else if (/-?[0-9]+(?:\.?[0-9]+)?(?:[e|E]?[+|-][0-9]+)?/g.test(peek())) {
            return parseNum();
        } else if (peek() === 'true' || peek() === 'false') {
            return parseBoolean();
        } else if (peek() === 'null') {
            return parseNull();
        } else {
            throw new Error(`Unexpected token ${peek()}`);
        }
    };

    const ast = parseExpr();
    if (tokens.length !== c) {
        throw new Error("Unexpected tokens at the end of the text.");
    } else return ast;
};

const transpileToJS = ast => {
    const evaluateNode = ({val, type}) => {
        switch (type) {
            case JSONObject:
                const jsObject = {};
                for (const key in val) {
                    if (val.hasOwnProperty(key)) {
                        // Replace each attribute ast with its evaluation.
                        jsObject[key] = evaluateNode(val[key]);
                    }
                }
                return jsObject;
            case JSONArray:
                return val.map(node => evaluateNode(node));
            case JSONBoolean:
            case JSONNumber:
            case JSONNull:
            case JSONString:
                return val;
            default:
                throw new Error("Unknown node AST type.");
        }
    };
    return evaluateNode(ast);
};

const validateJSON = (json) => {
    let isValid = false;
    try {
        parse(lex(json));
        isValid = true;
    } catch (error) {
        console.error(error.message)
    }
    return isValid;
};

console.log(transpileToJS(parse(lex('["12", 1, false, true, [12, {"a": 12}]]'))));

