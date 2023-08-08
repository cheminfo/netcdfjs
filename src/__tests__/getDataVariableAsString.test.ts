import { readFileSync } from 'fs';

import { NetCDFReader } from '../parser';

const pathFiles = `${__dirname}/files/`;

test('getDataVariableAsString', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  const reader = new NetCDFReader(data);
  expect(reader.getDataVariableAsString('instrument_name')).toBe(
    'Gas Chromatograph',
  );
});
