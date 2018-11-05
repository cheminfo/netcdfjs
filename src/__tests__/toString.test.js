'use strict';

const NetCDFReader = require('..');

const fs = require('fs');

const pathFiles = `${__dirname}/files/`;

describe('Read file', function () {
  test('toString', function () {
    const data = fs.readFileSync(`${pathFiles}P071.CDF`);

    var reader = new NetCDFReader(data);
    expect(reader.toString()).toMatchSnapshot();
  });
});
