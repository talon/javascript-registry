import { omit, zip } from "ramda";
import * as Url from "url";
import * as QueryString from "querystring";

/**
 * encode an object into a route
 */
export const encode = (route: string, data: object): string => {
  const [pathname, search] = withBody(route, data);

  return `${pathname}?${QueryString.encode(search)}`;
};

/**
 * decode an object from a route
 */
export const decode = (route: string, url: string): object => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

/**
 * decode an object from a route, including the constant keys
 */
export const withConstant = (route: string, url: string): object => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

/**
 * encode an object into a route, include the excess object
 */
export const withBody = (route: string, data: object): [string, object] => {
  const keeze = keys(route);

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, data[key]), route),
    omit(keeze, data)
  ];
};

/**
 * get the keys from a route or path
 */
export const keys = (route: string): string[] =>
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
 * get the values from a route or path
 */
export const values = (route: string): string[] =>
  route
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(/:\w+/g));
