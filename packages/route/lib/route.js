//@flow
import { omit, zip } from "ramda";
import * as Url from "url";
import * as QueryString from "querystring";

/**
 * ```js
 * import * as Route from "./lib/route"
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
      if (key.match(/:\w+/g)) {
        return key.substr(1);
      } else {
        return key;
      }
    });

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
    .filter(key => !key.match(/:\w+/g));

/**
 * encode an object into a route
 */
export const encode = (route /*: string */, data /*: any */) /*: string */ => {
  const [pathname, search] = withBody(route, data);

  return `${pathname}?${QueryString.encode(search)}`;
};

/**
 * decode an object from a route
 */
export const decode = (route /*: string */, url /*: string */) /*: any */ => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

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
  const keeze = keys(route);

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, data[key]), route),
    omit(keeze, data)
  ];
};

/**
 * By default only the dynamic keys are decoded. To also include the constant keys use `Route.withConstants`
 *
 * ```js
 * test.skip("Route.withConstants", () => {
 *   expect(
 *     Route.withConstants("/:id/people/:name", "/1/people/belle", {
 *       id: 1,
 *       name: "belle",
 *       limit: 1
 *     })
 *   ).toEqual({
 *     id: 1,
 *     people: "people",
 *     name: "belle",
 *     limit: 1
 *   });
 * });
 * ```
 */
export const withConstant = (
  route /*: string */,
  url /*: string */
) /*: any */ => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

/**
 *
 * Maybe you wanna see if this route is the same as another
 *
 * ```js
 * test.skip("Route.matches", () => {
 *   expect(
 *     Route.matches(
 *       "/pathnames/are/made/of/:keys",
 *       "/pathnames/are/made/of/:keys"
 *     )
 *   ).toBeTruthy();
 *
 *   expect(
 *     Route.matches("/pathnames/are/made/of/:keys", "/pathnames/made/of/:keys")
 *   ).toBeFalsey();
 * });
 * ```
 *
 * or check if the route fits a pathname
 *
 * ```js
 * test.skip("Route.fits", () => {
 *   expect(
 *     Route.fits(
 *       "/pathnames/:are/made/of/:keys",
 *       "/pathnames/dogs/made/of/things"
 *     )
 *   ).toBeTruthy();
 *
 *   expect(
 *     Route.fits("/pathnames/are/made/of/:keys", "/pathnames/made/of/things")
 *   ).toBeFalsey();
 * });
 * ```
 *
 * **Experimental:** a sugar kinda way to deal with all this
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
