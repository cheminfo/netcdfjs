'use strict';

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
 * Checks if the value is an integer greater than zero
 * @ignore
 * @param {any} value - value to be checked
 * @return {boolean} - true if it is a positive integer, false otherwise
 */
function isPositiveInteger(value) {
    return typeof value === 'number' && !isNaN(value) && value >= 0;
}

module.exports.notNetcdf = notNetcdf;
module.exports.padding = padding;
module.exports.readName = readName;
module.exports.isPositiveInteger = isPositiveInteger;
