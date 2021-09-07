/**
 * Throws a non-valid NetCDF exception if the statement it's true
 * @ignore
 * @param {boolean} statement - Throws if true
 * @param {string} reason - Reason to throw
 */
export function notNetcdf(statement, reason) {
  if (statement) {
    throw new TypeError(`Not a valid NetCDF v3.x file: ${reason}`);
  }
}

/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 * @ignore
 * @param {IOBuffer} buffer - Buffer for the file data
 */
export function padding(buffer) {
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
export function readName(buffer) {
  // Read name
  let nameLength = buffer.readUint32();
  let name = buffer.readChars(nameLength);

  // validate name
  // TODO

  // Apply padding
  padding(buffer);
  return name;
}
