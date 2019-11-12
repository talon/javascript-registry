import * as Route from "./route";

test("Route.encode", () => {
  const [path, params] = Route.encode("/:id/people/:name", {
    id: 1,
    name: "belle",
    limit: 1
  });

  expect(path).toBe("/1/people/belle");
  expect(params).toEqual({ limit: 1 });
});

test.skip("Route.decode", () => {
  const [params, search] = Route.decode(
    "/:id/people/:name",
    "/1/people/belle?limit=1"
  );

  expect(params).toEqual({
    id: 1,
    name: "belle"
  });
  expect(search).toEqual({ limit: 1 });
});
