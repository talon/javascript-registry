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
import Route from "@talon/route";

/**
 * merges an array of typeDefs into one to rule them all
 *
 * @param {array} nodes
 * @returns {string} typeDefs
 */
export const typeDefs = reduce(
  (typeDefs, node) => `${typeDefs} ${node.typeDefs}`,
  ""
);

/**
 * merges an array of contexts into one function to call
 * at the graph root
 *
 * @param {array} nodes
 * @returns {function} Request -> Context
 */
export const context = nodes => {
  const fns = ap(map(prop("context"), nodes));
  return request => Promise.all(fns([request])).then(mergeAll);
};

/**
 * merges an array of dataSources into one function to call
 * at the graph root
 *
 * @param {array} nodes
 * @returns {function} () -> DataSources
 */
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

/**
 * merges an array of resolvers into one to rule them all
 *
 * @param {array} nodes
 * @returns {object}
 */
export const resolvers = pipe(
  map(prop("dataSources")),
  flatten,
  map(prop("resolvers")),
  reduce(mergeDeepLeft, {})
);

/**
 * build a Graph.fromNodes
 *
 * nodes are objects of the shape
 *     { typeDefs, context, dataSources }
 *
 * where `dataSources` is an array of `Edges`
 *
 * @see RESTEdge
 * @param {array} nodes
 * @returns {object}
 */
export const fromNodes = (...nodes) => ({
  typeDefs: typeDefs(nodes),
  context: context(nodes),
  dataSources: dataSources(nodes),
  resolvers: resolvers(nodes)
});

/**
 * Declaritively map GraphQL queries to REST endpoints
 *
 * @example
 *     new RESTEdge({
 *       name: "mastodon.accounts",
 *       resource: "/api/v1/accounts",
 *       instance: "mastodon.instance",
 *       authorization: "mastodon.authorization"
 *     }, {
 *       get: {
 *         account: "/:id",
 *         followers: "/:id/followers",
 *         following: "/:id/followers",
 *         relationships: "/:id/relationships",
 *         search: "/:id/search",
 *         statuses: "/:id/statuses",
 *         verify_credentials: "/:id/verify_credentials"
 *       },
 *       post: {
 *         accounts: "/:id/",
 *         follow: "/:id/follow",
 *         unfollow: "/:id/unfollow"
 *       },
 *       patch: {
 *         update_credentials: "update_credentials"
 *       }
 *     })
 */
export class RESTEdge extends RESTDataSource {
  constructor({ resource, name, instance, authorization }, bind) {
    super();
    this.name = name;
    this.resource = resource;
    this.authorization = prop(authorization);
    this.instance = prop(instance);

    this.graph = { Query: [], Mutation: [] };

    forEachObjIndexed((queries, method) => {
      forEachObjIndexed((route, query) => {
        switch (method) {
          case "get":
            this.graph.Query.push(query);
            this[query] = data => {
              this[method](Route.withQuery(route, data));
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
