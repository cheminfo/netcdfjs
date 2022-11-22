import { readFileSync } from 'fs';

import { NetCDFReader } from '../index';

const pathFiles = `${__dirname}/files/`;

test('dataVariableExists', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.dataVariableExists('instrument_name')).toBe(true);
  expect(reader.dataVariableExists('instrument_nameXX')).toBe(false);
});
