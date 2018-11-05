'use strict';

const NetCDFReader = require('..');

const fs = require('fs');

const pathFiles = `${__dirname}/files/`;

test('dataVariableExists', function () {
  const data = fs.readFileSync(`${pathFiles}P071.CDF`);

  var reader = new NetCDFReader(data);
  expect(reader.dataVariableExists('instrument_name')).toBe(true);
  expect(reader.dataVariableExists('instrument_nameXX')).toBe(false);
});
