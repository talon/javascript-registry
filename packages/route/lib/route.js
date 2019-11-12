import { omit } from "ramda";
import Url from "url";

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
  const params = route.match(/:\w+/g).map(x => x.substr(1));

  return [
    params.reduce((url, param) => url.replace(`:${param}`, data[param]), route),
    omit(params, data)
  ];
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
  const params = route.match(/:\w+/g).reduce((data, param, i) => {});
};
