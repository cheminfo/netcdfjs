# netcdfjs

[![NPM version][npm-image]][npm-url]
[![build status][ci-image]][ci-url]
[![Test coverage][codecov-image]][codecov-url]
[![npm download][download-image]][download-url]

Read and explore NetCDF v3 files.

## Installation

`$ npm install netcdfjs`

## [API Documentation](https://cheminfo.github.io/netcdfjs/)

For further information about the grammar you should go to [this link](https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html).

### Example

```js
const { readFileSync } = require("fs");
const { NetCDFReader } = require("netcdfjs");

// http://www.unidata.ucar.edu/software/netcdf/examples/files.html
const data = readFileSync("madis-sao.nc");

var reader = new NetCDFReader(data); // read the header
reader.getDataVariable("wmoId"); // go to offset and read it
```

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/netcdfjs.svg
[npm-url]: https://www.npmjs.com/package/netcdfjs
[ci-image]: https://github.com/cheminfo/netcdfjs/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/netcdfjs/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/netcdfjs.svg
[codecov-url]: https://codecov.io/gh/cheminfo/netcdfjs
[download-image]: https://img.shields.io/npm/dm/netcdfjs.svg
