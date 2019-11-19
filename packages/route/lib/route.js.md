```js
import * as Route from "./route";
```

# Why?

    /a/URL/has/a/pathname?and='a search'

> a URL has a pathname and a search

- [pathname](https://developer.mozilla.org/en-US/docs/Web/API/URL/pathname) values are _positional_.
  The `Route` syntax allows you to `:key` these.

There are two ways `Route` looks at the pathname. It sees `keys`:

```js
test.skip("Route.keys", () => {
  expect(Route.keys("/pathnames/are/made/of/:keys")).toEqual([
    "pathnames",
    "are",
    "made",
    "of",
    "keys"
  ]);
});
```

and it sees `values`:

```js
test.skip("Route.values", () => {
  expect(Route.values("/pathnames/are/:made/of/values")).toEqual([
    "pathnames",
    "are",
    undefined,
    "of",
    "values"
  ]);
});
```

If you `zip(Route.keys(route), Route.values(pathname))` you get an object which can be used to look up the pathname values of route `.key`s.

By treating [URLs](https://developer.mozilla.org/en-US/docs/Web/API/URL) as a data structure like an [object](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object)
this library enables developers to smoothly convert from one format to the other.

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

Normally only the dynamic keys are decoded. To also include the constant keys use `Route.withConstants`

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
