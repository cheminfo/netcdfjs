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
 * @return {*}
 */
function readType(buffer, type, size) {
    switch (type) {
        case 1:
            return buffer.readBytes(size);
        case 2:
            return buffer.readChars(size);
        case 3:
            notNetcdf((size !== 1), 'wrong size for NC_SHORT ' + size);
            return buffer.readInt16();
        case 4:
            notNetcdf((size !== 1), 'wrong size for NC_INT ' + size);
            return buffer.readInt32();
        case 5:
            notNetcdf((size !== 1), 'wrong size for NC_FLOAT ' + size);
            return buffer.readFloat32();
        case 6:
            notNetcdf((size !== 1), 'wrong size for NC_DOUBLE ' + size);
            return buffer.readFloat64();
        default:
            notNetcdf(true, 'non valid type ' + type);
            return undefined;
    }
}

module.exports.notNetcdf = notNetcdf;
module.exports.evalType = evalType;
module.exports.padding = padding;
module.exports.readType = readType;
