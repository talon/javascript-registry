import { omit, zip } from "ramda";
import Url from "url";
import QueryString from "querystring";

export const encode = (route: string, data: object): string => {
  const [pathname, search] = withBody(route, data);

  return `${pathname}?${QueryString.encode(search)}`;
};

export const decode = (route: string, url: string): object => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

export const withConstant = (route: string, url: string): object => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

export const withBody = (route: string, data: object): [string, object] => {
  const keeze = keys(route);

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, data[key]), route),
    omit(keeze, data)
  ];
};

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

export const values = (route: string): string[] =>
  route
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(/:\w+/g));
