'use strict';

const utils = require('./utils');

// Grammar constants
const STREAMING = 4294967295;
const ZERO = 0;
const NC_DIMENSION = 10;
const NC_VARIABLE = 11;
const NC_ATTRIBUTE = 12;

/**
 * Read the header of the file
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {object} - Object with the fields:
 *  * `recordDimension`: Number with the length of record dimension
 *  * `dimensions`: List of dimensions
 *  * `globalAttributes`: List of global attributes
 *  * `variables`: List of variables
 */
function header(buffer) {
    // Length of record dimension
    var header = {recordDimension: buffer.readUint32()};
    if (header.recordDimension === STREAMING) {
        header.recordDimension = Number.Infinity;
    }

    // List of dimensions
    header.dimensions = dimensionsList(buffer);

    // List of global attributes
    header.globalAttributes = attributesList(buffer);

    // List of variables
    header.variables = variablesList(buffer);

    return header;
}

/**
 * List of dimensions
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {Array<object>} - List of dimensions with:
 *  * `name`: String with the name of the dimension
 *  * `size`: Number with the size of the dimension
 */
function dimensionsList(buffer) {
    const dimList = buffer.readUint32();
    if (dimList === ZERO) {
        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of dimensions');
        return [];
    } else {
        utils.notNetcdf((dimList !== NC_DIMENSION), 'wrong tag for list of dimensions');

        // Length of dimensions
        const dimensionSize = buffer.readUint32();
        var dimensions = new Array(dimensionSize);
        for (var dim = 0; dim < dimensionSize; dim++) {
            // Read name
            var name = utils.readName(buffer);

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
 * List of attributes
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {Array<object>} - List of attributes with:
 *  * `name`: String with the name of the attribute
 *  * `type`: String with the type of the attribute
 *  * `value`: A number or string with the value of the attribute
 */
function attributesList(buffer) {
    const gAttList = buffer.readUint32();
    if (gAttList === ZERO) {
        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of attributes');
        return [];
    } else {
        utils.notNetcdf((gAttList !== NC_ATTRIBUTE), 'wrong tag for list of attributes');

        // Length of attributes
        const attributeSize = buffer.readUint32();
        var attributes = new Array(attributeSize);
        for (var gAtt = 0; gAtt < attributeSize; gAtt++) {
            // Read name
            var name = utils.readName(buffer);

            // Read type
            var type = buffer.readUint32();
            utils.notNetcdf(((type < 1) && (type > 6)), 'non valid type ' + type);

            // Read attribute
            var size = buffer.readUint32();
            var value = utils.readType(buffer, type, size);

            // Apply padding
            utils.padding(buffer);

            attributes[gAtt] = {
                name: name,
                type: utils.evalType(type),
                value: value
            };
        }
    }
    return attributes;
}

/**
 * List of variables
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {Array<object>} - List of variables with:
 *  * `name`: String with the name of the variable
 *  * `dimensions`: Array with the dimension IDs of the variable
 *  * `attributes`: Array with the attributes of the variable
 *  * `type`: String with the type of the variable
 *  * `size`: Number with the size of the variable
 *  * `offset`: Number with the offset where of the variable begins
 */
function variablesList(buffer) {
    const varList = buffer.readUint32();
    if (varList === ZERO) {
        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of variables');
        return [];
    } else {
        utils.notNetcdf((varList !== NC_VARIABLE), 'wrong tag for list of variables');

        // Length of variables
        const variableSize = buffer.readUint32();
        var variables = new Array(variableSize);
        for (var v = 0; v < variableSize; v++) {
            // Read name
            var name = utils.readName(buffer);

            // Read dimensionality of the variable
            const dimensionality = buffer.readUint32();

            // Index into the list of dimensions
            var dimensionsIds = new Array(dimensionality);
            for (var dim = 0; dim < dimensionality; dim++) {
                dimensionsIds[dim] = buffer.readUint32();
            }

            // Read variables size
            var attributes = attributesList(buffer);

            // Read type
            var type = buffer.readUint32();
            utils.notNetcdf(((type < 1) && (type > 6)), 'non valid type ' + type);

            // Read variable size
            // The 32-bit varSize field is not large enough to contain the size of variables that require
            // more than 2^32 - 4 bytes, so 2^32 - 1 is used in the varSize field for such variables.
            const varSize = buffer.readUint32();

            // Read offset
            // TODO change it for supporting 64-bit
            const offset = buffer.readUint32();

            variables[v] = {
                name: name,
                dimensions: dimensionsIds,
                attributes: attributes,
                type: utils.evalType(type),
                size: varSize,
                offset: offset
            };
        }
    }
    return variables;
}

module.exports = header;
