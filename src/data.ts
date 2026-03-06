import type { IOBuffer } from 'iobuffer';

import type { Header } from './header.ts';
import { num2bytes, readType, str2num } from './types.ts';
// const STREAMING = 4294967295;

/**
 * Read data for the given non-record variable
 * @param buffer - Buffer for the file data
 * @param variable - Variable metadata
 * @returns - Data of the element
 */
export function nonRecord(
  buffer: IOBuffer,
  variable: Header['variables'][number],
): Array<ReturnType<typeof readType>> {
  // variable type
  const type = str2num(variable.type);

  // size of the data
  const size = variable.size / num2bytes(type);

  // iterates over the data
  const data = new Array(size);
  for (let i = 0; i < size; i++) {
    data[i] = readType(buffer, type, 1);
  }

  return data;
}

/**
 * Read data for the given record variable
 * @param buffer - Buffer for the file data
 * @param variable - Variable metadata
 * @param recordDimension - Record dimension metadata
 * @returns - Data of the element
 */
export function record(
  buffer: IOBuffer,
  variable: Header['variables'][number],
  recordDimension: Header['recordDimension'],
): Array<ReturnType<typeof readType>> {
  // variable type
  const type = str2num(variable.type);
  const width = variable.size > 0 ? variable.size / num2bytes(type) : 1;

  // size of the data
  // TODO streaming data
  const size = recordDimension.length;

  // iterates over the data
  const data = new Array(size);
  const step = recordDimension.recordStep;
  if (step) {
    for (let i = 0; i < size; i++) {
      const currentOffset = buffer.offset;
      data[i] = readType(buffer, type, width);
      buffer.seek(currentOffset + step);
    }
  } else {
    throw new Error('recordDimension.recordStep is undefined');
  }

  return data;
}
