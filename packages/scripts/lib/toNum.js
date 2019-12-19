//@flow

/**
 * parse an array of strings into numbers, non-numbers will be removed
 */
export default (nums /*: Array<string>*/) /*: Array<number> */ =>
  nums
    .filter(num => {
      Number.isNaN(parseInt(num))
    })
    .map(num => parseInt(num))
