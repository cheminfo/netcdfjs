import { readFileSync } from 'fs';

import { NetCDFReader } from '../parser';

const pathFiles = `${__dirname}/files/`;

test('dataVariableExists', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  const reader = new NetCDFReader(data);
  expect(reader.dataVariableExists('instrument_name')).toBe(true);
  expect(reader.dataVariableExists('instrument_nameXX')).toBe(false);
});
