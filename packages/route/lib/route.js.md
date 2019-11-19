```js
import * as Route from "./route";
```

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

```js
test.skip("Route.constants", () => {
  expect(Route.constants("/pathnames/are/made/of/:keys")).toEqual([
    "pathnames",
    "are",
    "made",
    "of"
  ]);
});
```

```js
test.skip("Route.positionals", () => {
  expect(Route.positionals("/pathnames/are/made/of/:keys")).toEqual({
    4: "keys"
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
