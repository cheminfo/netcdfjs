'use strict';

/**
 * Throws a non-valid NetCDF exception if the statement it's true
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
 * @param {number} type - integer that represents the type
 * @return {string} - parsed value of the type
 */
function evalType(type) {
    switch (type) {
        case 1:
            return 'byte';
        case 2:
            return 'char';
        case 3:
            return 'short';
        case 4:
            return 'int';
        case 5:
            return 'float';
        case 6:
            return 'double';
        default:
            return 'undefined';
    }
}

/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 * @param {IOBuffer} buffer - Buffer for the file data
 */
function padding(buffer) {
    if ((buffer.offset % 4) !== 0) {
        buffer.skip(4 - (buffer.offset % 4));
    }
}

/**
 * Given a type and a size reads the next element
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} type - Type of the data to read
 * @param {number} size - Size of the element to read
 * @return {string|Array<number>}
 */
function readType(buffer, type, size) {
    switch (type) {
        case 1:
            return buffer.readBytes(size);
        case 2:
            return buffer.readChars(size);
        case 3:
            var short = new Array(size);
            for (var s = 0; s < size; s++) {
                short[s] = buffer.readInt16();
            }
            return short;
        case 4:
            var int = new Array(size);
            for (var i = 0; i < size; i++) {
                int[i] = buffer.readInt32();
            }
            return int;
        case 5:
            var float32 = new Array(size);
            for (var f = 0; f < size; f++) {
                float32[f] = buffer.readFloat32();
            }
            return float32;
        case 6:
            var float64 = new Array(size);
            for (var g = 0; g < size; g++) {
                float64[g] = buffer.readFloat64();
            }
            return float64;
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}


/**
 * Reads the name
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

module.exports.notNetcdf = notNetcdf;
module.exports.evalType = evalType;
module.exports.padding = padding;
module.exports.readType = readType;
module.exports.readName = readName;
