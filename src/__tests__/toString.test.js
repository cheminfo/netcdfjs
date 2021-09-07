import { readFileSync } from "fs";

const { NetCDFReader } = require("..");

const pathFiles = `${__dirname}/files/`;

test("toString", () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.toString()).toMatchSnapshot();
});
