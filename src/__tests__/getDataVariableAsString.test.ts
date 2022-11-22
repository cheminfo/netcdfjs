import { readFileSync } from 'fs';

import { NetCDFReader } from '../index';

const pathFiles = `${__dirname}/files/`;

test('getDataVariableAsString', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.getDataVariableAsString('instrument_name')).toBe(
    'Gas Chromatograph',
  );
});
