import { src, dest, series, watch, TaskFunction } from "gulp"
import babel from "gulp-babel"
import jest from "gulp-jest"

import { dependencies, format, typecheck, docs } from "./utils"

/**
 * In three simple Gulp tasks Sip will drive your JavaScript development to new productive heights! 📈
 *
 * @typedef {object} Sip
 * @property {TaskFunction} test check dependencies, check types, generate a README and run Jest
 * @property {TaskFunction} develop all the above and also watch for changes
 * @property {TaskFunction} build all the above and also formats your files and compiles your `lib` into `dist` with Babel
 */

/**
 * `Sip.setup` will return an object of Tasks that you can use in your `gulpfile.js` 🥂
 *
 * ```
 * import * as Sip from "@talon/sip"
 *
 * // for individual projects you can use the __dirname as the root
 * Object.assign(exports, Sip.setup(__dirname))
 * ```
 *
 * ```
 * // lerna exec provides LERNA_PACKAGE_NAME as an environment variable
 * const pkg = process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)
 *
 * // which can be used to apply the package root for each package on the fly
 * Object.assign(exports, Sip.setup(`${__dirname}/packages/${pkg}`))
 * ```
 *
 * @param {string} root the root path of the package to operate on
 * @returns {Sip} initalized Gulp tasks
 */
export function setup(root) {
  if (!root)
    throw new Error("Please provide the root path of the package to operate on")
  return {
    test: test(root, { fix: true }),
    develop: develop(root),
    build: build(root)
  }
}

/**
 * - ✅ adds and removes dependencies from `package.json` as they are used in `lib` using [depcheck](https://github.com/depcheck/depcheck)
 * - ✅ lints `lib` for [JSDoc comments](https://jsdoc.app/), fixes what it can automatically
 * - ✅ typechecks `lib` from the JSDoc comments using [TypeScript](https://www.typescriptlang.org/docs/handbook/type-checking-javascript-files.html#supported-jsdoc)
 * - ✅ generates a README from the `lib` JSDoc comments with [documentation.js](https://documentation.js.org/)
 * - ✅ runs Jest
 *   - with [@talon/lit](https://github.com/talon/javascript-registry/packages/92916) you can test your README
 *
 * ```js
 * describe("readme driven development", () => {
 *   it("is lit! 🔥", () => expect(true).toBeTruthy())
 * })
 * ```
 *
 * You can [configure documentation.js](https://github.com/documentationjs/documentation/blob/master/docs/CONFIG.md) to tweak the README generation and/or also [configure Jest](https://jestjs.io/docs/en/configuration) as you please
 *
 * ESLint is used as part of the JSDoc typechecker, you can [override the rules](https://www.npmjs.com/package/eslint-plugin-jsdoc#eslint-plugin-jsdoc-rules) with your own [`eslintrc` file](https://eslint.org/docs/user-guide/configuring)
 *
 * @param {string} root the root path of the package to operate on
 * @param {object} options task options
 * @param {boolean} options.fix whether or not to write changes for automatically fixable issues
 * @returns {TaskFunction} the initialized gulp task
 */
export function test(root, { fix }) {
  return series(
    dependencies(root, { fix }),
    typecheck(root, { fix }),
    docs(root),
    function runJest() {
      process.env.NODE_ENV = "test"
      return src(`${root}`).pipe(
        jest({
          testRegex: new RegExp(
            `${root}\/(README.md|.+\.(usage|test)\.([jt]sx?|md))`
          )
        })
      )
    }
  )
}

/**
 * Everything that `test` does but also watches `lib` and runs again on file changes 👀
 *
 * **Note**: automatic JSDoc fixing is turned off to avoid infinite looping of this task.
 *
 * @param {string} root the root path of the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function develop(root) {
  return series(test(root, { fix: false }), function watchLib() {
    watch(`${root}/lib/**/*.js`, test(root, { fix: false }))
  })
}

/**
 * Everything that `test` does and _also_ formats your code then compiles it with Babel to `dist`
 *
 * [Babel may be configured](https://babeljs.io/docs/en/configuration) in many ways and/or if you have [prettier preferences](https://prettier.io/docs/en/configuration.html) they can be configured as well
 *
 * **this is the one you run in CI** 🔁
 *
 * @param {string} root the root path of the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function build(root) {
  return series(
    test(root, { fix: true }),
    format(root, { fix: true }),
    function compile() {
      return src(`${root}/lib/**`)
        .pipe(babel())
        .pipe(dest(`${root}/dist`, { overwrite: true }))
    }
  )
}
