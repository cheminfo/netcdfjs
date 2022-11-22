import { readFileSync } from 'fs';

import { NetCDFReader } from '../index';

const pathFiles = `${__dirname}/files/`;

test('toString', () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.toString()).toMatchSnapshot();
});
