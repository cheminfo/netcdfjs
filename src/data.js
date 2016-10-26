'use strict';

const types = require('./types');

function nonRecord(buffer, variable) {
    // variable type
    const type = types.str2num(variable.type);

    // size of the data
    var size = variable.size / 4;

    // iterates over the data
    var data = new Array(size);
    for (var i = 0; i < size; i++) {
        data[i] = types.readType(buffer, type, 1);
    }

    return data;
}

module.exports.nonRecord = nonRecord;
