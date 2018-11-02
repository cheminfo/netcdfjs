'use strict';

const utils = require('./utils');
const types = require('./types');

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
  var header = { recordDimension: { length: buffer.readUint32() } };

  // Version
  header.version = version;

  // List of dimensions
  var dimList = dimensionsList(buffer);
  header.recordDimension.id = dimList.recordId; // id of the unlimited dimension
  header.recordDimension.name = dimList.recordName; // name of the unlimited dimension
  header.dimensions = dimList.dimensions;

  // List of global attributes
  header.globalAttributes = attributesList(buffer);

  // List of variables
  var variables = variablesList(buffer, dimList.recordId, version);
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
      if (size === NC_UNLIMITED) { // in netcdf 3 one field can be of size unlimmited
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
      utils.notNetcdf(((type < 1) || (type > 6)), `non valid type ${type}`);

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
      utils.notNetcdf(((type < 1) && (type > 6)), `non valid type ${type}`);

      // Read variable size
      // The 32-bit varSize field is not large enough to contain the size of variables that require
      // more than 2^32 - 4 bytes, so 2^32 - 1 is used in the varSize field for such variables.
      const varSize = buffer.readUint32();

      // Read offset
      var offset = buffer.readUint32();
      if (version === 2) {
        utils.notNetcdf((offset > 0), 'offsets larger than 4GB not supported');
        offset = buffer.readUint32();
      }

      let record = false;
      // Count amount of record variables
      if ((typeof recordId !== 'undefined') && (dimensionsIds[0] === recordId)) {
        recordStep += varSize;
        record = true;
      }
      variables[v] = {
        name: name,
        dimensions: dimensionsIds,
        attributes,
        type: types.num2str(type),
        size: varSize,
        offset,
        record
      };
    }
  }

  return {
    variables: variables,
    recordStep: recordStep
  };
}

module.exports = header;
