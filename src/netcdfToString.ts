import type { NetCDFReader } from './parser.ts';

/**
 * Describes the content of a NetCDF file as a human-readable string.
 * @param reader - Reader to describe.
 * @returns The description of the dimensions, global attributes and variables.
 */
export function netcdfToString(reader: NetCDFReader) {
  const result = ['DIMENSIONS'];
  for (const dimension of reader.dimensions) {
    result.push(`  ${dimension.name.padEnd(30)} = size: ${dimension.size}`);
  }

  result.push('', 'GLOBAL ATTRIBUTES');
  for (const attribute of reader.globalAttributes) {
    result.push(`  ${attribute.name.padEnd(30)} = ${attribute.value}`);
  }

  result.push('', 'VARIABLES:');
  for (const variable of reader.variables) {
    const value = reader.getDataVariable(variable);
    let stringify = JSON.stringify(value);
    if (stringify.length > 50) stringify = stringify.slice(0, 50);
    if (Array.isArray(value)) {
      stringify += ` (length: ${value.length})`;
    }
    result.push(`  ${variable.name.padEnd(30)} = ${stringify}`);
  }
  return result.join('\n');
}
