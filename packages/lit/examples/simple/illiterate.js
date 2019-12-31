/**
 * ### simple
 *
 * literate comments should get rendered as jsdoc style comments
 *
 * > and nothing else should trifle
 *
 * ```sh
 * only js blocks will execute
 * ```
 *
 * they should be seemlessly stitched together
 *
 * ```js
 * describe("embeded unit tests, () => {
 *   it("and allow embeded tests", () => expect(true).toBeTruthy()
 * })
 * ```
 */
export const woo = () => console.log("wooo")

/**
 * ### complex
 */
const something = require("./here")

/**
 * a more complex scenario
 */
export const wow = () => {
  console.log("wow")
}
