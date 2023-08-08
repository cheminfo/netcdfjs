import { readFileSync } from 'fs';

import { NetCDFReader } from '../parser';

const pathFiles = `${__dirname}/files/`;

test('attributeExists', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  const reader = new NetCDFReader(data);
  expect(reader.attributeExists('operator_name')).toBe(true);
  expect(reader.attributeExists('operator_nameXX')).toBe(false);
});
