import { readFileSync as rfs } from 'node:fs';
import { join } from 'node:path';

import { NetCDFReader } from '../src/index';

const data = rfs(join(__dirname, '../src/__tests__/files/agilent_hplc.cdf'));

let reader = new NetCDFReader(data);

let selectedVariable = reader.variables[4];

reader.getDataVariable(selectedVariable);

for (let variable of reader.variables) {
  console.log(variable.name, reader.getDataVariable(variable));
}

let ordinates = reader.getDataVariable(reader.variables[5]);
console.log(Math.max(...(ordinates as number[])));
console.log(Math.min(...(ordinates as number[])));
