### simple

literate comments should get rendered as jsdoc style comments

> and nothing else should trifle

```sh
only js blocks will execute
```

````js
/**
 * they should be seemlessly stitched together
 *
 * ```js
 * describe("embeded unit tests, () => {
 *   it("and allow embeded tests", () => expect(true).toBeTruthy()
 * })
 * ```
 */
export const woo = () => console.log("wooo")
````

### complex

```js
const something = require("./here")
```

```js
/**
 * a more complex scenario
 */
export const wow = () => {
  console.log("wow")
}
```
