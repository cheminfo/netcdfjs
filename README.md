# netcdfjs

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
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

[npm-image]: https://img.shields.io/npm/v/netcdfjs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/netcdfjs
[coveralls-image]: https://img.shields.io/coveralls/cheminfo/netcdfjs.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/cheminfo/netcdfjs
[download-image]: https://img.shields.io/npm/dm/netcdfjs.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/netcdfjs
