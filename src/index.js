'use strict';

const IOBuffer = require('iobuffer');
const utils = require('./utils');
const readHeader = require('./header');

const defaultOptions = {
    headerOnly: false
};

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
    utils.notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');

    // Check the NetCDF format
    const version = buffer.readByte();
    utils.notNetcdf((version === 2), '64-bit offset format not supported yet');
    utils.notNetcdf((version !== 1), 'unknown version');

    // Read the header
    var header = readHeader(buffer, version);

    if (options.headerOnly) {
        return header;
    }

    // Search other fields

    return {
        header: header,
        data: undefined
    };
}

module.exports = netcdf;
