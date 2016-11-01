'use strict';

const utils = require('./utils');
const types = require('./types');

// Grammar constants
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
    // sum of the varSize's of all the record variables.
    var header = {recordDimension: {length: buffer.readUint32()}};

    // List of dimensions
    var dimList = dimensionsList(buffer);
    header.recordDimension.id = dimList.recordId;
    header.recordDimension.name = dimList.recordName;
    header.dimensions = dimList.dimensions;

    // List of global attributes
    header.globalAttributes = attributesList(buffer);

    // List of variables
    var variables = variablesList(buffer, dimList.recordId);
    header.variables = variables.variables;
    header.recordDimension.recordStep = variables.recordStep;

    return header;
}

/**
 * List of dimensions
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {object} - List of dimensions and record dimension with:
 *  * `name`: String with the name of the dimension
 *  * `size`: Number with the size of the dimension
 */
function dimensionsList(buffer) {
    var recordId, recordName;
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
            if (size === 0) {
                recordId = dim;
                recordName = name;
            }

            dimensions[dim] = {
                name: name,
                size: size
            };
        }
    }
    return {
        dimensions: dimensions,
        recordId: recordId,
        recordName: recordName
    };
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
            utils.notNetcdf(((type < 1) || (type > 6)), 'non valid type ' + type);

            // Read attribute
            var size = buffer.readUint32();
            var value = types.readType(buffer, type, size);

            // Apply padding
            utils.padding(buffer);

            attributes[gAtt] = {
                name: name,
                type: types.num2str(type),
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
 * @param {number} recordId - Id if the record dimension
 * @return {object} - Number of recordStep and list of variables with:
 *  * `name`: String with the name of the variable
 *  * `dimensions`: Array with the dimension IDs of the variable
 *  * `attributes`: Array with the attributes of the variable
 *  * `type`: String with the type of the variable
 *  * `size`: Number with the size of the variable
 *  * `offset`: Number with the offset where of the variable begins
 *  * `record`: True if is a record variable, false otherwise
 */
function variablesList(buffer, recordId) {
    const varList = buffer.readUint32();
    var recordStep = 0;
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

            // Count amount of record variables
            if (dimensionsIds[0] === recordId) {
                recordStep += varSize;
            }

            variables[v] = {
                name: name,
                dimensions: dimensionsIds,
                attributes: attributes,
                type: types.num2str(type),
                size: varSize,
                offset: offset,
                record: (dimensionsIds[0] === recordId)
            };
        }
    }

    return {
        variables: variables,
        recordStep: recordStep
    };
}

module.exports = header;
