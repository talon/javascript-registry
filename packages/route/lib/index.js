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
 */
export const keys = (route /*: string */) /*: Array<string> */ =>
  route
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
 */
export const values = (pathname /*: string */) /*: Array<string> */ =>
  pathname
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(KEY))

/**
 * encode an object into a route
 */
export const encode = (route /*: string */, data /*: any */) /*: string */ => {
  const [pathname, search] = withBody(route, data)

  return `${pathname}?${QueryString.stringify(search)}`
}

/**
 * decode an object from a route
 */
export const decode = (route /*: string */, url /*: string */) /*: any */ => {
  const { query, pathname } = Url.parse(url, true)

  return Object.assign(
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
 *   const [pathname, body] = Route.withBody("/:id/people/:name", {
 *     id: 1,
 *     name: "belle",
 *     limit: 1
 *   });
 *
 *   expect(pathname).toBe("/1/people/belle");
 *   expect(body).toEqual({ limit: 1 });
 * });
 * ```
 */
export const withBody = (
  route /*: string */,
  data /*: any */
) /*: [string, any]*/ => {
  const keeze = keys(route)

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, data[key]), route),
    omit(keeze, data)
  ]
}

/**
 * By default only the dynamic keys are decoded. To also include the constant keys use `Route.withConstants`
 *
 * ```js
 * test("Route.withConstants", () => {
 *   expect(
 *     Route.withConstants("/:id/people/:name", "/1/people/belle", {
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
 */
export const withConstants = (
  route /*: string */,
  url /*: string */
) /*: any */ => {
  const { query, pathname } = Url.parse(url, true)

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname || ""))),
    query
  )
}

/**
 * Maybe you wanna see if this route is the same as another
 *
 * ```js
 * test("Route.matches", () => {
 *   expect(
 *     Route.matches(
 *       "/pathnames/are/made/of/:keys",
 *       "/pathnames/are/made/of/:keys"
 *     )
 *   ).toBeTruthy();
 *
 *   expect(
 *     Route.matches("/pathnames/are/made/of/:keys", "/pathnames/made/of/:keys")
 *   ).toBeFalsy();
 * });
 * ```
 */
export const matches = (
  route /*: string */,
  other /*: string */
) /*: boolean */ => !!route.match(other)

/**
 * or check if the route fits a pathname
 *
 * ```js
 * test("Route.fits", () => {
 *   expect(
 *     Route.fits(
 *       "/pathnames/:are/made/of/:keys",
 *       "/pathnames/dogs/made/of/things"
 *     )
 *   ).toBeTruthy();
 *
 *   expect(
 *     Route.fits("/pathnames/are/made/of/:keys", "/pathnames/made/of/things")
 *   ).toBeFalsy();
 * });
 * ```
 */
export const fits = (
  route /*: string */,
  pathname /*: string */
) /*: boolean */ => {
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
 *   const route = Route.create("/another/:adjective/route");
 *
 *   expect(route.decode("/another/cool/route")).toEqual({ adjective: "cool" });
 *   expect(route.encode({ adjective: "fun" })).toBe("/another/fun/route");
 *   expect(route.matches("/another/:adjective/route")).toBeTruthy();
 *   expect(route.fits("/another/sick/route")).toBeTruthy();
 *   expect(route.keys).toEqual(["another", "adjective", "route"]);
 *   expect(route.values).toEqual(["another", undefined, "route"]);
 * });
 * ```
 */
export const create = (route /*: string */) => {
  throw new Error("not implemented")
}
