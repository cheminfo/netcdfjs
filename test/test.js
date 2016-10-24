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
        header.globalAttributes.should.deepEqual([
            {name: 'cdlDate', type: 'char', value: '20010327'},
            {name: 'idVariables', type: 'char', value: 'stationName'},
            {name: 'timeVariables', type: 'char', value: 'timeObs'},
            {name: 'filePeriod', type: 'int', value: 3600},
            {name: 'fileEndOffset', type: 'int', value: 2640},
            {name: 'DD_long_name', type: 'char', value: 'QC data descriptor model:  QC summary values'},
            {name: 'DD_reference', type: 'char', value: 'AWIPS Technique Specification Package (TSP) 88-21-R2'},
            {name: 'DD_values', type: 'char', value: 'Z,C,S,V,X,Q,K,k,G, or B'},
            {name: 'DD_value_Z', type: 'char', value: 'No QC applied'},
            {name: 'DD_value_C', type: 'char', value: 'Passed QC stage 1'},
            {name: 'DD_value_S', type: 'char', value: 'Passed QC stages 1 and 2'},
            {name: 'DD_value_V', type: 'char', value: 'Passed QC stages 1, 2 and 3'},
            {name: 'DD_value_X', type: 'char', value: 'Failed QC stage 1'},
            {name: 'DD_value_Q', type: 'char', value: 'Passed QC stage 1, but failed stages 2 or 3 '},
            {name: 'DD_value_K', type: 'char', value: 'Passed QC stages 1, 2, 3, and 4'},
            {name: 'DD_value_k', type: 'char', value: 'Passed QC stage 1,2, and 3, failed stage 4 '},
            {name: 'DD_value_G', type: 'char', value: 'Included in accept list'},
            {name: 'DD_value_B', type: 'char', value: 'Included in reject list'},
            {name: 'QCStage_long_name', type: 'char', value: 'automated QC checks contained in each stage'},
            {name: 'QCStage_values', type: 'char', value: '1, 2, 3, or 4'},
            {name: 'QCStage_value_1', type: 'char', value: 'Validity and Position Consistency Check'},
            {name: 'QCStage_value_2', type: 'char', value: 'Internal, Temporal, and Model Consistency Checks'},
            {name: 'QCStage_value_3', type: 'char', value: 'Spatial Consistency Check'},
            {name: 'QCStage_value_4', type: 'char', value: 'Kalman Filter'},
            {name: 'QCStage_reference', type: 'char', value: 'AWIPS TSP 88-21_R2'},
            {name: 'QCA_long_name', type: 'char', value: 'QC applied model:  applied word definition'},
            {name: 'QCA_NoBitsSet', type: 'char', value: 'No QC applied'},
            {name: 'QCA_Bit1Set', type: 'char', value: 'Master bit - at least 1 check applied'},
            {name: 'QCA_Bit2Set', type: 'char', value: 'Validity check applied'},
            {name: 'QCA_Bit3Set', type: 'char', value: 'Position Consistency check applied'},
            {name: 'QCA_Bit4Set', type: 'char', value: 'Internal Consistency check applied'},
            {name: 'QCA_Bit5Set', type: 'char', value: 'Temporal Consistency (TC) check applied'},
            {name: 'QCA_Bit6Set', type: 'char', value: 'Temporal Consistency check (for Marine data) applied'},
            {name: 'QCA_Bit7Set', type: 'char', value: 'Spatial Consistency check applied'},
            {name: 'QCA_Bit8Set', type: 'char', value: 'Forecast Model Consistency check applied'},
            {name: 'QCA_Bit9Set', type: 'char', value: 'Statistical Model Consistency check applied'},
            {name: 'QCA_Bit10Set', type: 'char', value: 'Kalman Filter applied'},
            {name: 'QCA_LeastSignificantBit', type: 'char', value: 'bit1'},
            {name: 'QCA_reference1', type: 'char', value: 'AWIPS TSP 88-21_R2'},
            {name: 'QCA_reference2', type: 'char', value: '10th Met Obs and Inst, Paper FA5.7, Phoenix, 1998'},
            {name: 'QCA_reference3', type: 'char', value: '14th IIPS, Paper FA8.16, Phoenix, 1998'},
            {name: 'QCR_long_name', type: 'char', value: 'QC results model:  results word definition'},
            {name: 'QCR_NoBitsSet', type: 'char', value: 'No QC failures'},
            {name: 'QCR_Bit1Set', type: 'char', value: 'Master bit - at least 1 check failed'},
            {name: 'QCR_Bit2Set', type: 'char', value: 'Validity check failed'},
            {name: 'QCR_Bit3Set', type: 'char', value: 'Position Consistency check failed'},
            {name: 'QCR_Bit4Set', type: 'char', value: 'Internal Consistency (IC) check failed'},
            {name: 'QCR_Bit5Set', type: 'char', value: 'Temporal Consistency check failed'},
            {name: 'QCR_Bit6Set', type: 'char', value: 'Temporal Consistency check (for Marine data) failed'},
            {name: 'QCR_Bit7Set', type: 'char', value: 'Spatial Consistency check failed'},
            {name: 'QCR_Bit8Set', type: 'char', value: 'Forecast Model Consistency check failed'},
            {name: 'QCR_Bit9Set', type: 'char', value: 'Statistical Model Consistency check failed'},
            {name: 'QCR_Bit10Set', type: 'char', value: 'Kalman Filter failed'},
            {name: 'QCR_LeastSignificantBit', type: 'char', value: 'bit1'},
            {name: 'QCR_reference1', type: 'char', value: 'AWIPS TSP 88-21_R2'},
            {name: 'QCR_reference2', type: 'char', value: '10th Met Obs and Inst, Paper FA5.7, Phoenix, 1998'},
            {name: 'QCR_reference3', type: 'char', value: '14th IIPS, Paper FA8.16, Phoenix, 1998'},
            {name: 'QCD_long_name', type: 'char', value: 'QC departure model:  array definition'},
            {name: 'QCD_pos1', type: 'char', value: 'Average ob departure from QC check estimates'},
            {name: 'QCD_pos2', type: 'char', value: 'Departure from validity check estimate'},
            {name: 'QCD_pos3', type: 'char', value: 'Departure from position consistency estimate'},
            {name: 'QCD_pos4', type: 'char', value: 'Departure from internal consistency estimate'},
            {name: 'QCD_pos5', type: 'char', value: 'Departure from temporal consistency estimate'},
            {name: 'QCD_pos6', type: 'char', value: 'Departure from temporal consistency (for marine data)'},
            {name: 'QCD_pos7', type: 'char', value: 'Departure from spatial consistency estimate'},
            {name: 'QCD_pos8', type: 'char', value: 'Departure from forecast model estimate'},
            {name: 'QCD_pos9', type: 'char', value: 'Departure from statistical model estimate'},
            {name: 'QCD_pos10', type: 'char', value: 'Departure from Kalman filter estimate'},
            {name: 'QCD_reference1', type: 'char', value: 'AWIPS TSP 88-21-R2'},
            {name: 'QCD_reference2', type: 'char', value: '10th Met Obs and Inst, Paper FA5.7, Phoenix, 1998'},
            {name: 'QCD_reference3', type: 'char', value: '14th IIPS, Paper FA8.16, Phoenix, 1998'},
            {name: 'ICA_long_name', type: 'char', value: 'IC applied model:  applied word definition'},
            {name: 'ICA_NoBitsSet', type: 'char', value: 'No IC applied'},
            {name: 'ICA_Bit1Set', type: 'char', value: 'Master bit - at least 1 check applied'},
            {name: 'ICA_BitiSet', type: 'char', value: 'IC check # applied'},
            {name: 'ICA_LeastSignificantBit', type: 'char', value: 'bit1'},
            {name: 'ICA_reference', type: 'char', value: 'IC check #\'s defined in IC check table'},
            {name: 'ICR_long_name', type: 'char', value: 'IC results Model:  results word definition'},
            {name: 'ICR_NoBitsSet', type: 'char', value: 'No IC applied'},
            {name: 'ICR_Bit1Set', type: 'char', value: 'Master bit - at least 1 check applied'},
            {name: 'ICR_BitiSet', type: 'char', value: 'IC check # applied'},
            {name: 'ICR_LeastSignificantBit', type: 'char', value: 'bit1'},
            {name: 'ICR_reference', type: 'char', value: 'IC check #\'s defined in IC check table'}
        ]);
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
