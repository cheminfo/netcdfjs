import { num2str, readType } from "./types.js";
import { padding, notNetcdf, readName } from "./utils.js";

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
export function header(buffer, version) {
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
        name,
        size,
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
        name,
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
