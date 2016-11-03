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
 * Parse a number type identifier to his size in bytes
 * @ignore
 * @param {number} type - integer that represents the type
 * @return {number} -size of the type
 */
function num2bytes(type) {
    switch (Number(type)) {
        case types.BYTE:
            return 1;
        case types.CHAR:
            return 1;
        case types.SHORT:
            return 2;
        case types.INT:
            return 4;
        case types.FLOAT:
            return 4;
        case types.DOUBLE:
            return 8;
        /* istanbul ignore next */
        default:
            return -1;
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
 * Auxiliary function to read numeric data
 * @ignore
 * @param {number} size - Size of the element to read
 * @param {function} bufferReader - Function to read next value
 * @return {Array<number>|number}
 */
function readNumber(size, bufferReader) {
    if (size !== 1) {
        var numbers = new Array(size);
        for (var i = 0; i < size; i++) {
            numbers[i] = bufferReader();
        }
        return numbers;
    } else {
        return bufferReader();
    }
}

/**
 * Given a type and a size reads the next element
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} type - Type of the data to read
 * @param {number} size - Size of the element to read
 * @return {string|Array<number>|number}
 */
function readType(buffer, type, size) {
    switch (type) {
        case types.BYTE:
            return buffer.readBytes(size);
        case types.CHAR:
            return trimNull(buffer.readChars(size));
        case types.SHORT:
            return readNumber(size, buffer.readInt16.bind(buffer));
        case types.INT:
            return readNumber(size, buffer.readInt32.bind(buffer));
        case types.FLOAT:
            return readNumber(size, buffer.readFloat32.bind(buffer));
        case types.DOUBLE:
            return readNumber(size, buffer.readFloat64.bind(buffer));
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
module.exports.num2bytes = num2bytes;
module.exports.str2num = str2num;
module.exports.readType = readType;
