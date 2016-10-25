'use strict';

const IOBuffer = require('iobuffer');
const utils = require('./utils');
const readHeader = require('./header');

class NetCDFReader {

    /**
     * Reads a NetCDF v3.x file
     * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
     * @param {ArrayBuffer} data
     * @constructor
     */
    constructor(data) {
        const buffer = new IOBuffer(data);
        buffer.setBigEndian();

        // Validate that it's a NetCDF file
        utils.notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');

        // Check the NetCDF format
        const version = buffer.readByte();
        utils.notNetcdf((version === 2), '64-bit offset format not supported yet');
        utils.notNetcdf((version !== 1), 'unknown version');

        // Read the header
        this.header = readHeader(buffer);
        this.header.version = version;
    }

    get version() {
        return this.header.version;
    }

    get recordDimension() {
        return this.header.recordDimension;
    }

    get dimensions() {
        return this.header.dimensions;
    }

    get globalAttributes() {
        return this.header.globalAttributes;
    }

    get variables() {
        return this.header.variables;
    }
}

module.exports = NetCDFReader;
