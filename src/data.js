'use strict';

const types = require('./types');

// const STREAMING = 4294967295;

/**
 * Read data for the given non-record variable
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {object} variable - Variable metadata
 * @return {Array} - Data of the element
 */
function nonRecord(buffer, variable, initialValue = undefined, contentSize = undefined) {
    // variable type
    const type = types.str2num(variable.type);

    //variable type size
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
 * @return {Array} - Partial data of the element
 */
function nonRecordFiltered(buffer, variable, filter) {

    // variable type
    const type = types.str2num(variable.type);

    //variable type size
    const typeSize = types.num2bytes(type);

    // size of the data
    var size = filter.reduce((acc, dim) => acc * (dim.endIndex - dim.initialIndex), 1);

    // go to the variable offset position
    buffer.seek(variable.offset);

    // iterates over the data
    var data = [];
    readFilteredData(buffer, type, typeSize, filter, data);

    return data;
}

/**
 * Recursive function reading the data defined by each dimension filter
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {Array} filter - List of index selection of the remaining dimension 
 *                         (initial index (included) last index (not included), dimension size).
 * @param {Array} data - Data previously read through recursivity.
 * @return {Array} - Partial data of the element
 */
function readFilteredData(buffer, type, typeSize, filter, data) {
    //copy filter array to avoid to modify its value;
    var _filter = filter.slice();
    var currentFilter = _filter.shift();
    var currentIndex = currentFilter.initialIndex;
    var currentOffset = buffer.offset;

    do {
        //go to the position of initial data for currentIndex value
        var step = _filter.reduce((acc, dim) => acc * dim.size, 1);
        buffer.seek(currentOffset + step * typeSize * currentIndex);

        //go to next dimension or read data if we've reached last index
        if (_filter.length > 0) {
            readFilteredData(buffer, type, typeSize, _filter, data);
        } else {
            data.push(types.readType(buffer, type, 1))
        }

        currentIndex++;

    } while (currentIndex < currentFilter.endIndex);

    return data.length;
}

/**
 * Read data for the given record variable
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {object} variable - Variable metadata
 * @param {object} recordDimension - Record dimension metadata
 * @return {Array} - Data of the element
 */
function record(buffer, variable, recordDimension) {
    // variable type
    const type = types.str2num(variable.type);
    const width = variable.size ? variable.size / types.num2bytes(type) : 1;

    // size of the data
    // TODO streaming data
    var size = recordDimension.length;

    // go to the variable offset position
    buffer.seek(variable.offset);

    // iterates over the data
    var data = new Array(size);
    const step = recordDimension.recordStep;

    for (var i = 0; i < size; i++) {
        var currentOffset = buffer.offset;
        data[i] = types.readType(buffer, type, width);
        buffer.seek(currentOffset + step);
    }

    return data;
}

module.exports.nonRecord = nonRecord;
module.exports.nonRecordFiltered = nonRecordFiltered;
module.exports.record = record;
