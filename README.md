# netcdfjs

  [![NPM version][npm-image]][npm-url]
  [![build status][travis-image]][travis-url]
  [![Test coverage][coveralls-image]][coveralls-url]
  [![David deps][david-image]][david-url]
  [![npm download][download-image]][download-url]

Read and explore NetCDF files

## Installation

`$ npm install netcdfjs`

## [API Documentation](https://cheminfo-js.github.io/netcdfjs/)

For further information about the grammar you should go to [this link](https://www.unidata.ucar.edu/software/netcdf/docs/file_format_specifications.html).

## Example

```js
const fs = require('fs');
const NetCDFReader = require('netcdfjs');

// http://www.unidata.ucar.edu/software/netcdf/examples/files.html
const data = fs.readFileSync('madis-sao.nc');

var reader = new NetCDFReader(data); // read the header
reader.getDataVariable('wmoId'); // go to offset and read it
```

## License

  [MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/netcdfjs.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/netcdfjs
[travis-image]: https://img.shields.io/travis/cheminfo-js/netcdfjs/master.svg?style=flat-square
[travis-url]: https://travis-ci.org/cheminfo-js/netcdfjs
[coveralls-image]: https://img.shields.io/coveralls/cheminfo-js/netcdfjs.svg?style=flat-square
[coveralls-url]: https://coveralls.io/github/cheminfo-js/netcdfjs
[david-image]: https://img.shields.io/david/cheminfo-js/netcdfjs.svg?style=flat-square
[david-url]: https://david-dm.org/cheminfo-js/netcdfjs
[download-image]: https://img.shields.io/npm/dm/netcdfjs.svg?style=flat-square
[download-url]: https://www.npmjs.com/package/netcdfjs
