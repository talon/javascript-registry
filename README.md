# JavaScript Registry [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

> a javacript collection

[browse all packages](https://github.com/talon/javascript-registry/packages)

# Usage

add this line to your project's `.npmrc`

```
registry=https://npm.pkg.github.com/talon
```

and install a package

```sh
npm install @talon/[package]
```

# Scripts

`npm run [command]`

| command | description                                      |
| ------- | ------------------------------------------------ |
| format  | format every package                             |
| docs    | generate API docs in every package's `README.md` |
| test    | run every packages test suite                    |
| build   | build every package's `dist` folder              |
| publish | publish changed packages                         |
| new     | generate a new package                           |

# About

This is a [Lerna](https://github.com/lerna/lerna) repo backed by the [GitHub Package Registry](https://github.com/features/package-registry).
