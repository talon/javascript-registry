import { src, dest, series, lastRun, TaskFunction } from "gulp"
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
 * @private
 * @param {string} root the root path of the package to operate on
 * @param {object} options task options
 * @param {boolean} options.fix whether or not to write changes for automatically fixable issues
 * @returns {TaskFunction} the initialized gulp task
 */
export function dependencies(root, { fix }) {
  const name = root.split("/").slice(-1)

  return function checkDependencies() {
    return check(root, {
      // TODO: this list is prob gonna be too unpredictable to maintain here
      ignoreMatches: ["eslint*", "jest-cli", "documentation", "typescript"],
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
export function format(root, { fix }) {
  return function formatFiles() {
    const results = src(`${root}/**`, { since: lastRun(formatFiles) })
      .pipe(prettier())
      .pipe(dest(root))

    if (fix) return results.pipe(dest(root))
    else return results
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
export function typecheck(root, { fix }) {
  return series(
    function lintJSDoc() {
      const results = src([`${root}/lib/*.js`])
        .pipe(
          eslint({
            fix,
            baseConfig: {
              parserOptions: {
                ecmaVersion: 6,
                sourceType: "module",
                ecmaFeatures: {}
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
        .pipe(eslint.failOnError())

      if (fix) return results.pipe(dest(`${root}/lib`))
      else return results
    },
    function checkTypes() {
      return src([`${root}/lib/*.js`]).pipe(
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
export function docs(root) {
  return function generateREADME() {
    const meta = require(`${root}/package.json`)
    return src(`${root}/lib/**`)
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
      .pipe(dest(root), { overwrite: true })
  }
}
