# Changelog

## [2.0.2](https://github.com/cheminfo/netcdfjs/compare/v0.7.0...v2.0.2) (2022-10-21)


### ⚠ BREAKING CHANGES

* No more default export You need to import the class using `const { NetCDFReader } = require("netcdfjs")`

### Bug Fixes

* do not trime attribute values ([d8dd69c](https://github.com/cheminfo/netcdfjs/commit/d8dd69c6582a7372630fb991e537e2dbff1da68b))
* use npm's "files" array instead of npmignore ([fd69b25](https://github.com/cheminfo/netcdfjs/commit/fd69b2575103c4cc16a91472c702a8716115066c))


### Miscellaneous Chores

* Finalise es6 module migration ([3667a0b](https://github.com/cheminfo/netcdfjs/commit/3667a0b6be1c1ab444e46b620f38234dcac5c87c))
* release correct version ([5f47151](https://github.com/cheminfo/netcdfjs/commit/5f471511c77d6176126a4198cde863e900a6e4bf))

### [2.0.1](https://github.com/cheminfo/netcdfjs/compare/v2.0.0...v2.0.1) (2021-09-07)

## [2.0.0](https://github.com/cheminfo/netcdfjs/compare/v0.7.0...v2.0.0) (2021-09-07)


### ⚠ BREAKING CHANGES

* No more default export
You need to import the class using `const { NetCDFReader } = require("netcdfjs")`

### Bug Fixes

* do not trime attribute values ([d8dd69c](https://github.com/cheminfo/netcdfjs/commit/d8dd69c6582a7372630fb991e537e2dbff1da68b))
* use npm's "files" array instead of npmignore ([fd69b25](https://github.com/cheminfo/netcdfjs/commit/fd69b2575103c4cc16a91472c702a8716115066c))


### Miscellaneous Chores

* Finalise es6 module migration ([3667a0b](https://github.com/cheminfo/netcdfjs/commit/3667a0b6be1c1ab444e46b620f38234dcac5c87c))

<a name="0.3.3"></a>
## [0.3.3](https://github.com/cheminfo-js/netcdfjs/compare/v0.3.2...v0.3.3) (2018-11-02)



<a name="0.1.0"></a>
# 0.1.0 (2016-10-31)


### Bug Fixes

* export step size for record dimension and use it ([9c95ff6](https://github.com/cheminfo-js/netcdfjs/commit/9c95ff6))


### Features

* read dimensions metadata ([aa3ae30](https://github.com/cheminfo-js/netcdfjs/commit/aa3ae30))
* read global attributes metadata ([8dc9d71](https://github.com/cheminfo-js/netcdfjs/commit/8dc9d71))
* read non-record variables ([c9a818a](https://github.com/cheminfo-js/netcdfjs/commit/c9a818a))
* read record variables ([4455705](https://github.com/cheminfo-js/netcdfjs/commit/4455705))
* read variables metadata ([11e4a68](https://github.com/cheminfo-js/netcdfjs/commit/11e4a68))
* validates that it's a NetCDF file ([1439756](https://github.com/cheminfo-js/netcdfjs/commit/1439756))



0.0.1 / HEAD
============

* first release
