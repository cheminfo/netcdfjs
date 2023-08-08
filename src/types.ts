import { IOBuffer } from 'iobuffer';

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
 * @param type - integer that represents the type
 * @return - parsed value of the type
 */
export function num2str(type: number): string {
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
    default:
      return 'undefined';
  }
}

/**
 * Parse a number type identifier to his size in bytes
 * @param type - integer that represents the type
 * @return size of the type
 */
export function num2bytes(type: number): number {
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
    default:
      return -1;
  }
}

/**
 * Reverse search of num2str
 * @param type - string that represents the type
 * @return parsed value of the type
 */
export function str2num(type: string) {
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
 * @param size - Size of the element to read
 * @param bufferReader - Function to read next value
 * @return
 */
function readNumber(
  size: number,
  bufferReader: () => number,
): number | number[] {
  if (size !== 1) {
    const numbers = new Array(size);
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
 * @param buffer - Buffer for the file data
 * @param type - Type of the data to read
 * @param size - Size of the element to read
 * @return
 */
export function readType(
  buffer: IOBuffer,
  type: number,
  size: number,
): string | number | number[] {
  switch (type) {
    case types.BYTE:
      return Array.from(buffer.readBytes(size));
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
    default:
      throw new Error(`non valid type ${type}`);
  }
}

/**
 * Removes null terminate value
 * @param value - String to trim
 * @return - Trimmed string
 */
function trimNull(value: string): string {
  if (value.charCodeAt(value.length - 1) === 0) {
    return value.substring(0, value.length - 1);
  }
  return value;
}
