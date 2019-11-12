import { omit, zip } from "ramda";
import Url from "url";
import QueryString from "querystring";

const parts = route =>
  route
    .replace(/^\//, "")
    .split("/")
    .map(segment => {
      if (segment.match(/:\w+/g)) {
        return segment.substr(1);
      } else {
        return segment;
      }
    });

/**
 * encode data into a route
 *
 * @example
 *     const [path, data] = Route.encode("/api/v1/:id/items/:name", {
 *        id: 1,
 *        name: "keyboard",
 *        limit: 20
 *     })
 *
 * @param {string} route a route `/with/:params`
 * @param {object} data keys will replace the `/path/:param`
 * @returns {array} `[path, data]` lefover data is returned as the second element in the array
 */
export const encode = (route, data) => {
  const segments = parts(route);

  return [
    segments.reduce(
      (url, param) => url.replace(`:${param}`, data[param]),
      route
    ),
    omit(segments, data)
  ];
};

/**
 * encode data into a route, include the querystring
 *
 * @example
 *     const path = Route.withQuery("/api/v1/:id/items/:name", {
 *        id: 1,
 *        name: "keyboard",
 *        limit: 20
 *     })
 *
 * @param {string} route a route `/with/:params`
 * @param {object} data keys will replace the `/path/:param`
 * @returns {array} path including the querystring
 */
export const withQuery = (route, data) => {
  const [path, query] = encode(route, data);
  return `${path}?${QueryString.encode(query)}`;
};

/**
 * decode data from a path
 *
 * @example
 *     const {id, name, limit} = Route.decode("/api/v1/:id/items/:name", "/api/v1/1/items/keyboard?limit=20")
 *
 * @param {string} route a route `/with/:params`
 * @param {string} path from which to extract `data`
 * @returns {object} the `data` extracted from `path`
 */
export const decode = (route, path) => {
  const url = Url.parse(path, true);
  return Object.assign(
    Object.fromEntries(zip(parts(route), parts(url.pathname))),
    url.query
  );
};
