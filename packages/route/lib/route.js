import { omit } from "ramda";
import Url from "url";

/**
 * encode an Object in to a route
 * @param route {string} a route /with/:params
 * @param data {object} the object[key] will replace the /path/:param
 * @returns {array} [path, data] lefover data is returned as the second element in the array
 */
export const encode = (route, data) => {
  const params = route.match(/:\w+/g).map(x => x.substr(1));

  return [
    params.reduce((url, param) => url.replace(`:${param}`, data[param]), route),
    omit(params, data)
  ];
};

/**
 * decode an Object from a url
 * @param route {string} a route /with/:params
 * @param path {string} from which to extract data
 * @returns {object} the data extracted from `path`
 */
export const decode = (route, path) => {
  const url = Url.parse(path, true);
  const params = route.match(/:\w+/g).reduce((data, param, i) => {});
};
