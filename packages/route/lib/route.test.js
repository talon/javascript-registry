import * as Route from "./route";

test("Route.encode", () => {
  const [path, data] = Route.encode("/:id/people/:name", {
    id: 1,
    name: "belle",
    limit: 1
  });

  expect(path).toBe("/1/people/belle");
  expect(data).toEqual({ limit: 1 });
});

test("Route.withQuery", () => {
  expect(
    Route.withQuery("/:id/people/:name", {
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
