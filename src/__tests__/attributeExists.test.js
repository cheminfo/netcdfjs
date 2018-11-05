'use strict';

const NetCDFReader = require('..');

const fs = require('fs');

const pathFiles = `${__dirname}/files/`;

test('attributeExists', function () {
  const data = fs.readFileSync(`${pathFiles}P071.CDF`);

  var reader = new NetCDFReader(data);
  expect(reader.attributeExists('operator_name')).toBe(true);
  expect(reader.attributeExists('operator_nameXX')).toBe(false);
});
