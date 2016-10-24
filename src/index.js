'use strict';

const IOBuffer = require('iobuffer');

const defaultOptions = {
    headerOnly: false
};

// Grammar constants
const STREAMING = 4294967295;
const ZERO = 0;
const NC_DIMENSION = 10;
//const NC_VARIABLE = 11;
const NC_ATTRIBUTE = 12;

/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 * @param {ArrayBuffer} data
 * @param {object} [options] - Object options
 * @param {boolean} [options.headerOnly = false] - Returns only the header
 * @return {*}
 */
function netcdf(data, options) {
    options = Object.assign({}, defaultOptions, options);
    const buffer = new IOBuffer(data);
    buffer.setBigEndian();

    // Validate that it's a NetCDF file
    notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');

    // Check the NetCDF format
    const version = buffer.readByte();
    notNetcdf((version === 2), '64-bit offset format not supported yet');
    notNetcdf((version !== 1), 'unknown version');

    // Read the header
    var header = {version: version};

    // Length of record dimension
    header.recordDimension = buffer.readUint32();
    if (header.recordDimension === STREAMING) {
        header.recordDimension = Number.Infinity;
    }

    // List of dimensions
    const dimList = buffer.readUint32();
    if (dimList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'list of dimensions should be empty');
    } else {
        notNetcdf((dimList !== NC_DIMENSION), 'tag for list of dimensions missing');

        // Length of dimensions
        const dimensionSize = buffer.readUint32();
        header.dimensions = new Array(dimensionSize);
        for (var dim = 0; dim < dimensionSize; dim++) {
            // Read name length
            var nameDimLength = buffer.readUint32();

            // Read name
            var nameDim = buffer.readChars(nameDimLength);

            // validate name
            // TODO

            // Apply padding
            if ((buffer.offset % 4) !== 0) {
                buffer.skip(4 - (buffer.offset % 4));
            }

            // Read dimension size
            const sizeDim = buffer.readUint32();
            header.dimensions[dim] = {
                name: nameDim,
                size: sizeDim
            };
        }
    }

    // List of global attributes
    const gAttList = buffer.readUint32();
    if (gAttList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'list of global attributes should be empty');
    } else {
        notNetcdf((gAttList !== NC_ATTRIBUTE), 'tag for list of global attributes missing');

        // Length of attributes
        const globalAttributeSize = buffer.readUint32();
        header.globalAttributes = new Array(globalAttributeSize);
        for (var gAtt = 0; gAtt < globalAttributeSize; gAtt++) {
            // Read name length
            var nameGAttLength = buffer.readUint32();

            // Read name
            var nameGAtt = buffer.readChars(nameGAttLength);

            // validate name
            // TODO

            // Apply padding
            if ((buffer.offset % 4) !== 0) {
                buffer.skip(4 - (buffer.offset % 4));
            }

            // Read type
            var typeGAtt = buffer.readUint32();
            notNetcdf(((typeGAtt < 1) && (typeGAtt > 6)), 'non valid type ' + typeGAtt);

            // Read attribute
            var sizeGAtt = buffer.readUint32();
            var valGAtt;
            switch (typeGAtt) {
                case 1:
                    valGAtt = buffer.readBytes(sizeGAtt);
                    break;
                case 2:
                    valGAtt = buffer.readChars(sizeGAtt);
                    break;
                case 3:
                    notNetcdf((sizeGAtt !== 1), 'wrong size for NC_SHORT ' + sizeGAtt);
                    valGAtt = buffer.readInt16();
                    break;
                case 4:
                    notNetcdf((sizeGAtt !== 1), 'wrong size for NC_INT ' + sizeGAtt);
                    valGAtt = buffer.readInt32();
                    break;
                case 5:
                    notNetcdf((sizeGAtt !== 1), 'wrong size for NC_FLOAT ' + sizeGAtt);
                    valGAtt = buffer.readFloat32();
                    break;
                case 6:
                    notNetcdf((sizeGAtt !== 1), 'wrong size for NC_DOUBLE ' + sizeGAtt);
                    valGAtt = buffer.readFloat64();
                    break;
                default:
                    notNetcdf(true, 'non valid type ' + typeGAtt);
            }

            // Apply padding
            if ((buffer.offset % 4) !== 0) {
                buffer.skip(4 - (buffer.offset % 4));
            }

            header.globalAttributes[gAtt] = {
                name: nameGAtt,
                type: evalType(typeGAtt),
                value: valGAtt
            };
        }
    }

    if (options.headerOnly) {
        return header;
    }

    // Search other fields

    return {
        header: header,
        data: undefined
    };
}

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

module.exports = netcdf;
