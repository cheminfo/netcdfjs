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
import { readFileSync } from 'node:fs';

import { NetCDFReader } from 'netcdfjs';

// http://www.unidata.ucar.edu/software/netcdf/examples/files.html
const data = readFileSync('madis-sao.nc');

const reader = new NetCDFReader(data); // read the header
reader.getDataVariable('wmoId'); // go to offset and read it
```

### API

A `NetCDFReader` instance exposes:

| Member                            | Description                                                                                  |
| --------------------------------- | -------------------------------------------------------------------------------------------- |
| `version`                         | `'classic format'` or `'64-bit offset format'`.                                              |
| `dimensions`                      | List of dimensions, each with a `name` and a `size`.                                         |
| `recordDimension`                 | Metadata of the record dimension (`length`, `id`, `name`, `recordStep`).                     |
| `globalAttributes`                | List of global attributes, each with a `name`, a `type` and a `value`.                       |
| `variables`                       | List of variables, each with a `name`, `dimensions`, `attributes`, `type`, `size`, `offset`. |
| `getAttribute(name)`              | Value of a global attribute, or `null` when it does not exist.                               |
| `attributeExists(name)`           | Whether a global attribute exists.                                                           |
| `getDataVariable(nameOrVariable)` | Values of a variable. Throws when the variable does not exist.                               |
| `getDataVariableAsString(name)`   | Values of a variable joined into a string, or `null` when it does not exist.                 |
| `dataVariableExists(name)`        | Whether a variable exists.                                                                   |
| `toString()`                      | Human-readable description of the dimensions, global attributes and variables.               |

## License

[MIT](./LICENSE)

[npm-image]: https://img.shields.io/npm/v/netcdfjs.svg
[npm-url]: https://www.npmjs.com/package/netcdfjs
[ci-image]: https://github.com/cheminfo/netcdfjs/workflows/Node.js%20CI/badge.svg?branch=main
[ci-url]: https://github.com/cheminfo/netcdfjs/actions?query=workflow%3A%22Node.js+CI%22
[codecov-image]: https://img.shields.io/codecov/c/github/cheminfo/netcdfjs.svg
[codecov-url]: https://codecov.io/gh/cheminfo/netcdfjs
[download-image]: https://img.shields.io/npm/dm/netcdfjs.svg
[download-url]: https://www.npmjs.com/package/netcdfjs
