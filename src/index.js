'use strict';

const IOBuffer = require('iobuffer');

function netcdf(data) {
    const buffer = new IOBuffer(data);

    // Validate that it's a NetCDF file
    notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');

    // Check the NetCDF format
    const version = buffer.readByte();
    notNetcdf((version === 2), '64-bit offset format not supported yet');
    notNetcdf((version !== 1), 'unknown version');

    return buffer.length;
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
