import { IOBuffer } from 'iobuffer';
/**
 * Throws a non-valid NetCDF exception if the statement it's true
 * @ignore
 * @param statement - Throws if true
 * @param reason - Reason to throw
 */
export function notNetcdf(statement: boolean, reason: string) {
  if (statement) {
    throw new TypeError(`Not a valid NetCDF v3.x file: ${reason}`);
  }
}

/**
 * Moves 1, 2, or 3 bytes to next 4-byte boundary
 * @param buffer - Buffer for the file data
 */
export function padding(buffer: IOBuffer) {
  if (buffer.offset % 4 !== 0) {
    buffer.skip(4 - (buffer.offset % 4));
  }
}

/**
 * Reads the name
 * @param buffer - Buffer for the file data
 * @return Name
 */
export function readName(buffer: IOBuffer) {
  // Read name
  const nameLength = buffer.readUint32();
  const name = buffer.readChars(nameLength);

  // validate name
  // TODO
  // Apply padding
  padding(buffer);
  return name;
}
