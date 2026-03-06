import type { NetCDFReader } from './parser.ts';

export function toString(this: NetCDFReader) {
  const result = ['DIMENSIONS'];
  for (const dimension of this.dimensions) {
    result.push(`  ${dimension.name.padEnd(30)} = size: ${dimension.size}`);
  }

  result.push('', 'GLOBAL ATTRIBUTES');
  for (const attribute of this.globalAttributes) {
    result.push(`  ${attribute.name.padEnd(30)} = ${attribute.value}`);
  }

  result.push('', 'VARIABLES:');
  for (const variable of this.variables) {
    const value = this.getDataVariable(variable);
    let stringify = JSON.stringify(value);
    if (stringify.length > 50) stringify = stringify.slice(0, 50);
    if (Array.isArray(value)) {
      stringify += ` (length: ${value.length})`;
    }
    result.push(`  ${variable.name.padEnd(30)} = ${stringify}`);
  }
  return result.join('\n');
}
