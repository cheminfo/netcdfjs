'use strict';

const types = require('./types');

/**
 * Throws a non-valid NetCDF exception if the statement it's true
 * @ignore
 * @param {boolean} statement - Throws if true
 * @param {string} reason - Reason to throw
 */
function notNetcdf(statement, reason) {
    if (statement) {
        throw new TypeError('Not a valid NetCDF v3.x file: ' + reason);
    }
}

/**
 * Parse a number into their respective type
 * @ignore
 * @param {number} type - integer that represents the type
 * @return {string} - parsed value of the type
 */
function evalType(type) {
    switch (type) {
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
        default:
            return 'undefined';
    }
}

/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 */
function padding(buffer) {
    if ((buffer.offset % 4) !== 0) {
        buffer.skip(4 - (buffer.offset % 4));
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
            var short = new Array(size);
            for (var s = 0; s < size; s++) {
                short[s] = buffer.readInt16();
            }
            return short;
        case types.INT:
            var int = new Array(size);
            for (var i = 0; i < size; i++) {
                int[i] = buffer.readInt32();
            }
            return int;
        case types.FLOAT:
            var float32 = new Array(size);
            for (var f = 0; f < size; f++) {
                float32[f] = buffer.readFloat32();
            }
            return float32;
        case types.DOUBLE:
            var float64 = new Array(size);
            for (var g = 0; g < size; g++) {
                float64[g] = buffer.readFloat64();
            }
            return float64;
        /* istanbul ignore next */
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}


/**
 * Reads the name
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {string} - Name
 */
function readName(buffer) {
    // Read name
    var nameLength = buffer.readUint32();
    var name = buffer.readChars(nameLength);

    // validate name
    // TODO

    // Apply padding
    padding(buffer);
    return name;
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

module.exports.notNetcdf = notNetcdf;
module.exports.evalType = evalType;
module.exports.padding = padding;
module.exports.readType = readType;
module.exports.readName = readName;
