import { readFileSync } from "fs";

const { NetCDFReader } = require("..");

const pathFiles = `${__dirname}/files/`;

test("dataVariableExists", () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.dataVariableExists("instrument_name")).toBe(true);
  expect(reader.dataVariableExists("instrument_nameXX")).toBe(false);
});
