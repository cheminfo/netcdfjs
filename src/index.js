'use strict';

const IOBuffer = require('iobuffer');
const utils = require('./utils');
const data = require('./data');
const readHeader = require('./header');

/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 * @param {ArrayBuffer} data - ArrayBuffer or any Typed Array (including Node.js' Buffer from v4) with the data
 * @constructor
 */
class NetCDFReader {
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
        this.buffer = buffer;
    }

    /**
     * @return {string} - Version for the NetCDF format
     */
    get version() {
        if (this.header.version === 1) {
            return 'classic format';
        } else {
            return '64-bit offset format';
        }
    }

    /**
     * @return {object} - Metadata for the record dimension
     *  * `length`: Number of elements in the record dimension
     *  * `id`: Id number in the list of dimensions for the record dimension
     *  * `name`: String with the name of the record dimension
     *  * `recordStep`: Number with the record variables step size
     */
    get recordDimension() {
        return this.header.recordDimension;
    }

    /**
     * @return {Array<object>} - List of dimensions with:
     *  * `name`: String with the name of the dimension
     *  * `size`: Number with the size of the dimension
     */
    get dimensions() {
        return this.header.dimensions;
    }

    /**
     * @return {Array<object>} - List of global attributes with:
     *  * `name`: String with the name of the attribute
     *  * `type`: String with the type of the attribute
     *  * `value`: A number or string with the value of the attribute
     */
    get globalAttributes() {
        return this.header.globalAttributes;
    }

    /**
     * @return {Array<object>} - List of variables with:
     *  * `name`: String with the name of the variable
     *  * `dimensions`: Array with the dimension IDs of the variable
     *  * `attributes`: Array with the attributes of the variable
     *  * `type`: String with the type of the variable
     *  * `size`: Number with the size of the variable
     *  * `offset`: Number with the offset where of the variable begins
     *  * `record`: True if is a record variable, false otherwise
     */
    get variables() {
        return this.header.variables;
    }

    /**
     * Retrieves the data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @return {Array} - List with the variable values
     */
    getDataVariable(variableName) {
        var variable;
        if (typeof variableName === 'string') {
            // search the variable
            variable = this.header.variables.find(function (val) {
                return val.name === variableName;
            });
        } else {
            variable = variableName;
        }

        // throws if variable not found
        utils.notNetcdf((variable === undefined), 'variable not found');

        // go to the offset position
        this.buffer.seek(variable.offset);

        if (variable.record) {
            // record variable case
            return data.record(this.buffer, variable, this.header.recordDimension);
        } else {
            // non-record variable case
            return data.nonRecord(this.buffer, variable);
        }
    }
}

module.exports = NetCDFReader;
