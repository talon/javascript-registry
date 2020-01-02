//@flow
import { omit, zip } from "ramda"
import * as Url from "url"
import * as QueryString from "querystring"

const KEY = /:\w+/g

/**
 * ```js
 * import * as Route from "./lib"
 *
 * test("Route.keys", () => {
 *   expect(Route.keys("/routes/are/made/of/:keys")).toEqual(["routes", "are", "made", "of", "keys"]);
 * });
 * ```
 *
 * @param {string} route or pathname, basically any string that has "/"
 * @returns {Array} the keys of the route/pathname
 */
export const keys = route =>
  (route || "")
    .replace(/^\//, "")
    .split("/")
    .map(key => {
      if (key.match(KEY)) {
        return key.substr(1)
      } else {
        return key
      }
    })

/**
 * ```js
 * test("Route.values", () => {
 *   expect(Route.values("/pathnames/are/made/of/values")).toEqual([
 *     "pathnames",
 *     "are",
 *     "made",
 *     "of",
 *     "values"
 *   ]);
 * });
 * ```
 *
 * @param {string} pathname or route, basically any string that has "/"
 * @returns {Array} the keys of the route/pathname
 */
export const values = pathname =>
  (pathname || "")
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(KEY))

/**
 * encode an object into a route
 *
 * ```js
 * test("Route.encode", () => {
 *  expect(
 *    Route.encode("/:id/people/:name", {
 *      id: 1,
 *      name: "belle",
 *      limit: 1
 *    })
 *  ).toBe("/1/people/belle?limit=1");
 * });
 * ```
 *
 * @param {string} route the route to fill with values
 * @param {object} values the values to put into the route
 * @returns {string} the resulting pathname
 */
export const encode = (route, values) => {
  const [pathname, search] = withBody(route, values)

  return `${pathname}?${QueryString.stringify(search)}`
}

/**
 * decode an object from a route
 * ```js
 * test("Route.decode", () => {
 *   expect(
 *     Route.decode("/:id/people/:name", "/1/people/belle", {
 *       id: 1,
 *       name: "belle"
 *     })
 *   ).toEqual({
 *     id: "1",
 *     name: "belle",
 *     people: "people",
 *   });
 * });
 * ```
 *
 * @param {string} route the route that maps the pathname keys
 * @param {string} path the pathname to extract the values from
 * @returns {object} the resulting key value pairs
 */
export const decode = (route, path) => {
  const { query, pathname } = Url.parse(path, true)

  return Object.assign(
    // @ts-ignore
    Object.fromEntries(zip(keys(route), keys(pathname || ""))),
    query
  )
}

/**
 * For requests other than GET it's usually more useful to return the pathname `withBody` so the rest of the object can
 * be sent in the request.
 *
 * ```js
 * test("Route.withBody", () => {
 * const [pathname, body] = Route.withBody("/:id/people/:name", {
 * id: 1,
 * name: "belle",
 * limit: 1
 * });
 *
 * expect(pathname).toBe("/1/people/belle");
 * expect(body).toEqual({ limit: 1 });
 * });
 * ```
 *
 * @param {string} route the route to fill with values
 * @param {object} values the values to put into the route
 * @returns {Array} a tuple where the first value is the pathname and the second are the left over values
 */
export const withBody = (route, values) => {
  const keeze = keys(route)

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, values[key]), route),
    omit(keeze, values)
  ]
}

/**
 * Maybe you wanna see if this route is the same as another
 *
 * ```js
 * test("Route.matches", () => {
 * expect(
 * Route.matches(
 *
 * "/pathnames/are/made/of/:keys"
 * )
 * ).toBeTruthy();
 *
 * expect(
 * Route.matches("/pathnames/are/made/of/:keys", "/pathnames/made/of/:keys")
 * ).toBeFalsy();
 * });
 * ```
 *
 * @param {string} route see if this route
 * @param {string} other matches this route
 * @returns {boolean} true if matches false if not!
 */
export const matches = (route, other) => !!route.match(other)

/**
 * or check if the route fits a pathname
 *
 * ```js
 * test("Route.fits", () => {
 * expect(
 * Route.fits(
 *
 * "/pathnames/dogs/made/of/things"
 * )
 * ).toBeTruthy();
 *
 * expect(
 * Route.fits("/pathnames/are/made/of/:keys", "/pathnames/made/of/things")
 * ).toBeFalsy();
 * });
 * ```
 *
 * @param {string} route does this route
 * @param {string} pathname fit this pathname
 * @returns {boolean} true if matches false if not!
 */
export const fits = (route, pathname) => {
  const vals = values(pathname)
  return route
    .replace(/^\//, "")
    .split("/")
    .every((name, index) => !!name.match(KEY) || !!name.match(vals[index]))
}

/**
 * **Perhaps:** a sugar kinda way to deal with all this
 *
 * ```js
 * test.skip("Route.create", () => {
 * const route = Route.create("/another/:adjective/route");
 *
 *
 * expect(route.encode({ adjective: "fun" })).toBe("/another/fun/route");
 * expect(route.matches("/another/:adjective/route")).toBeTruthy();
 * expect(route.fits("/another/sick/route")).toBeTruthy();
 * expect(route.keys).toEqual(["another", "adjective", "route"]);
 * expect(route.values).toEqual(["another", undefined, "route"]);
 * });
 * ```
 *
 * @private
 */
export const create = route => {
  throw new Error("not implemented")
}
