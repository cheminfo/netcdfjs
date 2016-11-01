'use strict';

const notNetcdf = require('./utils').notNetcdf;

const types = {
    BYTE: 1,
    CHAR: 2,
    SHORT: 3,
    INT: 4,
    FLOAT: 5,
    DOUBLE: 6
};

/**
 * Parse a number into their respective type
 * @ignore
 * @param {number} type - integer that represents the type
 * @return {string} - parsed value of the type
 */
function num2str(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 'byte';
        case types.CHAR:
            return 'char';
        case types.SHORT:
            return 'short';
        case types.INT:
            return 'int';
        case types.FLOAT:
            return 'float';
        case types.DOUBLE:
            return 'double';
        /* istanbul ignore next */
        default:
            return 'undefined';
    }
}

/**
 * Reverse search of num2str
 * @ignore
 * @param {string} type - string that represents the type
 * @return {number} - parsed value of the type
 */
function str2num(type) {
    switch (String(type)) {
        case 'byte':
            return types.BYTE;
        case 'char':
            return types.CHAR;
        case 'short':
            return types.SHORT;
        case 'int':
            return types.INT;
        case 'float':
            return types.FLOAT;
        case 'double':
            return types.DOUBLE;
        /* istanbul ignore next */
        default:
            return -1;
    }
}

/**
 * Given a type and a size reads the next element
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} type - Type of the data to read
 * @param {number} size - Size of the element to read
 * @return {string|Array<number>}
 */
function readType(buffer, type, size) {
    switch (type) {
        case types.BYTE:
            return buffer.readBytes(size);
        case types.CHAR:
            return trimNull(buffer.readChars(size));
        case types.SHORT:
            if (size !== 1) {
                var short = new Array(size);
                for (var s = 0; s < size; s++) {
                    short[s] = buffer.readInt16();
                }
                return short;
            } else {
                return buffer.readInt16();
            }
        case types.INT:
            if (size !== 1) {
                var int = new Array(size);
                for (var i = 0; i < size; i++) {
                    int[i] = buffer.readInt32();
                }
                return int;
            } else {
                return buffer.readInt32();
            }
        case types.FLOAT:
            if (size !== 1) {
                var float32 = new Array(size);
                for (var f = 0; f < size; f++) {
                    float32[f] = buffer.readFloat32();
                }
                return float32;
            } else {
                return buffer.readFloat32();
            }
        case types.DOUBLE:
            if (size !== 1) {
                var float64 = new Array(size);
                for (var g = 0; g < size; g++) {
                    float64[g] = buffer.readFloat64();
                }
                return float64;
            } else {
                return buffer.readFloat64();
            }
        /* istanbul ignore next */
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}

/**
 * Removes null terminate value
 * @ignore
 * @param {string} value - String to trim
 * @return {string} - Trimmed string
 */
function trimNull(value) {
    if (value.charCodeAt(value.length - 1) === 0) {
        return value.substring(0, value.length - 1);
    }
    return value;
}

module.exports = types;
module.exports.num2str = num2str;
module.exports.str2num = str2num;
module.exports.readType = readType;
