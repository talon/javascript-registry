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
  /**
   * @param {object} options
   * @param {string} options.name the name of this dataSource on context
   * @param {string} options.resource the path to the REST resource
   * @param {string} options.authorization points to where the auth token is on the context
   * @param {string} options.instance points to where the instance is on the context
   * @param {object} bind map GraphQL queries to REST routes
   * @param {object} bind.get
   * @param {object} bind.post
   * @param {object} bind.put
   * @param {object} bind.patch
   * @param {object} bind.delete
   */
  constructor({ resource, name, instance, authorization }, bind) {
    super();
    this.name = name;
    this.resource = resource;
    this.authorization = prop(authorization);
    this.instance = prop(instance);

    this.graph = { Query: [], Mutation: [] };

    forEachObjIndexed((route, query) => {
      this.graph.Query.push(query);
      this[query] = data => {
        this["get"](Route.withQuery(route, data));
      };
    }, bind["get"]);

    ["post", "patch", "put", "delete"].forEach(method =>
      forEachObjIndexed((route, query) => {
        this.graph.Mutation.push(query);
        this[query] = params => {
          this[method](...Route.encode(route, data));
        };
      }, bind[method])
    );
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

export function typeDefs(nodes) {
  return reduce((typeDefs, node) => `${typeDefs} ${node.typeDefs}`, "")(nodes);
}

export function context(nodes) {
  const fns = ap(map(prop("context"), nodes));
  return request => Promise.all(fns([request])).then(mergeAll);
}

export function dataSources(nodes) {
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
}

export function resolvers(nodes) {
  return pipe(
    map(prop("dataSources")),
    flatten,
    map(prop("resolvers")),
    reduce(mergeDeepLeft, {})
  )(nodes);
}
