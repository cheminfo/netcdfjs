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

    it('read 2 dimensional variable', function () {
        const data = fs.readFileSync(pathFiles + 'ichthyop.nc');
        var reader = new NetCDFReader(data);
        reader.getDataVariable('time').should.have.length(49);
        reader.getDataVariable('time')[0].should.be.equal(1547070300);
        reader.getDataVariable('lat').should.have.length(49);
        reader.getDataVariable('lat')[0].should.have.length(1000);
        reader.getDataVariable('lat')[0][0].should.be.equal(53.26256561279297);
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

    it('read 64 bit offset file', function () {
        const data = fs.readFileSync(pathFiles + 'model1_md2.nc');
        var reader = new NetCDFReader(data);
        reader.version.should.be.equal('64-bit offset format');
        reader.getDataVariable('cell_angular')[0].should.be.equal('a');
        reader.getDataVariable('cell_spatial')[0].should.be.equal('a');
    });

    it('read record variable sliced data', function () {
        const data = fs.readFileSync(pathFiles + 'ichthyop.nc');
        var reader = new NetCDFReader(data);

        var result = reader.getDataVariableSlice('depth', 2000, 20);

        result.length.should.be.equal(1);
        result[0].length.should.be.equal(20);
        result[0][0].should.be.equal(-0.268094003200531);
        result[0][1].should.be.equal(-0.21849104762077332);
        result[0][2].should.be.equal(-0.664058268070221);
    });

    it('read record variable sliced data with wrong input', function () {
        const data = fs.readFileSync(pathFiles + 'ichthyop.nc');
        var reader = new NetCDFReader(data);

        // arguments cannot be interpreted.
        (function () {
            return reader.getDataVariableSlice('depth', 'test', null);
        }).should.throw('Not a valid NetCDF v3.x file: slice selection is invalid for record variables');

        // The slice selection doesn't contain full records.
        (function () {
            return reader.getDataVariableSlice('depth', 1050, 2000);
        }).should.throw('Not a valid NetCDF v3.x file: slice selection is invalid for record variables');
    });

    it('read non-record variable sliced data', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        var result = reader.getDataVariableSlice('staticIds', 48, 36);

        result.length.should.be.equal(36);
        result[0].should.be.equal('W');
        result[1].should.be.equal('B');
        result[2].should.be.equal('G');
    });

    it('read non-record variable filtered data', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        var result = reader.getDataVariableFiltered('staticIds', 14, 5, 0, 3);

        result.length.should.be.equal(15);
        result[0].should.be.equal('W');
        result[1].should.be.equal('C');
        result[2].should.be.equal('I');
        result[3].should.be.equal('W');
        result[4].should.be.equal('C');
        result[5].should.be.equal('J');
        result[12].should.be.equal('W');
        result[13].should.be.equal('C');
        result[14].should.be.equal('T');
    });

    it('read record variable filtered data', function () {
        const data = fs.readFileSync(pathFiles + 'ichthyop.nc');
        var reader = new NetCDFReader(data);

        var result = reader.getDataVariableFiltered('depth', 14, 3, 8, 5);

        result.length.should.be.equal(15);
        result[0].should.be.equal(-1.7035714387893677);
        result[1].should.be.equal(-2.307743549346924);
        result[2].should.be.equal(-1.5312272310256958);
        result[6].should.be.equal(-2.373673439025879);
        result[7].should.be.equal(-1.6136265993118286);
        result[8].should.be.equal(-4.677360534667969);
        result[12].should.be.equal(-1.7380928993225098);
        result[13].should.be.equal(-4.987034320831299);
        result[14].should.be.equal(-2.982983350753784);
    });

    it('read variable filtered data without enough arguments', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        (function () {
            return reader.getDataVariableFiltered('staticIds', 14, 5);
        }).should.throw('Not a valid NetCDF v3.x file: insufficient filter values');
    });

    it('read variable filtered data with unvalid filter data', function () {
        const data = fs.readFileSync(pathFiles + 'madis-sao.nc');
        var reader = new NetCDFReader(data);

        (function () {
            return reader.getDataVariableFiltered('staticIds', 0, -1, NaN, 'wrong');
        }).should.throw('Not a valid NetCDF v3.x file: incorrect filter values');
    });
});
