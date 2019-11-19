import * as Route from "./route";

test("Route.encode", () => {
  expect(
    Route.encode("/:id/people/:name", {
      id: 1,
      name: "belle",
      limit: 1
    })
  ).toBe("/1/people/belle?limit=1");
});

test("Route.decode", () => {
  expect(Route.decode("/:id/people/:name", "/1/people/belle?limit=1")).toEqual({
    id: "1",
    people: "people",
    name: "belle",
    limit: "1"
  });
});

test("Route.withBody", () => {
  const [pathname, body] = Route.withBody("/:id/people/:name", {
    id: 1,
    name: "belle",
    limit: 1
  });

  expect(pathname).toBe("/1/people/belle");
  expect(body).toEqual({ limit: 1 });
});

test.skip("Route.withStatic", () => {
  expect(
    Route.withStatic("/:id/people/:name", "/1/people/belle", {
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

test.skip("Route.keys", () => {
  expect(Route.keys("/pathnames/are/made/of/:keys")).toEqual([
    "pathnames",
    "are",
    "made",
    "of",
    "keys"
  ]);
});

test.skip("Route.static", () => {
  expect(Route.static("/pathnames/are/made/of/:keys")).toEqual([
    "pathnames",
    "are",
    "made",
    "of"
  ]);
});

test.skip("Route.positional", () => {
  expect(Route.positional("/pathnames/are/made/of/:keys")).toEqual(["keys"]);
});

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
