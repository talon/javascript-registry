import { src, dest, series, TaskFunction } from "gulp"
import plumber from "gulp-plumber"
import documentation from "gulp-documentation"
import modify from "gulp-modify-file"
import eslint from "gulp-eslint"
import prettier from "gulp-prettier"
import toc from "markdown-toc"
import typescript from "gulp-typescript"
import check from "depcheck"
import { promisify } from "util"
import { exec } from "child_process"

/**
 * Automatically update dependencies adding and removing as needed
 *
 * TODO: support for mono or single repo and npm or yarn
 *
 * @private
 * @param {string} root the root path of the package to operate on
 * @param {object} options task options
 * @param {boolean} options.fix whether or not to write changes for automatically fixable issues
 * @returns {TaskFunction} the initialized gulp task
 */
export function checkDependencies(root, { fix }) {
  const name = root.split("/").slice(-1)

  return function dependencies() {
    return check(root, {
      // TODO: this list is prob gonna be too unpredictable to maintain here
      ignoreMatches: [
        "eslint*",
        "jest-cli",
        "documentation",
        "typescript",
        "@types/*"
      ],
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
        return fix && unused.length > 0
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
 * @private
 * @param {string} root the root path of the package to operate on
 * @param {object} options task options
 * @param {boolean} options.fix whether or not to write changes for automatically fixable issues
 * @returns {TaskFunction} the initialized gulp task
 */
export function formatFiles(root, { fix }) {
  return function format() {
    const files = src([
      `${root}/**`,
      `!${root}/node_modules/**`,
      `!${root}/dist/**`
    ])
    if (fix) return files.pipe(prettier()).pipe(dest(root))
    else return files.pipe(prettier())
  }
}

/**
 * Lints for and typechecks JSDoc comments
 *
 * @private
 * @param {string} root the root path of the package to operate on
 * @param {object} options task options
 * @param {boolean} options.fix whether or not to write changes for automatically fixable issues
 * @returns {TaskFunction} the initialized gulp task
 */
export function checkTypes(root, { fix }) {
  return series(
    function lint() {
      const results = src([`${root}/lib/*.js`])
        .pipe(
          eslint({
            fix,
            baseConfig: {
              parserOptions: {
                ecmaVersion: 2018,
                env: { es6: true },
                sourceType: "module"
              },
              extends: ["plugin:jsdoc/recommended"],
              settings: {
                jsdoc: {
                  ignorePrivate: true
                }
              }
            },
            ignorePattern: ["**/README.md", "**/package.json", "**/dist/**"],
            rules: {
              "jsdoc/check-alignment": 1,
              "jsdoc/check-examples": 0,
              "jsdoc/check-indentation": 0,
              "jsdoc/check-param-names": 1,
              "jsdoc/check-syntax": 2,
              "jsdoc/check-tag-names": 1,
              "jsdoc/check-types": 1,
              "jsdoc/implements-on-classes": 1,
              "jsdoc/no-undefined-types": 1,
              "jsdoc/require-description": 2,
              "jsdoc/require-jsdoc": 2,
              "jsdoc/require-param": 2,
              "jsdoc/require-param-description": 2,
              "jsdoc/require-param-name": 2,
              "jsdoc/require-param-type": 2,
              "jsdoc/require-returns": 2,
              "jsdoc/require-returns-check": 2,
              "jsdoc/require-returns-description": 2,
              "jsdoc/require-returns-type": 2,
              "jsdoc/valid-types": 2
            }
          })
        )
        .pipe(eslint.format())

      if (fix)
        return results.pipe(eslint.failOnError()).pipe(dest(`${root}/lib`))
      else return results
    },
    function typecheck() {
      return src([`${root}/lib/*.js`])
        .pipe(
          plumber({
            errorHandler: function buildError(e) {
              if (fix) {
                throw e
              }
            }
          })
        )
        .pipe(
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
 * @private
 * @param {string} root the root path of the package to operate on
 * @returns {TaskFunction} the initialized gulp task
 */
export function generateREADME(root) {
  return function README() {
    const meta = require(`${root}/package.json`)
    return src(`${root}/lib/**`)
      .pipe(
        plumber({
          errorHandler: function buildError(e) {}
        })
      )
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
      .pipe(prettier())
      .pipe(dest(root), { overwrite: true })
  }
}
