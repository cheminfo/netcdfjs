'use strict';

const netcdfjs = require('..');
const fs = require('fs');
const pathFiles = __dirname + '/files/';

describe('Read file', function () {
    it('Throws on non NetCDF file', function () {
        const data = fs.readFileSync(pathFiles + 'not_nc.txt');
        netcdfjs.bind(null, data).should.throw('Not a valid NetCDF v3.x file: should start with CDF');
    });

    it('read header information', function () {
        // http://www.unidata.ucar.edu/software/netcdf/examples/files.html
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');

        netcdfjs(data).should.be.equal(266032);
    });
});
