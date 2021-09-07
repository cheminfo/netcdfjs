'use strict';

const fs = require('fs');
const join = require('path').join;

import NetCDFReader from '../index.js'

const data = fs.readFileSync(
  join(__dirname, '../src/__tests__/files/agilent_hplc.cdf')
);

let reader = new NetCDFReader(data);

let selectedVariable = reader.variables[4];

reader.getDataVariable(selectedVariable);

for (let variable of reader.variables) {
  console.log(variable.name, reader.getDataVariable(variable));
}

let ordinates = reader.getDataVariable(reader.variables[5]);
console.log(Math.max(...ordinates));
console.log(Math.min(...ordinates));
