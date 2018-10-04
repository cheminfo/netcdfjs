'use strict';

const IOBuffer = require('iobuffer');

const utils = require('./utils');
const data = require('./data');
const Header = require('./header');

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
        utils.notNetcdf((version > 2), 'unknown version');

        // Read the header
        this.header = new Header(buffer, version);
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
        var variable = this.header.getVariableInfo(variableName);

        if (variable.record) {
            // record variable case
            return data.record(this.buffer, variable, this.header.recordDimension);
        } else {
            // non-record variable case
            return data.nonRecord(this.buffer, variable);
        }
    }

    /**
     * Retrieves contiguous partial data for a given variable
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @param {number} startIndex - Initial index where to slice the variable dataset from
     * @param {number} size - Length of the slice
     * @return {Array} - List with the variable values
     */
    getDataVariableSlice(variableName, startIndex, size) {
        var variable = this.header.getVariableInfo(variableName);

        if (variable.record) {
            // TODO record variable case
            return null;
        } else {
            // non-record variable case
            return data.nonRecord(this.buffer, variable, startIndex, size);
        }
    }

    /**
     * Retrieves partial data for a given variable filter by index
     * @param {string|object} variableName - Name of the variable to search or variable object
     * @param {number} filterValues - Initial indexes and length of each dimension
     * @return {Array} - List with the variable values required
     */
    getDataVariableFiltered(variableName, ...filterValues) {
        var variable = this.header.getVariableInfo(variableName);

        var filter = this.header.translateToFilter(variable, filterValues);

        if (variable.record) {
            // TODO record variable case
            return null;
        } else {
            // non-record variable case
            return data.nonRecordFiltered(this.buffer, variable, filter);
        }
    }
}

module.exports = NetCDFReader;
