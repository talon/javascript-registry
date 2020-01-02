import { src, dest, series, watch, TaskFunction } from "gulp"
import documentation from "gulp-documentation"
import modify from "gulp-modify-file"
import eslint from "gulp-eslint"
import prettier from "gulp-prettier"
import toc from "markdown-toc"
import babel from "gulp-babel"
import jest from "gulp-jest"
import typescript from "gulp-typescript"
import check from "depcheck"
import { promisify } from "util"
import { exec } from "child_process"

/**
 * Sip is a suite of gulp tasks that make developing JavaScript less painful.
 *
 * @typedef {object} SipSuite
 * @property {TaskFunction} test check dependencies, check types, generate a README and run Jest
 * @property {TaskFunction} develop all the above and also watch for changes
 * @property {TaskFunction} build all the above and also formats your files and compiles your `lib` into `dist` with Babel
 */

/**
 * initialize Sip with a package root in your `gulpfile.js`
 *
 * @example
 * // With Lerna you can use it like this to create tasks for packages on the fly
 * Object.assign(exports, Sip.suite(`${__dirname}/packages/${process.env.LERNA_PACKAGE_NAME.split("/").slice(-1)}`))
 *
 * @example
 * // or for non-monorepo projects like this
 * Object.assign(exports, Sip.suite(__dirname))
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {SipSuite} initalized gulp tasks
 */
export function suite(pkg) {
  if (!pkg) throw new Error("Please provide a pkg")
  return {
    test: test(pkg),
    develop: develop(pkg),
    build: build(pkg)
  }
}

/**
 * With [@talon/lit](https://github.com/talon/javascript-registry/packages/92916) **you can test your README!**
 *
 * just add a js code block in your JSDoc comments 😎
 *
 * ```js
 * describe("readme driven development", () => {
 *   it("is lit! 🔥", () => expect(true).toBeTruthy())
 * })
 * ```
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function test(pkg) {
  return series(
    dependencies(pkg),
    typecheck(pkg),
    docs(pkg),
    function runJest() {
      process.env.NODE_ENV = "test"
      return src(`${pkg}`).pipe(
        jest({
          testRegex: new RegExp(
            `${pkg}\/(README.md|.+\.(usage|test)\.([jt]sx?|md))`
          )
        })
      )
    }
  )
}

/**
 * You probably want the docs and tests to update while you're in the thick of it
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function develop(pkg) {
  return series(test(pkg), function watchPkg() {
    watch(`${pkg}/lib/**`, test(pkg))
  })
}

/**
 * All of this together into one task, excellent for CI environments!
 *
 * A bunch of sips === a gulp
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function build(pkg) {
  return series(test(pkg), format(pkg), function compile() {
    return src(`${pkg}/lib/**`)
      .pipe(babel())
      .pipe(dest(`${pkg}/dist`, { overwrite: true }))
  })
}

/**
 * Automatically update dependencies adding and removing as needed
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function dependencies(pkg) {
  const name = pkg.split("/").slice(-1)

  return function checkDependencies() {
    return check(pkg, {
      ignoreDirs: ["dist"]
    })
      .then(data => {
        const missing = Object.keys(data.missing)
        return missing.length > 0
          ? promisify(exec)(
              `yarn workspace @talon/${name} add ${Object.keys(
                data.missing
              ).join(" ")}`
            ).then(() => data)
          : data
      })
      .then(data => {
        const unused = data.dependencies.concat(data.devDependencies)
        return unused.length > 0
          ? promisify(exec)(
              `yarn workspace @talon/${name} remove ${unused.join(" ")}`
            ).then(() => data)
          : data
      })
  }
}

/**
 * don't think about style
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function format(pkg) {
  return function formatFiles() {
    return src(`${pkg}/**`)
      .pipe(prettier())
      .pipe(dest(pkg))
  }
}

/**
 * Lints for and typechecks JSDoc comments
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function typecheck(pkg) {
  return series(
    function lintJSDoc() {
      return src([`${pkg}/lib/*.js`])
        .pipe(eslint({ fix: true }))
        .pipe(eslint.format())
        .pipe(eslint.failOnError())
        .pipe(dest(`${pkg}/lib`))
    },
    function checkTypes() {
      return src([`${pkg}/lib/*.js`]).pipe(
        typescript({
          esModuleInterop: true,
          allowJs: true,
          checkJs: true,
          moduleResolution: "node",
          target: "ES6",
          noEmit: true
        })
      )
    }
  )
}

/**
 * Create a README.md for this package by parsing the source code for JSDoc style comments
 *
 * **You should never edit the README**, only lib code. Namaste 🕊
 *
 * @param {string} pkg the path to the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function docs(pkg) {
  return function generateREADME() {
    const meta = require(`${pkg}/package.json`)
    return src(`${pkg}/lib/**`)
      .pipe(documentation("md", { filename: "README.md" }, null))
      .pipe(
        modify(
          content =>
            `<!-- Generated by @talon/sip. Update this documentation by updating the source code. -->\n# ${
              meta.name
            }\n>${
              meta.description
            }\n\n**Table of Contents**\n<!-- toc -->\n${content.substring(
              content.indexOf("\n") + 2
            )}`
        )
      )
      .pipe(modify(content => toc.insert(content, { maxdepth: 2 })))
      .pipe(dest(pkg), { overwrite: true })
  }
}
