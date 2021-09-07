import { readFileSync } from "fs";

const { NetCDFReader } = require("..");

const pathFiles = `${__dirname}/files/`;

test("getAttribute", () => {
  const data = readFileSync(`${pathFiles}P071.CDF`);

  let reader = new NetCDFReader(data);
  expect(reader.getAttribute("operator_name")).toBe("SC");
});
