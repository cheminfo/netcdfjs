'use strict';

const NetCDFReader = require('..');

const fs = require('fs');

const pathFiles = `${__dirname}/files/`;

test('getAttribute', function () {
  const data = fs.readFileSync(`${pathFiles}P071.CDF`);

  var reader = new NetCDFReader(data);
  expect(reader.getAttribute('operator_name')).toBe('SC');
});
