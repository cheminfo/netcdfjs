'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var iobuffer = require('iobuffer');

/**
 * Throws a non-valid NetCDF exception if the statement it's true
 * @ignore
 * @param {boolean} statement - Throws if true
 * @param {string} reason - Reason to throw
 */
function notNetcdf(statement, reason) {
  if (statement) {
    throw new TypeError(`Not a valid NetCDF v3.x file: ${reason}`);
  }
}

/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 */
function padding(buffer) {
  if (buffer.offset % 4 !== 0) {
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
  let nameLength = buffer.readUint32();
  let name = buffer.readChars(nameLength);

  // validate name
  // TODO

  // Apply padding
  padding(buffer);
  return name;
}

const types = {
  BYTE: 1,
  CHAR: 2,
  SHORT: 3,
  INT: 4,
  FLOAT: 5,
  DOUBLE: 6,
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
      return "byte";
    case types.CHAR:
      return "char";
    case types.SHORT:
      return "short";
    case types.INT:
      return "int";
    case types.FLOAT:
      return "float";
    case types.DOUBLE:
      return "double";
    /* istanbul ignore next */
    default:
      return "undefined";
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
    case "byte":
      return types.BYTE;
    case "char":
      return types.CHAR;
    case "short":
      return types.SHORT;
    case "int":
      return types.INT;
    case "float":
      return types.FLOAT;
    case "double":
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
    let numbers = new Array(size);
    for (let i = 0; i < size; i++) {
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
      notNetcdf(true, `non valid type ${type}`);
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
  const type = str2num(variable.type);

  // size of the data
  let size = variable.size / num2bytes(type);

  // iterates over the data
  let data = new Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = readType(buffer, type, 1);
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
  const type = str2num(variable.type);
  const width = variable.size ? variable.size / num2bytes(type) : 1;

  // size of the data
  // TODO streaming data
  let size = recordDimension.length;

  // iterates over the data
  let data = new Array(size);
  const step = recordDimension.recordStep;

  for (let i = 0; i < size; i++) {
    let currentOffset = buffer.offset;
    data[i] = readType(buffer, type, width);
    buffer.seek(currentOffset + step);
  }

  return data;
}

// Grammar constants
const ZERO = 0;
const NC_DIMENSION = 10;
const NC_VARIABLE = 11;
const NC_ATTRIBUTE = 12;

/**
 * Read the header of the file
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} version - Version of the file
 * @return {object} - Object with the fields:
 *  * `recordDimension`: Number with the length of record dimension
 *  * `dimensions`: List of dimensions
 *  * `globalAttributes`: List of global attributes
 *  * `variables`: List of variables
 */
function header(buffer, version) {
  // Length of record dimension
  // sum of the varSize's of all the record variables.
  let header = { recordDimension: { length: buffer.readUint32() } };

  // Version
  header.version = version;

  // List of dimensions
  let dimList = dimensionsList(buffer);
  header.recordDimension.id = dimList.recordId; // id of the unlimited dimension
  header.recordDimension.name = dimList.recordName; // name of the unlimited dimension
  header.dimensions = dimList.dimensions;

  // List of global attributes
  header.globalAttributes = attributesList(buffer);

  // List of variables
  let variables = variablesList(buffer, dimList.recordId, version);
  header.variables = variables.variables;
  header.recordDimension.recordStep = variables.recordStep;

  return header;
}

const NC_UNLIMITED = 0;

/**
 * List of dimensions
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @return {object} - Ojbect containing the following properties:
 *  * `dimensions` that is an array of dimension object:
 *  * `name`: String with the name of the dimension
 *  * `size`: Number with the size of the dimension dimensions: dimensions
 *  * `recordId`: the id of the dimension that has unlimited size or undefined,
 *  * `recordName`: name of the dimension that has unlimited size
 */
function dimensionsList(buffer) {
  let recordId, recordName;
  const dimList = buffer.readUint32();
  let dimensions;
  if (dimList === ZERO) {
    notNetcdf(
      buffer.readUint32() !== ZERO,
      "wrong empty tag for list of dimensions"
    );
    return [];
  } else {
    notNetcdf(dimList !== NC_DIMENSION, "wrong tag for list of dimensions");

    // Length of dimensions
    const dimensionSize = buffer.readUint32();
    dimensions = new Array(dimensionSize);
    for (let dim = 0; dim < dimensionSize; dim++) {
      // Read name
      let name = readName(buffer);

      // Read dimension size
      const size = buffer.readUint32();
      if (size === NC_UNLIMITED) {
        // in netcdf 3 one field can be of size unlimmited
        recordId = dim;
        recordName = name;
      }

      dimensions[dim] = {
        name: name,
        size: size,
      };
    }
  }
  return {
    dimensions,
    recordId,
    recordName,
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
  let attributes;
  if (gAttList === ZERO) {
    notNetcdf(
      buffer.readUint32() !== ZERO,
      "wrong empty tag for list of attributes"
    );
    return [];
  } else {
    notNetcdf(gAttList !== NC_ATTRIBUTE, "wrong tag for list of attributes");

    // Length of attributes
    const attributeSize = buffer.readUint32();
    attributes = new Array(attributeSize);
    for (let gAtt = 0; gAtt < attributeSize; gAtt++) {
      // Read name
      let name = readName(buffer);

      // Read type
      let type = buffer.readUint32();
      notNetcdf(type < 1 || type > 6, `non valid type ${type}`);

      // Read attribute
      let size = buffer.readUint32();
      let value = readType(buffer, type, size);

      // Apply padding
      padding(buffer);

      attributes[gAtt] = {
        name,
        type: num2str(type),
        value,
      };
    }
  }
  return attributes;
}

/**
 * List of variables
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param {number} recordId - Id of the unlimited dimension (also called record dimension)
 *                            This value may be undefined if there is no unlimited dimension
 * @param {number} version - Version of the file
 * @return {object} - Number of recordStep and list of variables with:
 *  * `name`: String with the name of the variable
 *  * `dimensions`: Array with the dimension IDs of the variable
 *  * `attributes`: Array with the attributes of the variable
 *  * `type`: String with the type of the variable
 *  * `size`: Number with the size of the variable
 *  * `offset`: Number with the offset where of the variable begins
 *  * `record`: True if is a record variable, false otherwise (unlimited size)
 */

function variablesList(buffer, recordId, version) {
  const varList = buffer.readUint32();
  let recordStep = 0;
  let variables;
  if (varList === ZERO) {
    notNetcdf(
      buffer.readUint32() !== ZERO,
      "wrong empty tag for list of variables"
    );
    return [];
  } else {
    notNetcdf(varList !== NC_VARIABLE, "wrong tag for list of variables");

    // Length of variables
    const variableSize = buffer.readUint32();
    variables = new Array(variableSize);
    for (let v = 0; v < variableSize; v++) {
      // Read name
      let name = readName(buffer);

      // Read dimensionality of the variable
      const dimensionality = buffer.readUint32();

      // Index into the list of dimensions
      let dimensionsIds = new Array(dimensionality);
      for (let dim = 0; dim < dimensionality; dim++) {
        dimensionsIds[dim] = buffer.readUint32();
      }

      // Read variables size
      let attributes = attributesList(buffer);

      // Read type
      let type = buffer.readUint32();
      notNetcdf(type < 1 && type > 6, `non valid type ${type}`);

      // Read variable size
      // The 32-bit varSize field is not large enough to contain the size of variables that require
      // more than 2^32 - 4 bytes, so 2^32 - 1 is used in the varSize field for such variables.
      const varSize = buffer.readUint32();

      // Read offset
      let offset = buffer.readUint32();
      if (version === 2) {
        notNetcdf(offset > 0, "offsets larger than 4GB not supported");
        offset = buffer.readUint32();
      }

      let record = false;
      // Count amount of record variables
      if (typeof recordId !== "undefined" && dimensionsIds[0] === recordId) {
        recordStep += varSize;
        record = true;
      }
      variables[v] = {
        name: name,
        dimensions: dimensionsIds,
        attributes,
        type: num2str(type),
        size: varSize,
        offset,
        record,
      };
    }
  }

  return {
    variables,
    recordStep,
  };
}

function toString() {
  let result = [];

  result.push("DIMENSIONS");
  for (let dimension of this.dimensions) {
    result.push(`  ${dimension.name.padEnd(30)} = size: ${dimension.size}`);
  }

  result.push("");
  result.push("GLOBAL ATTRIBUTES");
  for (let attribute of this.globalAttributes) {
    result.push(`  ${attribute.name.padEnd(30)} = ${attribute.value}`);
  }

  let variables = JSON.parse(JSON.stringify(this.variables));
  result.push("");
  result.push("VARIABLES:");
  for (let variable of variables) {
    variable.value = this.getDataVariable(variable);
    let stringify = JSON.stringify(variable.value);
    if (stringify.length > 50) stringify = stringify.substring(0, 50);
    if (!isNaN(variable.value.length)) {
      stringify += ` (length: ${variable.value.length})`;
    }
    result.push(`  ${variable.name.padEnd(30)} = ${stringify}`);
  }
  return result.join("\n");
}

/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 * @param {ArrayBuffer} data - ArrayBuffer or any Typed Array (including Node.js' Buffer from v4) with the data
 * @constructor
 */
class NetCDFReader {
  constructor(data) {
    const buffer = new iobuffer.IOBuffer(data);
    buffer.setBigEndian();

    // Validate that it's a NetCDF file
    notNetcdf(buffer.readChars(3) !== "CDF", "should start with CDF");

    // Check the NetCDF format
    const version = buffer.readByte();
    notNetcdf(version > 2, "unknown version");

    // Read the header
    this.header = header(buffer, version);
    this.buffer = buffer;
  }

  /**
   * @return {string} - Version for the NetCDF format
   */
  get version() {
    if (this.header.version === 1) {
      return "classic format";
    } else {
      return "64-bit offset format";
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
   * Returns the value of an attribute
   * @param {string} attributeName
   * @return {string} Value of the attributeName or null
   */
  getAttribute(attributeName) {
    const attribute = this.globalAttributes.find(
      (val) => val.name === attributeName
    );
    if (attribute) return attribute.value;
    return null;
  }

  /**
   * Returns the value of a variable as a string
   * @param {string} variableName
   * @return {string} Value of the variable as a string or null
   */
  getDataVariableAsString(variableName) {
    const variable = this.getDataVariable(variableName);
    if (variable) return variable.join("");
    return null;
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

  toString() {
    return toString.call(this);
  }

  /**
   * Retrieves the data for a given variable
   * @param {string|object} variableName - Name of the variable to search or variable object
   * @return {Array} - List with the variable values
   */
  getDataVariable(variableName) {
    let variable;
    if (typeof variableName === "string") {
      // search the variable
      variable = this.header.variables.find((val) => {
        return val.name === variableName;
      });
    } else {
      variable = variableName;
    }

    // throws if variable not found
    notNetcdf(variable === undefined, `variable not found: ${variableName}`);

    // go to the offset position
    this.buffer.seek(variable.offset);

    if (variable.record) {
      // record variable case
      return record(this.buffer, variable, this.header.recordDimension);
    } else {
      // non-record variable case
      return nonRecord(this.buffer, variable);
    }
  }

  /**
   * Check if a dataVariable exists
   * @param {string} variableName - Name of the variable to find
   * @return {boolean}
   */
  dataVariableExists(variableName) {
    const variable = this.header.variables.find((val) => {
      return val.name === variableName;
    });
    return variable !== undefined;
  }

  /**
   * Check if an attribute exists
   * @param {string} attributeName - Name of the attribute to find
   * @return {boolean}
   */
  attributeExists(attributeName) {
    const attribute = this.globalAttributes.find(
      (val) => val.name === attributeName
    );
    return attribute !== undefined;
  }
}

exports.NetCDFReader = NetCDFReader;
