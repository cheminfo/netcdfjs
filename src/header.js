'use strict';

const utils = require('./utils');

// Grammar constants
const STREAMING = 4294967295;
const ZERO = 0;
const NC_DIMENSION = 10;
//const NC_VARIABLE = 11;
const NC_ATTRIBUTE = 12;

/**
 * Read the header of the file
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} version - 1 for classic format, 2 for 64-bit offset format
 * @return {{version: *}}
 */
function header(buffer, version) {
    var header = {version: version};

    // Length of record dimension
    header.recordDimension = buffer.readUint32();
    if (header.recordDimension === STREAMING) {
        header.recordDimension = Number.Infinity;
    }

    // List of dimensions
    header.dimensions = dimensionsList(buffer);

    // List of global attributes
    header.globalAttributes = globalAttributesList(buffer);

    return header;
}

/**
 * List of dimensions
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {Array<object>} - List of dimensions with:
 *  * `name`: String with the name of the dimension
 *  * `size`: Number with the size of the dimension
 */
function dimensionsList(buffer) {
    const dimList = buffer.readUint32();
    if (dimList === ZERO) {
        utils.notNetcdf((buffer.readUint32() !== ZERO), 'list of dimensions should be empty');
    } else {
        utils.notNetcdf((dimList !== NC_DIMENSION), 'tag for list of dimensions missing');

        // Length of dimensions
        const dimensionSize = buffer.readUint32();
        var dimensions = new Array(dimensionSize);
        for (var dim = 0; dim < dimensionSize; dim++) {
            // Read name length
            var nameLength = buffer.readUint32();

            // Read name
            var name = buffer.readChars(nameLength);

            // validate name
            // TODO

            // Apply padding
            utils.padding(buffer);

            // Read dimension size
            const size = buffer.readUint32();
            dimensions[dim] = {
                name: name,
                size: size
            };
        }
    }
    return dimensions;
}

/**
 * List of global attributes
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {Array<object>} - List of global attributes with:
 *  * `name`: String with the name of the global attribute
 *  * `type`: String with the type of the global attribute
 *  * `value`: A number or string with the value of the global attribute
 */
function globalAttributesList(buffer) {
    const gAttList = buffer.readUint32();
    if (gAttList === ZERO) {
        utils.notNetcdf((buffer.readUint32() !== ZERO), 'list of global attributes should be empty');
    } else {
        utils.notNetcdf((gAttList !== NC_ATTRIBUTE), 'tag for list of global attributes missing');

        // Length of attributes
        const globalAttributeSize = buffer.readUint32();
        var globalAttributes = new Array(globalAttributeSize);
        for (var gAtt = 0; gAtt < globalAttributeSize; gAtt++) {
            // Read name length
            var nameGAttLength = buffer.readUint32();

            // Read name
            var nameGAtt = buffer.readChars(nameGAttLength);

            // validate name
            // TODO

            // Apply padding
            utils.padding(buffer);

            // Read type
            var typeGAtt = buffer.readUint32();
            utils.notNetcdf(((typeGAtt < 1) && (typeGAtt > 6)), 'non valid type ' + typeGAtt);

            // Read attribute
            var sizeGAtt = buffer.readUint32();
            var valGAtt = utils.readType(buffer, typeGAtt, sizeGAtt);

            // Apply padding
            utils.padding(buffer);

            globalAttributes[gAtt] = {
                name: nameGAtt,
                type: utils.evalType(typeGAtt),
                value: valGAtt
            };
        }
    }
    return globalAttributes;
}

module.exports = header;
