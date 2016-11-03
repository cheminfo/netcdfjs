'use strict';

const NetCDFReader = require('..');
const fs = require('fs');
const pathFiles = __dirname + '/files/';

describe('Read file', function () {
    it('Throws on non NetCDF file', function () {
        const data = fs.readFileSync(pathFiles + 'not_nc.txt');
        (function notValid() {
            return new NetCDFReader(data);
        }).should.throw('Not a valid NetCDF v3.x file: should start with CDF');
    });

    it('read header information', function () {
        // http://www.unidata.ucar.edu/software/netcdf/examples/files.html
        // http://www.unidata.ucar.edu/software/netcdf/examples/madis-sao.cdl
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');

        var reader = new NetCDFReader(data);
        reader.version.should.be.equal('classic format');
        reader.recordDimension.should.deepEqual({
            length: 178,
            id: 21,
            name: 'recNum',
            recordStep: 1220
        });
        reader.dimensions.should.deepEqual([
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

        reader.globalAttributes[0].should.deepEqual({
            name: 'cdlDate',
            type: 'char',
            value: '20010327'
        });
        reader.globalAttributes[3].should.deepEqual({
            name: 'filePeriod',
            type: 'int',
            value: 3600
        });

        reader.variables[0].should.deepEqual({
            name: 'nStaticIds',
            dimensions: [],
            attributes: [{
                name: '_FillValue',
                type: 'int',
                value: 0
            }],
            type: 'int',
            size: 4,
            offset: 39208,
            record: false
        });
        reader.variables[11].should.deepEqual({
            name: 'wmoId',
            dimensions: [21],
            attributes: [
                {name: 'long_name', type: 'char', value: 'WMO numeric station ID'},
                {name: '_FillValue', type: 'int', value: -2147483647},
                {name: 'valid_range', type: 'int', value: [1, 89999]},
                {name: 'reference', type: 'char', value: 'station table'}
            ],
            type: 'int',
            size: 4,
            offset: 48884,
            record: true
        });
    });

    it('read non-record variable', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        reader.getDataVariable('nStaticIds')[0].should.be.equal(145);
    });

    it('read record variable with string', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        var record = reader.getDataVariable('wmoId');
        record[0].should.be.equal(71419);
        record[1].should.be.equal(71415);
        record[2].should.be.equal(71408);
    });

    it('read non-record variable with object', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);
        var variables = reader.variables;

        var withString = reader.getDataVariable('staticIds');
        var withObject = reader.getDataVariable(variables[1]);
        withString[0].should.be.equal('W');
        withString[1].should.be.equal('A');
        withString[2].should.be.equal('F');
        withString[0].should.be.equal(withObject[0]);
        withString[1].should.be.equal(withObject[1]);
        withString[2].should.be.equal(withObject[2]);
    });

    it('read non-existent variable string', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        reader.getDataVariable.bind(reader, 'n\'importe quoi')
            .should.throw('Not a valid NetCDF v3.x file: variable not found');
    });
});
