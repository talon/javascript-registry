# JavaScript Registry [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

> a javacript collection

# Usage

you must [authenticate to the registry](https://help.github.com/en/github/managing-packages-with-github-package-registry/configuring-npm-for-use-with-github-package-registry#authenticating-to-github-package-registry) before you can install a package.

```sh
npm install @talon/[package]
```
> [browse all packages](https://github.com/talon/javascript-registry/packages)

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
