'use strict';

const IOBuffer = require('iobuffer');

const defaultOptions = {
    headerOnly: false
};

// Grammar constants
const STREAMING = 4294967295;
const ZERO = 0;
const NC_DIMENSION = 10;

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
    let header = {version: version};

    // Length of record dimension
    header.recordDimension = buffer.readUint32();
    if (header.recordDimension === STREAMING) {
        header.recordDimension = Number.Infinity;
    }

    let dimList = buffer.readUint32();
    if (dimList === ZERO) {
        notNetcdf((buffer.readUint32() !== ZERO), 'list shouldn\'t be present');
    } else {
        notNetcdf((dimList !== NC_DIMENSION), 'tag for list of dimensions missing');

        // Length of dimensions
        const dimensionSize = buffer.readUint32();
        header.dimensions = new Array(dimensionSize);
        for (var dim = 0; dim < dimensionSize; dim++) {
            // Read name length
            let nameLength = buffer.readUint32();

            // Read name
            let name = buffer.readChars(nameLength);

            // Apply padding
            if ((nameLength % 4) !== 0) {
                buffer.skip(4 - (nameLength % 4));
            }

            // validate name


            // Read dimension size
            let size = buffer.readUint32();
            header.dimensions[dim] = {
                name: name,
                size: size
            };
        }
    }

    if (options.headerOnly) {
        return header;
    }

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

module.exports = netcdf;
