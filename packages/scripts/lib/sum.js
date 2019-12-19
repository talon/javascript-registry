//@flow

/**
 * takes an array of numbers and returns their sum
 *
 * ```js
 * import sum from "./lib/sum"
 *
 * describe("sum", () => {
 *   it("adds numbers", () => expect(sum([1,2,3])).toBe(6))
 * })
 * ```
 */
export default (nums /*: Array<number>*/) /*: number*/ =>
  nums.reduce((total, num) => total + num, 0)
