import { omit } from "ramda";
import Url from "url";

export const encode = (route, data) => {
  const params = route.match(/:\w+/g).map(x => x.substr(1));

  return [
    params.reduce((url, param) => url.replace(`:${param}`, data[param]), route),
    omit(params, data)
  ];
};

export const decode = (route, path) => {
  const url = Url.parse(path, true);
  const params = route.match(/:\w+/g).reduce((data, param, i) => {});
};
