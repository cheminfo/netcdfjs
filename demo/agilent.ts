import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { NetCDFReader } from '../src/index.ts';

const data = readFileSync(
  join(import.meta.dirname, '../src/__tests__/data/agilent_hplc.cdf'),
);

const reader = new NetCDFReader(data);

for (const variable of reader.variables) {
  console.log(variable.name, reader.getDataVariable(variable));
}

const ordinates = reader.getDataVariable('ordinate_values') as number[];
console.log(Math.max(...ordinates));
console.log(Math.min(...ordinates));
