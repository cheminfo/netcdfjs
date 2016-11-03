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
function nonRecord(buffer, variable) {
    // variable type
    const type = types.str2num(variable.type);

    // size of the data
    var size = variable.size / types.num2bytes(type);

    // iterates over the data
    var data = new Array(size);
    for (var i = 0; i < size; i++) {
        data[i] = types.readType(buffer, type, 1);
    }

    return data;
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

    // size of the data
    // TODO streaming data
    var size = recordDimension.length;

    // iterates over the data
    var data = new Array(size);
    const step = recordDimension.recordStep;

    for (var i = 0; i < size; i++) {
        var currentOffset = buffer.offset;
        data[i] = types.readType(buffer, type, 1);
        buffer.seek(currentOffset + step);
    }

    return data;
}

module.exports.nonRecord = nonRecord;
module.exports.record = record;
