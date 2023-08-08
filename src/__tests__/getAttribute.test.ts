import { readFileSync } from 'fs';

import { NetCDFReader } from '../parser';

const pathFiles = `${__dirname}/files/`;

test('getAttribute', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  const reader = new NetCDFReader(data);
  expect(reader.getAttribute('operator_name')).toBe('SC');
});
