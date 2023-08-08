import { readFileSync } from 'fs';

import { NetCDFReader } from '../parser';

const pathFiles = `${__dirname}/files/`;

test('toString', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  const reader = new NetCDFReader(data);
  expect(reader.toString()).toMatchSnapshot();
});
