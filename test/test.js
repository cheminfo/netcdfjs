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
        // http://www.unidata.ucar.edu/software/netcdf/examples/madis-sao.cdl
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');

        const header = netcdfjs(data, {headerOnly: true});
        header.version.should.be.equal(1);
        header.recordDimension.should.be.equal(178);
        header.dimensions.should.deepEqual([
            {name: 'maxAutoStaLen', size: 6},
            {name: 'maxAutoWeather', size: 5},
            {name: 'maxAutoWeaLen', size: 12},
            {name: 'maxCldTypeLen', size: 5},
            {name: 'maxCloudTypes', size: 5},
            {name: 'maxDataSrcLen', size: 8},
            {name: 'maxRepLen', size: 5},
            {name: 'maxSAOLen', size: 256},
            {name: 'maxSkyCover', size: 5},
            {name: 'maxSkyLen', size: 8},
            {name: 'maxSkyMethLen', size: 3},
            {name: 'maxStaNamLen', size: 5},
            {name: 'maxWeatherNum', size: 5},
            {name: 'maxWeatherLen', size: 40},
            {name: 'QCcheckNum', size: 10},
            {name: 'QCcheckNameLen', size: 60},
            {name: 'ICcheckNum', size: 55},
            {name: 'ICcheckNameLen', size: 72},
            {name: 'maxStaticIds', size: 350},
            {name: 'totalIdLen', size: 6},
            {name: 'nInventoryBins', size: 24},
            {name: 'recNum', size: 0}
        ]);

        header.globalAttributes[0].should.deepEqual({
            name: 'cdlDate',
            type: 'char',
            value: '20010327'
        });
        header.globalAttributes[3].should.deepEqual({
            name: 'filePeriod',
            type: 'int',
            value: [3600]
        });

        header.variables[0].should.deepEqual({
            name: 'nStaticIds',
            dimensions: [],
            attributes: [{
                name: '_FillValue',
                type: 'int',
                value: [0]
            }],
            type: 'int',
            size: 4,
            offset: 39208
        });
        header.variables[11].should.deepEqual({
            name: 'wmoId',
            dimensions: [21],
            attributes: [
                {name: 'long_name', type: 'char', value: 'WMO numeric station ID'},
                {name: '_FillValue', type: 'int', value: [-2147483647]},
                {name: 'valid_range', type: 'int', value: [1, 89999]},
                {name: 'reference', type: 'char', value: 'station table'}
            ],
            type: 'int',
            size: 4,
            offset: 48884
        });
    });

    it('read header information', function () {
        // http://www.unidata.ucar.edu/software/netcdf/examples/files.html
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');

        const file = netcdfjs(data);
        const header = file.header;
        header.version.should.be.equal(1);
        header.recordDimension.should.be.equal(178);
    });
});
