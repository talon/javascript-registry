import {
  ap,
  forEachObjIndexed,
  flatten,
  map,
  mergeDeepLeft,
  mergeAll,
  pipe,
  prop,
  reduce
} from "ramda";
import { RESTDataSource } from "apollo-datasource-rest";
import QueryString from "querystring";
import Route from "./route";

export const typeDefs = reduce(
  (typeDefs, node) => `${typeDefs} ${node.typeDefs}`,
  ""
);

export const context = nodes => {
  const fns = ap(map(prop("context"), nodes));
  return request => Promise.all(fns([request])).then(mergeAll);
};

export const dataSources = nodes => {
  const cache = pipe(
    map(prop("dataSources")),
    map(
      map(dataSource => ({
        [dataSource.name]: dataSource
      }))
    ),
    flatten,
    reduce(mergeDeepLeft, {})
  )(nodes);
  return () => cache;
};

export const resolvers = pipe(
  map(prop("dataSources")),
  flatten,
  map(prop("resolvers")),
  reduce(mergeDeepLeft, {})
);

export const fromNodes = (...nodes) => ({
  typeDefs: typeDefs(nodes),
  context: context(nodes),
  dataSources: dataSources(nodes),
  resolvers: resolvers(nodes)
});

export class RESTEdge extends RESTDataSource {
  /**
   * Implementation (a usurping, perhaps)
   */
  constructor({ resource, name, context, bind }) {
    super();
    this.name = name;
    this.resource = resource;
    this.authorization = prop(context.authorization);
    this.instance = prop(context.instance);
    this.graph = { Query: [], Mutation: [] };

    forEachObjIndexed((queries, method) => {
      forEachObjIndexed((route, query) => {
        switch (method) {
          case "get":
            this.graph.Query.push(query);
            this[query] = data => {
              const [path, params] = Route.encode(route, data);
              this[method](`${path}?${QueryString.encode(params)}`);
            };
            break;
          case "post":
          case "patch":
          case "delete":
            this.graph.Mutation.push(query);
            this[query] = params => {
              this[method](...Route.encode(route, data));
            };
            break;
        }
      }, queries);
    }, bind);
  }

  get baseURL() {
    return `${this.instance(this.context)}${this.resource}`;
  }

  willSendRequest(request) {
    request.headers.set(
      "Authorization",
      `Bearer ${this.authorization(this.context)}`
    );
  }

  get resolvers() {
    const bind = query => ({
      [query]: (parent, params, { dataSources }) =>
        dataSources[this.name][query](params)
    });
    return {
      Query: this.graph.Query.map(bind).reduce(mergeDeepLeft, {}),
      Mutation: this.graph.Mutation.map(bind).reduce(mergeDeepLeft, {})
    };
  }
}
