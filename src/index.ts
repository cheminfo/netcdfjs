import { IOBuffer } from 'iobuffer';

import { record, nonRecord } from './data';
import { Header, header } from './header';
import { toString } from './toString';
import { notNetcdf } from './utils';

/**
 * Reads a NetCDF v3.x file
 * https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html
 * @param data - ArrayBuffer or any Typed Array (including Node.js' Buffer from v4) with the data
 * @constructor
 */
export class NetCDFReader {
  public header: Header;
  public buffer: IOBuffer;

  constructor(data: ArrayBuffer) {
    const buffer = new IOBuffer(data);
    buffer.setBigEndian();

    // Validate that it's a NetCDF file
    notNetcdf(buffer.readChars(3) !== 'CDF', 'should start with CDF');

    // Check the NetCDF format
    const version = buffer.readByte();
    notNetcdf(version > 2, 'unknown version');

    // Read the header
    this.header = header(buffer, version);
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
   * Returns the value of an attribute
   * @param attributeName
   * @return {string} Value of the attributeName or null
   */
  getAttribute(attributeName: string) {
    const attribute = this.globalAttributes.find(
      (val) => val.name === attributeName,
    );
    if (attribute) return attribute.value;
    return null;
  }

  /**
   * Returns the value of a variable as a string
   * @param variableName
   * @return {string} Value of the variable as a string or null
   */
  getDataVariableAsString(variableName: string) {
    const variable = this.getDataVariable(variableName);
    if (variable) return variable.join('');
    return null;
  }

  get variables() {
    return this.header.variables;
  }

  toString() {
    return toString.call(this);
  }

  /**
   * Retrieves the data for a given variable
   * @param variableName - Name of the variable to search or variable object
   * @return {Array} - List with the variable values
   */
  getDataVariable(variableName: string | Header['variables'][number]) {
    let variable;
    if (typeof variableName === 'string') {
      // search the variable
      variable = this.header.variables.find((val) => {
        return val.name === variableName;
      });
    } else {
      variable = variableName;
    }

    // throws if variable not found
    if (!variable) {
      throw new Error(`variable not found: ${variableName as string}`);
    }

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
   * @param variableName - Name of the variable to find
   * @return {boolean}
   */
  dataVariableExists(variableName: string) {
    const variable = this.header.variables.find((val) => {
      return val.name === variableName;
    });
    return variable !== undefined;
  }

  /**
   * Check if an attribute exists
   * @param attributeName - Name of the attribute to find
   * @return {boolean}
   */
  attributeExists(attributeName: string) {
    const attribute = this.globalAttributes.find(
      (val) => val.name === attributeName,
    );
    return attribute !== undefined;
  }
}