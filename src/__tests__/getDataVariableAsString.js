'use strict';

const NetCDFReader = require('..');

const fs = require('fs');

const pathFiles = `${__dirname}/files/`;

test('getDataVariableAsString', function () {
  const data = fs.readFileSync(`${pathFiles}P071.CDF`);

  var reader = new NetCDFReader(data);
  expect(reader.getDataVariableAsString('instrument_name')).toBe(
    'Gas Chromatograph'
  );
});
