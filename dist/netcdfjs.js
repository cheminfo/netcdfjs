(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["netcdfjs"] = factory();
	else
		root["netcdfjs"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const IOBuffer = __webpack_require__(1);
	const utils = __webpack_require__(2);
	const data = __webpack_require__(3);
	const readHeader = __webpack_require__(5);

	/**
	 * Reads a NetCDF v3.x file
	 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
	 * @param {ArrayBuffer} data - ArrayBuffer or any Typed Array (including Node.js' Buffer from v4) with the data
	 * @constructor
	 */
	class NetCDFReader {
	    constructor(data) {
	        const buffer = new IOBuffer(data);
	        buffer.setBigEndian();

	        // Validate that it's a NetCDF file
	        utils.notNetcdf((buffer.readChars(3) !== 'CDF'), 'should start with CDF');

	        // Check the NetCDF format
	        const version = buffer.readByte();
	        utils.notNetcdf((version === 2), '64-bit offset format not supported yet');
	        utils.notNetcdf((version !== 1), 'unknown version');

	        // Read the header
	        this.header = readHeader(buffer);
	        this.header.version = version;
	        this.buffer = buffer;
	    }

	    /**
	     * @return {string} - Version for the NetCDF format
	     */
	    get version() {
	        if (this.header.version === 1) {
	            return 'classic format';
	        } else {
	            return '64-bit offset format';
	        }
	    }

	    /**
	     * @return {object} - Metadata for the record dimension
	     *  * `length`: Number of elements in the record dimension
	     *  * `id`: Id number in the list of dimensions for the record dimension
	     *  * `name`: String with the name of the record dimension
	     *  * `recordStep`: Number with the record variables step size
	     */
	    get recordDimension() {
	        return this.header.recordDimension;
	    }

	    /**
	     * @return {Array<object>} - List of dimensions with:
	     *  * `name`: String with the name of the dimension
	     *  * `size`: Number with the size of the dimension
	     */
	    get dimensions() {
	        return this.header.dimensions;
	    }

	    /**
	     * @return {Array<object>} - List of global attributes with:
	     *  * `name`: String with the name of the attribute
	     *  * `type`: String with the type of the attribute
	     *  * `value`: A number or string with the value of the attribute
	     */
	    get globalAttributes() {
	        return this.header.globalAttributes;
	    }

	    /**
	     * @return {Array<object>} - List of variables with:
	     *  * `name`: String with the name of the variable
	     *  * `dimensions`: Array with the dimension IDs of the variable
	     *  * `attributes`: Array with the attributes of the variable
	     *  * `type`: String with the type of the variable
	     *  * `size`: Number with the size of the variable
	     *  * `offset`: Number with the offset where of the variable begins
	     *  * `record`: True if is a record variable, false otherwise
	     */
	    get variables() {
	        return this.header.variables;
	    }

	    /**
	     * Retrieves the data for a given variable
	     * @param {string|object} variableName - Name of the variable to search or variable object
	     * @return {Array}
	     */
	    getDataVariable(variableName) {
	        var variable;
	        if (typeof variableName === 'string') {
	            // search the variable
	            variable = this.header.variables.find(function (val) {
	                return val.name === variableName;
	            });
	        } else {
	            variable = variableName;
	        }

	        // throws if variable not found
	        utils.notNetcdf((variable === undefined), 'variable not found');

	        // go to the offset position
	        this.buffer.seek(variable.offset);

	        if (variable.record) {
	            // record variable case
	            return data.record(this.buffer, variable, this.header.recordDimension);
	        } else {
	            // non-record variable case
	            return data.nonRecord(this.buffer, variable);
	        }
	    }
	}

	module.exports = NetCDFReader;


/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';

	const defaultByteLength = 1024 * 8;
	const charArray = [];

	class IOBuffer {
	    constructor(data, options) {
	        options = options || {};
	        if (data === undefined) {
	            data = defaultByteLength;
	        }
	        if (typeof data === 'number') {
	            data = new ArrayBuffer(data);
	        }
	        let length = data.byteLength;
	        const offset = options.offset ? options.offset>>>0 : 0;
	        if (data.buffer) {
	            length = data.byteLength - offset;
	            if (data.byteLength !== data.buffer.byteLength) { // Node.js buffer from pool
	                data = data.buffer.slice(data.byteOffset + offset, data.byteOffset + data.byteLength);
	            } else if (offset) {
	                data = data.buffer.slice(offset);
	            } else {
	                data = data.buffer;
	            }
	        }
	        this.buffer = data;
	        this.length = length;
	        this.byteLength = length;
	        this.byteOffset = 0;
	        this.offset = 0;
	        this.littleEndian = true;
	        this._data = new DataView(this.buffer);
	        this._increment = length || defaultByteLength;
	        this._mark = 0;
	    }

	    available(byteLength) {
	        if (byteLength === undefined) byteLength = 1;
	        return (this.offset + byteLength) <= this.length;
	    }

	    isLittleEndian() {
	        return this.littleEndian;
	    }

	    setLittleEndian() {
	        this.littleEndian = true;
	    }

	    isBigEndian() {
	        return !this.littleEndian;
	    }

	    setBigEndian() {
	        this.littleEndian = false;
	    }

	    skip(n) {
	        if (n === undefined) n = 1;
	        this.offset += n;
	    }

	    seek(offset) {
	        this.offset = offset;
	    }

	    mark() {
	        this._mark = this.offset;
	    }

	    reset() {
	        this.offset = this._mark;
	    }

	    rewind() {
	        this.offset = 0;
	    }

	    ensureAvailable(byteLength) {
	        if (byteLength === undefined) byteLength = 1;
	        if (!this.available(byteLength)) {
	            const newIncrement = this._increment + this._increment;
	            this._increment = newIncrement;
	            const newLength = this.length + newIncrement;
	            const newArray = new Uint8Array(newLength);
	            newArray.set(new Uint8Array(this.buffer));
	            this.buffer = newArray.buffer;
	            this.length = newLength;
	            this._data = new DataView(this.buffer);
	        }
	    }

	    readBoolean() {
	        return this.readUint8() !== 0;
	    }

	    readInt8() {
	        return this._data.getInt8(this.offset++);
	    }

	    readUint8() {
	        return this._data.getUint8(this.offset++);
	    }

	    readByte() {
	        return this.readUint8();
	    }

	    readBytes(n) {
	        if (n === undefined) n = 1;
	        var bytes = new Uint8Array(n);
	        for (var i = 0; i < n; i++) {
	            bytes[i] = this.readByte();
	        }
	        return bytes;
	    }

	    readInt16() {
	        var value = this._data.getInt16(this.offset, this.littleEndian);
	        this.offset += 2;
	        return value;
	    }

	    readUint16() {
	        var value = this._data.getUint16(this.offset, this.littleEndian);
	        this.offset += 2;
	        return value;
	    }

	    readInt32() {
	        var value = this._data.getInt32(this.offset, this.littleEndian);
	        this.offset += 4;
	        return value;
	    }

	    readUint32() {
	        var value = this._data.getUint32(this.offset, this.littleEndian);
	        this.offset += 4;
	        return value;
	    }

	    readFloat32() {
	        var value = this._data.getFloat32(this.offset, this.littleEndian);
	        this.offset += 4;
	        return value;
	    }

	    readFloat64() {
	        var value = this._data.getFloat64(this.offset, this.littleEndian);
	        this.offset += 8;
	        return value;
	    }

	    readChar() {
	        return String.fromCharCode(this.readInt8());
	    }

	    readChars(n) {
	        if (n === undefined) n = 1;
	        charArray.length = n;
	        for (var i = 0; i < n; i++) {
	            charArray[i] = this.readChar();
	        }
	        return charArray.join('');
	    }

	    writeBoolean(bool) {
	        this.writeUint8(bool ? 0xff : 0x00);
	    }

	    writeInt8(value) {
	        this.ensureAvailable(1);
	        this._data.setInt8(this.offset++, value);
	    }

	    writeUint8(value) {
	        this.ensureAvailable(1);
	        this._data.setUint8(this.offset++, value);
	    }

	    writeByte(value) {
	        this.writeUint8(value);
	    }

	    writeBytes(bytes) {
	        this.ensureAvailable(bytes.length);
	        for (var i = 0; i < bytes.length; i++) {
	            this._data.setUint8(this.offset++, bytes[i]);
	        }
	    }

	    writeInt16(value) {
	        this.ensureAvailable(2);
	        this._data.setInt16(this.offset, value, this.littleEndian);
	        this.offset += 2;
	    }

	    writeUint16(value) {
	        this.ensureAvailable(2);
	        this._data.setUint16(this.offset, value, this.littleEndian);
	        this.offset += 2;
	    }

	    writeInt32(value) {
	        this.ensureAvailable(4);
	        this._data.setInt32(this.offset, value, this.littleEndian);
	        this.offset += 4;
	    }

	    writeUint32(value) {
	        this.ensureAvailable(4);
	        this._data.setUint32(this.offset, value, this.littleEndian);
	        this.offset += 4;
	    }

	    writeFloat32(value) {
	        this.ensureAvailable(4);
	        this._data.setFloat32(this.offset, value, this.littleEndian);
	        this.offset += 4;
	    }

	    writeFloat64(value) {
	        this.ensureAvailable(8);
	        this._data.setFloat64(this.offset, value, this.littleEndian);
	        this.offset += 8;
	    }

	    writeChar(str) {
	        this.writeUint8(str.charCodeAt(0));
	    }

	    writeChars(str) {
	        for (var i = 0; i < str.length; i++) {
	            this.writeUint8(str.charCodeAt(i));
	        }
	    }

	    toArray() {
	        return new Uint8Array(this.buffer, 0, this.offset);
	    }
	}

	module.exports = IOBuffer;


/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Throws a non-valid NetCDF exception if the statement it's true
	 * @ignore
	 * @param {boolean} statement - Throws if true
	 * @param {string} reason - Reason to throw
	 */
	function notNetcdf(statement, reason) {
	    if (statement) {
	        throw new TypeError('Not a valid NetCDF v3.x file: ' + reason);
	    }
	}

	/**
	 * Moves 1, 2, or 3 bytes to next 4-byte boundary
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 */
	function padding(buffer) {
	    if ((buffer.offset % 4) !== 0) {
	        buffer.skip(4 - (buffer.offset % 4));
	    }
	}


	/**
	 * Reads the name
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @return {string} - Name
	 */
	function readName(buffer) {
	    // Read name
	    var nameLength = buffer.readUint32();
	    var name = buffer.readChars(nameLength);

	    // validate name
	    // TODO

	    // Apply padding
	    padding(buffer);
	    return name;
	}

	module.exports.notNetcdf = notNetcdf;
	module.exports.padding = padding;
	module.exports.readName = readName;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const types = __webpack_require__(4);

	// const STREAMING = 4294967295;

	/**
	 * Read data for the given non-record variable
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @param {object} variable - Variable metadata
	 * @return {Array} - Data of the element
	 */
	function nonRecord(buffer, variable) {
	    // variable type
	    const type = types.str2num(variable.type);

	    // size of the data
	    var size = variable.size / types.num2bytes(type);

	    // iterates over the data
	    var data = new Array(size);
	    for (var i = 0; i < size; i++) {
	        data[i] = types.readType(buffer, type, 1);
	    }

	    return data;
	}

	/**
	 * Read data for the given record variable
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @param {object} variable - Variable metadata
	 * @param {object} recordDimension - Record dimension metadata
	 * @return {Array} - Data of the element
	 */
	function record(buffer, variable, recordDimension) {
	    // variable type
	    const type = types.str2num(variable.type);

	    // size of the data
	    // TODO streaming data
	    var size = recordDimension.length;

	    // iterates over the data
	    var data = new Array(size);
	    const step = recordDimension.recordStep;

	    for (var i = 0; i < size; i++) {
	        var currentOffset = buffer.offset;
	        data[i] = types.readType(buffer, type, 1);
	        buffer.seek(currentOffset + step);
	    }

	    return data;
	}

	module.exports.nonRecord = nonRecord;
	module.exports.record = record;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const notNetcdf = __webpack_require__(2).notNetcdf;

	const types = {
	    BYTE: 1,
	    CHAR: 2,
	    SHORT: 3,
	    INT: 4,
	    FLOAT: 5,
	    DOUBLE: 6
	};

	/**
	 * Parse a number into their respective type
	 * @ignore
	 * @param {number} type - integer that represents the type
	 * @return {string} - parsed value of the type
	 */
	function num2str(type) {
	    switch (Number(type)) {
	        case types.BYTE:
	            return 'byte';
	        case types.CHAR:
	            return 'char';
	        case types.SHORT:
	            return 'short';
	        case types.INT:
	            return 'int';
	        case types.FLOAT:
	            return 'float';
	        case types.DOUBLE:
	            return 'double';
	        /* istanbul ignore next */
	        default:
	            return 'undefined';
	    }
	}

	/**
	 * Parse a number type identifier to his size in bytes
	 * @ignore
	 * @param {number} type - integer that represents the type
	 * @return {number} -size of the type
	 */
	function num2bytes(type) {
	    switch (Number(type)) {
	        case types.BYTE:
	            return 1;
	        case types.CHAR:
	            return 1;
	        case types.SHORT:
	            return 2;
	        case types.INT:
	            return 4;
	        case types.FLOAT:
	            return 4;
	        case types.DOUBLE:
	            return 8;
	        /* istanbul ignore next */
	        default:
	            return -1;
	    }
	}

	/**
	 * Reverse search of num2str
	 * @ignore
	 * @param {string} type - string that represents the type
	 * @return {number} - parsed value of the type
	 */
	function str2num(type) {
	    switch (String(type)) {
	        case 'byte':
	            return types.BYTE;
	        case 'char':
	            return types.CHAR;
	        case 'short':
	            return types.SHORT;
	        case 'int':
	            return types.INT;
	        case 'float':
	            return types.FLOAT;
	        case 'double':
	            return types.DOUBLE;
	        /* istanbul ignore next */
	        default:
	            return -1;
	    }
	}

	/**
	 * Auxiliary function to read numeric data
	 * @ignore
	 * @param {number} size - Size of the element to read
	 * @param {function} bufferReader - Function to read next value
	 * @return {Array<number>|number}
	 */
	function readNumber(size, bufferReader) {
	    if (size !== 1) {
	        var numbers = new Array(size);
	        for (var i = 0; i < size; i++) {
	            numbers[i] = bufferReader();
	        }
	        return numbers;
	    } else {
	        return bufferReader();
	    }
	}

	/**
	 * Given a type and a size reads the next element
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @param {number} type - Type of the data to read
	 * @param {number} size - Size of the element to read
	 * @return {string|Array<number>|number}
	 */
	function readType(buffer, type, size) {
	    switch (type) {
	        case types.BYTE:
	            return buffer.readBytes(size);
	        case types.CHAR:
	            return trimNull(buffer.readChars(size));
	        case types.SHORT:
	            return readNumber(size, buffer.readInt16.bind(buffer));
	        case types.INT:
	            return readNumber(size, buffer.readInt32.bind(buffer));
	        case types.FLOAT:
	            return readNumber(size, buffer.readFloat32.bind(buffer));
	        case types.DOUBLE:
	            return readNumber(size, buffer.readFloat64.bind(buffer));
	        /* istanbul ignore next */
	        default:
	            notNetcdf(true, 'non valid type ' + type);
	            return undefined;
	    }
	}

	/**
	 * Removes null terminate value
	 * @ignore
	 * @param {string} value - String to trim
	 * @return {string} - Trimmed string
	 */
	function trimNull(value) {
	    if (value.charCodeAt(value.length - 1) === 0) {
	        return value.substring(0, value.length - 1);
	    }
	    return value;
	}

	module.exports = types;
	module.exports.num2str = num2str;
	module.exports.num2bytes = num2bytes;
	module.exports.str2num = str2num;
	module.exports.readType = readType;


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	const utils = __webpack_require__(2);
	const types = __webpack_require__(4);

	// Grammar constants
	const ZERO = 0;
	const NC_DIMENSION = 10;
	const NC_VARIABLE = 11;
	const NC_ATTRIBUTE = 12;

	/**
	 * Read the header of the file
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @return {object} - Object with the fields:
	 *  * `recordDimension`: Number with the length of record dimension
	 *  * `dimensions`: List of dimensions
	 *  * `globalAttributes`: List of global attributes
	 *  * `variables`: List of variables
	 */
	function header(buffer) {
	    // Length of record dimension
	    // sum of the varSize's of all the record variables.
	    var header = {recordDimension: {length: buffer.readUint32()}};

	    // List of dimensions
	    var dimList = dimensionsList(buffer);
	    header.recordDimension.id = dimList.recordId;
	    header.recordDimension.name = dimList.recordName;
	    header.dimensions = dimList.dimensions;

	    // List of global attributes
	    header.globalAttributes = attributesList(buffer);

	    // List of variables
	    var variables = variablesList(buffer, dimList.recordId);
	    header.variables = variables.variables;
	    header.recordDimension.recordStep = variables.recordStep;

	    return header;
	}

	/**
	 * List of dimensions
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @return {object} - List of dimensions and record dimension with:
	 *  * `name`: String with the name of the dimension
	 *  * `size`: Number with the size of the dimension
	 */
	function dimensionsList(buffer) {
	    var recordId, recordName;
	    const dimList = buffer.readUint32();
	    if (dimList === ZERO) {
	        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of dimensions');
	        return [];
	    } else {
	        utils.notNetcdf((dimList !== NC_DIMENSION), 'wrong tag for list of dimensions');

	        // Length of dimensions
	        const dimensionSize = buffer.readUint32();
	        var dimensions = new Array(dimensionSize);
	        for (var dim = 0; dim < dimensionSize; dim++) {
	            // Read name
	            var name = utils.readName(buffer);

	            // Read dimension size
	            const size = buffer.readUint32();
	            if (size === 0) {
	                recordId = dim;
	                recordName = name;
	            }

	            dimensions[dim] = {
	                name: name,
	                size: size
	            };
	        }
	    }
	    return {
	        dimensions: dimensions,
	        recordId: recordId,
	        recordName: recordName
	    };
	}

	/**
	 * List of attributes
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @return {Array<object>} - List of attributes with:
	 *  * `name`: String with the name of the attribute
	 *  * `type`: String with the type of the attribute
	 *  * `value`: A number or string with the value of the attribute
	 */
	function attributesList(buffer) {
	    const gAttList = buffer.readUint32();
	    if (gAttList === ZERO) {
	        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of attributes');
	        return [];
	    } else {
	        utils.notNetcdf((gAttList !== NC_ATTRIBUTE), 'wrong tag for list of attributes');

	        // Length of attributes
	        const attributeSize = buffer.readUint32();
	        var attributes = new Array(attributeSize);
	        for (var gAtt = 0; gAtt < attributeSize; gAtt++) {
	            // Read name
	            var name = utils.readName(buffer);

	            // Read type
	            var type = buffer.readUint32();
	            utils.notNetcdf(((type < 1) || (type > 6)), 'non valid type ' + type);

	            // Read attribute
	            var size = buffer.readUint32();
	            var value = types.readType(buffer, type, size);

	            // Apply padding
	            utils.padding(buffer);

	            attributes[gAtt] = {
	                name: name,
	                type: types.num2str(type),
	                value: value
	            };
	        }
	    }
	    return attributes;
	}

	/**
	 * List of variables
	 * @ignore
	 * @param {IOBuffer} buffer - Buffer for the file data
	 * @param {number} recordId - Id if the record dimension
	 * @return {object} - Number of recordStep and list of variables with:
	 *  * `name`: String with the name of the variable
	 *  * `dimensions`: Array with the dimension IDs of the variable
	 *  * `attributes`: Array with the attributes of the variable
	 *  * `type`: String with the type of the variable
	 *  * `size`: Number with the size of the variable
	 *  * `offset`: Number with the offset where of the variable begins
	 *  * `record`: True if is a record variable, false otherwise
	 */
	function variablesList(buffer, recordId) {
	    const varList = buffer.readUint32();
	    var recordStep = 0;
	    if (varList === ZERO) {
	        utils.notNetcdf((buffer.readUint32() !== ZERO), 'wrong empty tag for list of variables');
	        return [];
	    } else {
	        utils.notNetcdf((varList !== NC_VARIABLE), 'wrong tag for list of variables');

	        // Length of variables
	        const variableSize = buffer.readUint32();
	        var variables = new Array(variableSize);
	        for (var v = 0; v < variableSize; v++) {
	            // Read name
	            var name = utils.readName(buffer);

	            // Read dimensionality of the variable
	            const dimensionality = buffer.readUint32();

	            // Index into the list of dimensions
	            var dimensionsIds = new Array(dimensionality);
	            for (var dim = 0; dim < dimensionality; dim++) {
	                dimensionsIds[dim] = buffer.readUint32();
	            }

	            // Read variables size
	            var attributes = attributesList(buffer);

	            // Read type
	            var type = buffer.readUint32();
	            utils.notNetcdf(((type < 1) && (type > 6)), 'non valid type ' + type);

	            // Read variable size
	            // The 32-bit varSize field is not large enough to contain the size of variables that require
	            // more than 2^32 - 4 bytes, so 2^32 - 1 is used in the varSize field for such variables.
	            const varSize = buffer.readUint32();

	            // Read offset
	            // TODO change it for supporting 64-bit
	            const offset = buffer.readUint32();

	            // Count amount of record variables
	            if (dimensionsIds[0] === recordId) {
	                recordStep += varSize;
	            }

	            variables[v] = {
	                name: name,
	                dimensions: dimensionsIds,
	                attributes: attributes,
	                type: types.num2str(type),
	                size: varSize,
	                offset: offset,
	                record: (dimensionsIds[0] === recordId)
	            };
	        }
	    }

	    return {
	        variables: variables,
	        recordStep: recordStep
	    };
	}

	module.exports = header;


/***/ }
/******/ ])
});
;