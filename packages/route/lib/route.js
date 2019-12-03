import { omit, zip } from "ramda";
import Url from "url";
import QueryString from "querystring";

export const encode = (route, object) => {
  const [pathname, search] = withBody(route, object);

  return `${pathname}?${QueryString.encode(search)}`;
};

export const decode = (route, url) => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

export const withConstant = (route, url) => {
  const { query, pathname } = Url.parse(url, true);

  return Object.assign(
    Object.fromEntries(zip(keys(route), keys(pathname))),
    query
  );
};

export const withBody = (route, object) => {
  const keeze = keys(route);

  return [
    keeze.reduce((path, key) => path.replace(`:${key}`, object[key]), route),
    omit(keeze, object)
  ];
};

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

export const values = route =>
  route
    .replace(/^\//, "")
    .split("/")
    .filter(key => !key.match(/:\w+/g));
