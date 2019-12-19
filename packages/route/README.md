# @talon/route

> encode/decode [objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object) to/from [URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL)

# Usage

A _lot_ of libraries use a common syntax to pull values off pathnames. We'll call it `route`.

```js
import * as Route from "./lib/route";

const route = "/pathnames/are/:made/of/:keys";
const pathname = "/pathnames/are/made/of/values";
```

A `route` is made of `keys` that point to the location of the value on `pathname`.

- constant values represent only themselves. (ex. `/pathname`)
- dynamic values are denoted by prefixing the key with a colon. (ex. `/:key`)

`pathname`s are made of `values`.

By merging this is with the `search` (which is already `key=value`) you can represent your complete URL as an [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object). This library enables developers to smoothly convert from one format to the other.

```js
test("Route.encode", () => {
  expect(
    Route.encode("/:id/people/:name", {
      id: 1,
      name: "belle",
      limit: 1
    })
  ).toBe("/1/people/belle?limit=1");
});
```

```js
test("Route.decode", () => {
  expect(Route.decode("/:id/people/:name", "/1/people/belle?limit=1")).toEqual({
    id: "1",
    people: "people",
    name: "belle",
    limit: "1"
  });
});
```

For requests other than GET it's usually more useful to return the pathname `withBody` so the rest of the object can
be sent in the request.

```js
test("Route.withBody", () => {
  const [pathname, body] = Route.withBody("/:id/people/:name", {
    id: 1,
    name: "belle",
    limit: 1
  });

  expect(pathname).toBe("/1/people/belle");
  expect(body).toEqual({ limit: 1 });
});
```

_Checkout the [API Docs](./API.md) to learn more!_
