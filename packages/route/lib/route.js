import { omit, zip } from "ramda";
import Url from "url";
import QueryString from "querystring";

/**
 * encode an object into a route
 *
 * @example
 *     "/api/v1/1/items/keyboard?limit=20" === Route.encode("/api/v1/:id/items/:name", {
 *        id: 1,
 *        name: "keyboard",
 *        limit: 20
 *     })
 *
 * @param {string} route a route `/with/:keys`
 * @param {object} object keys will replace the `/route/:keys`
 * @returns {string} the combined "pathname?search"
 */
export const encode = (route, object) => {
  const [pathname, search] = withBody(route, object);

  return `${pathname}?${QueryString.encode(search)}`;
};

/**
 * decode an object from a url
 *
 * @example
 *     { id: "1", name: "keyboard", limit: "1" } === Route.decode(
 *       "/api/v1/:id/items/:name",
 *       "/api/v1/1/items/keyboard?limit=20"
 *     )
 *
 * @param {string} route a route `/with/:keys`
 * @param {string} pathname from which to extract values
 * @returns {object} the `object` extracted from url
 */
export const decode = (route, url) => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

/**
 * decode an object from a url including the constant keys
 *
 * @example
 *     { id: "1", name: "keyboard", limit: "1" } === Route.decode(
 *       "/api/v1/:id/items/:name",
 *       "/api/v1/1/items/keyboard?limit=20"
 *     )
 *
 * @param {string} route a route `/with/:keys`
 * @param {string} pathname from which to extract values
 * @returns {object} the `object` extracted from url
 */
export const withConstant = (route, url) => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

/**
 * encode object into a route, return the rest as body
 *
 * @example
 *     [
 *       "/api/v1/1/items/keyboard",
 *       {limit: 20}
 *     ] === Route.withBody(
 *         "/api/v1/:id/items/:name", {
 *         id: 1,
 *         name: "keyboard",
 *         limit: 20
 *      })
 *
 * @param {string} route a route `/with/:keys`
 * @param {object} object keys will replace the `/route/:keys`
 * @returns {array} `[pathname, body]`
 */
export const withBody = (route, object) => {
  const keeze = keys(route);

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, object[key]), route),
    omit(keeze, object)
  ];
};

/**
 * get the keys of a route (or path)
 *
 * @example
 *     ["route", "with", "keys"] === Route.keys("/route/with/:keys")
 *
 * @param {string} route a `/route/with/:keys`
 * @return {array} an array of each key's name
 */
export const keys = route =>
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
 * get the constants of a route (or path)
 *
 * @example
 *     ["route", "with", undefined] === Route.constants("/route/with/:keys")
 *
 * @param {string} route a `/route/with/:keys`
 * @return {array} an array of each constant's name
 */
export const values = route =>
  route
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(/:\w+/g));
