const { declare } = require("@babel/helper-plugin-utils")
const { parse } = require("@babel/parser")
const lit = require("./")

/**
 * Add it to `plugins` in your babel config
 * 
 * The `files` regex is used to determine what files are literate. The default matches any file with a `.md` extension
 * 
 * ```json
 * {
 *   "babel": {
 *     "plugins": [
 *       [
 *         "./node_modules/@talon/lit/lib/babel.js",
 *         {
 *           "files": ".*\\.md$"
 *         }
 *       ]
 *     ]
 *   }
 * }
 * ```
 * 
 * You'll have to tell jest about markdown files you want to test
 * 
 * ```json
 * {
 *   "jest": {
 *     "moduleFileExtensions": ["md", "js", "ts", "jsx", "tsx"],
 *     "testRegex": "(README|.+\\.(test|spec|usage))\\.([jt]sx?|md)$",
 *     "transform": {
 *       "^.+\\.([jt]sx?|md)$": "babel-jest"
 *     }
 *   }
 * }
 * ```
 * 
 * Currently only `js` blocks are supported. With a little engineering magic it could probably support
 * [the same syntaxes as the @babel/parser](https://babeljs.io/docs/en/babel-parser#language-extensions)
 * PRs welcome 😉
 */
module.exports = declare(({ assertVersion }, { files }) => {
    assertVersion(7)
    return {
        parserOverride(code, options) {
            return options.sourceFileName.match(files || /\.md$/)
                ? parse(lit(code), options)
                : parse(code, options)
        }
    }
})