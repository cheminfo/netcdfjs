import { IOBuffer } from 'iobuffer';

import { Header } from './header';
import { num2bytes, str2num, readType } from './types.js';
// const STREAMING = 4294967295;

/**
 * Read data for the given non-record variable
 * @ignore
 * @param buffer - Buffer for the file data
 * @param variable - Variable metadata
 * @return {Array} - Data of the element
 */
export function nonRecord(
  buffer: IOBuffer,
  variable: Header['variables'][number],
) {
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
 * @param {IOBuffer} buffer - Buffer for the file data
 * @param variable - Variable metadata
 * @param recordDimension - Record dimension metadata
 * @return {Array} - Data of the element
 */
export function record(
  buffer: IOBuffer,
  variable: Header['variables'][number],
  recordDimension: Header['recordDimension'],
) {
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
