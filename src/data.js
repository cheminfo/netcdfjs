'use strict';

const types = require('./types');
const utils = require('./utils');

// const STREAMING = 4294967295;

/**
 * Read data for the given non-record variable
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {object} variable - Variable metadata
 * @param {number} initialValue - Initial index where to slice the variable dataset from
 * @param {number} contentSize - Length of the slice
 * @return {Array} - Data of the element
 */
function nonRecord(buffer, variable, initialValue = undefined, contentSize = undefined) {
    // variable type
    const type = types.str2num(variable.type);

    // variable type size
    const typeSize = types.num2bytes(type);

    // size of the data
    var size = contentSize ? contentSize : variable.size / typeSize;

    // go to the variable offset position
    var offset = variable.offset + (initialValue ? initialValue * typeSize : 0);
    buffer.seek(offset);

    // iterates over the data
    var data = new Array(size);
    for (var i = 0; i < size; i++) {
        data[i] = types.readType(buffer, type, 1);
    }

    return data;
}

/**
 * Read partial data for the given non-record variable
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {object} variable - Variable metadata
 * @param {Array} filter - List of index selection of each dimension
 *                         (initial index (included) last index (not included), dimension size).
 * @param {number} recordStep - Size of each record in bytes.
 * @return {Array} - Partial data of the element
 */
function filterData(buffer, variable, filter, recordStep = undefined) {
    // variable type
    const type = types.str2num(variable.type);

    // variable type size
    const typeSize = types.num2bytes(type);

    // go to the variable offset position
    buffer.seek(variable.offset);

    // iterates over the data
    var data = [];
    readFilteredData(buffer, type, typeSize, filter, data, recordStep);

    return data;
}

/**
 * Recursive function reading the data defined by each dimension filter
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} type - Index of data type
 * @param {number} typeSize - Size of the each data value in bytes
 * @param {Array} filter - List of index selection of the remaining dimension
 *                         (initial index (included) last index (not included), dimension size).
 * @param {Array} data - Data previously read through recursivity.
 * @param {number} recordStep - Size of each record in bytes.
 * @return {Array} - Partial data of the element
 */
function readFilteredData(buffer, type, typeSize, filter, data, recordStep = undefined) {
    // copy filter array to avoid to modify its value;
    var _filter = filter.slice();
    const currentFilter = _filter.shift();
    const currentOffset = buffer.offset;
    const step = recordStep ? recordStep : _filter.reduce((acc, dim) => acc * dim.size, 1) * typeSize;

    if (recordStep) {
        var size = currentFilter.endIndex - currentFilter.initialIndex;
        for (var j = 0; j < size; j++) {
            data[j] = [];
        }
    }

    for (var i = currentFilter.initialIndex; i < currentFilter.endIndex; i++) {
        // go to the position of initial data for current index value
        buffer.seek(currentOffset + step * i);

        // go to next dimension or read data if we've reached last index
        if (_filter.length > 0) {
            readFilteredData(buffer, type, typeSize, _filter, recordStep ? data[i - currentFilter.initialIndex] : data);
        } else {
            data.push(types.readType(buffer, type, 1));
        }
    }

    return data.length;
}

/**
 * Read data for the given record variable
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {object} variable - Variable metadata
 * @param {object} recordDimension - Record dimension metadata
 * @param {number} initialValue - Initial index where to slice the variable dataset from
 * @param {number} contentSize - Length of the slice
 * @return {Array} - Data of the element
 */
function record(buffer, variable, recordDimension, initialValue = undefined, contentSize = undefined) {
    // variable type
    const type = types.str2num(variable.type);
    const typeSize = types.num2bytes(type);
    var width = variable.size ? variable.size / typeSize : 1;

    // check if the content is a partial record or several records.
    if (initialValue !== undefined && contentSize !== undefined) {
        var notIntegers = !utils.isPositiveInteger(contentSize) || !utils.isPositiveInteger(initialValue);
        var validArguments = contentSize < width || (contentSize % width === 0 && initialValue % width === 0);
        utils.notNetcdf(notIntegers || !validArguments, 'slice selection is invalid for record variables');
    }

    // go to the variable offset position
    const step = recordDimension.recordStep;
    var offset = variable.offset + (initialValue ? Math.floor(initialValue / width) * step + (initialValue % width) * typeSize : 0);
    buffer.seek(offset);

    // size of the data
    // TODO streaming data
    var size = recordDimension.length;
    if (contentSize || contentSize === 0) {
        if (contentSize < width) {
            width = contentSize;
            size = 1;
        } else {
            size = contentSize / width;
        }
    }

    // iterates over the data
    var data = new Array(size);

    for (var i = 0; i < size; i++) {
        var currentOffset = buffer.offset;
        data[i] = types.readType(buffer, type, width);
        buffer.seek(currentOffset + step);
    }

    return data;
}

module.exports.nonRecord = nonRecord;
module.exports.filterData = filterData;
module.exports.record = record;
