# Why?

A _lot_ of libraries use a common syntax to pull values off pathnames. We'll call it `route`

```js
import * as Route from "./route";

const route = "/pathnames/are/:made/of/:keys";
const pathname = "/pathnames/are/made/of/values";
```

a `route` is made of `keys` that point to the location of the value on `pathname`

- constant values represent only themselves. (ex. `/pathname`)
- dynamic values are denoted by prefixing the key with a colon. (ex. `/:key`)

```js
test("Route.keys", () => {
  expect(Route.keys(route)).toEqual(["pathnames", "are", "made", "of", "keys"]);
});
```

and `pathname`s are made of `values`

```js
test("Route.values", () => {
  expect(Route.values(pathname)).toEqual([
    "pathnames",
    "are",
    undefined,
    "of",
    "values"
  ]);
});
```

If you `zip` these you get an object which can be used to look up the pathname values using the route `.key`s.

```js
import {zip} from "ramda"

expect(zip(Route.keys(route), Route.values(pathname))).toEqual({
  pathnames: "pathnames"
  are: "are",
  made: undefined,
  of: "of",
  keys: "values"
})
```

When this is merged with the `search` (which is already `key=value`) you can represent your complete URL as an [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object).
This library enables developers to smoothly convert from one format to the other.

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

## Future

By default only the dynamic keys are decoded. To also include the constant keys use `Route.withConstants`

```js
test.skip("Route.withConstants", () => {
  expect(
    Route.withConstants("/:id/people/:name", "/1/people/belle", {
      id: 1,
      name: "belle",
      limit: 1
    })
  ).toEqual({
    id: 1,
    people: "people",
    name: "belle",
    limit: 1
  });
});
```

Maybe you wanna see if this route is the same as another

```js
test.skip("Route.matches", () => {
  expect(
    Route.matches(
      "/pathnames/are/made/of/:keys",
      "/pathnames/are/made/of/:keys"
    )
  ).toBeTruthy();

  expect(
    Route.matches("/pathnames/are/made/of/:keys", "/pathnames/made/of/:keys")
  ).toBeFalsey();
});
```

or check if the route fits a pathname

```js
test.skip("Route.fits", () => {
  expect(
    Route.fits(
      "/pathnames/:are/made/of/:keys",
      "/pathnames/dogs/made/of/things"
    )
  ).toBeTruthy();

  expect(
    Route.fits("/pathnames/are/made/of/:keys", "/pathnames/made/of/things")
  ).toBeFalsey();
});
```

**Experimental:** a sugar kinda way to deal with all this

```js
test.skip("Route.create", () => {
  const route = Route.create("/another/:adjective/route");

  expect(route.decode("/another/cool/route")).toEqual({ adjective: "cool" });
  expect(route.encode({ adjective: "fun" })).toBe("/another/fun/route");
  expect(route.matches("/another/:adjective/route")).toBeTruthy();
  expect(route.fits("/another/sick/route")).toBeTruthy();
  expect(route.keys).toEqual(["another", "adjective", "route"]);
  expect(route.values).toEqual(["another", undefined, "route"]);
});
```
