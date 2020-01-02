# JavaScript Registry

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org) [![Standard Version](https://img.shields.io/badge/release-standard%20version-brightgreen.svg)](https://github.com/conventional-changelog/standard-version) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![](https://github.com/talon/javascript-registry/workflows/CI/badge.svg)](https://github.com/talon/javascript-registry/actions?query=workflow%3A%22CI%22)

[![](https://badgen.net/badge/depends%20on/yarn/blue)](https://yarnpkg.com/lang/en/) [![built with gulp](https://img.shields.io/badge/gulp-built_project-eb4a4b.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAAYAAAAOCAMAAAA7QZ0XAAAABlBMVEUAAAD%2F%2F%2F%2Bl2Z%2FdAAAAAXRSTlMAQObYZgAAABdJREFUeAFjAAFGRjSSEQzwUgwQkjAFAAtaAD0Ls2nMAAAAAElFTkSuQmCC)](http://gulpjs.com/) [![](https://badgen.net/badge/documented%20with/JSDoc/blue)](https://jsdoc.app/) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier) [![Typed with TypeScript](https://flat.badgen.net/badge/icon/Typed?icon=typescript&label&labelColor=blue&color=555555)](https://www.typescriptlang.org/) [![tested with jest](https://img.shields.io/badge/tested_with-jest-99424f.svg)](https://github.com/facebook/jest) [![](https://badgen.net/badge/compiled%20with/babel/yellow)](https://babeljs.io/)

# Usage

Add `https://npm.pkg.github.com/talon` as a registry in your .npmrc. See [the GitHub documentation for more info](https://help.github.com/en/github/managing-packages-with-github-packages/configuring-npm-for-use-with-github-packages#installing-a-package)

```sh
echo "registry=https://npm.pkg.github.com/talon" >> .npmrc
```

then [browse the registry](https://github.com/talon/javascript-registry/packages) and `npm install @talon/<package>` the packages you want

# Contributing

## Yarn

The registry uses [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) to manage it's dependencies

install all dependencies

```sh
npx yarn install
```

manage an individual project's dependencies

```sh
npx yarn workspace @talon/<package> [add|remove] <dependency>
```

manage the registry's dependencies

```sh
npx yarn -W [add|remove] <dependency>
```

**Note**: [@talon/sip](./packages/sip) tries to keep your dependencies up to date by _automatically adding and removing them as you use them in your source code!_

## Gulp

Every package is managed with [gulp](https://gulpjs.com/) using [@talon/sip](./packages/sip). See the [Sip README](./packages/sip/README.md) for more info

The monorepo is managed with [lerna](https://lerna.js.org/). To run gulp for every package in the registry use

```sh
npx lerna exec -- gulp [test|develop|build]
```

For one or a few packages, apply a scope

```sh
npx lerna exec --scope @talon/<package> -- gulp [test|develop|build]
```

## VS Code

These commands are also made available (and a bit more friendly) [as tasks for VS Code users](./.vscode/tasks.json). Try it: `ctrl+shift+b`!

## GitHub

Pull requests must pass the [Build Workflow](https://github.com/talon/javascript-registry/actions?query=workflow%3Abuild) before being merged

Packages are automatically released using [semantic release](https://github.com/semantic-release/semantic-release) by the [CI Workflow](https://github.com/talon/javascript-registry/actions?query=workflow%3ACI) and published to the [GitHub Registry](https://github.com/features/packages) upon merge to the master branch
