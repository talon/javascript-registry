const { declare } = require("@babel/helper-plugin-utils")
const { parse } = require("@babel/parser")
const lit = require("./")

/**
 * Add it to `plugins` in your babel config
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
 * ### using with babel-jest
 * 
 * ```json
 * {
 *   "jest": {
 *     "moduleFileExtensions": ["md", "js", "ts", "jsx", "tsx"],
 *     "testRegex": ".*(README|\\.(test|spec|usage))\\.([jt]sx?|md)$",
 *     "transform": {
 *       "^.+\\.([jt]sx?|md)$": "babel-jest"
 *     }
 *   }
 * }
 * ```
 * 
 * ## Literate files
 * 
 * the `files` regex is used to determine what files are literate. The default matches any file with a `.md` extension
 * 
 * **Note:** peer tools might also need to know of the `.md` extension. (See: "[using with babel-jest](#using-with-babel-jest)")
 * 
 * ## Supported syntaxes
 * 
 * by default it only supports `js` blocks. With a little engineering magic it could probably support
 * [the same syntaxes as the @babel/parser](https://babeljs.io/docs/en/babel-parser#language-extensions)
 * PRs welcome 😉
 * 
 * ## Does it work?
 * 
 * this _very_ README is a literate file tested with `babel-jest`.
 * 
 * > npm run test
 * 
 * ```js
 * test("end-to-end integration test", () => {
 *   expect(true).toBeTruthy()
 * })
 * ```
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