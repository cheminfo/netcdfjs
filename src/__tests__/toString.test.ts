import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { expect, test } from 'vitest';

import { NetCDFReader } from '../parser.ts';

const pathFiles = join(import.meta.dirname, 'data');

test('toString', () => {
  const data = readFileSync(join(pathFiles, 'P071.CDF'));
  const reader = new NetCDFReader(data);

  expect(reader.toString()).toMatchSnapshot();
});
