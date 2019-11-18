# @talon/apollo-graph

# Why?

Let's say we want this query to work:
```graphql
type Query {
  account(id: ID): Account
}
```

Apollo Server has four options `{typeDefs, context, dataSources, resolvers}`

A `resolver` is a connection (edge) from a GraphQL query that abstracts _how data is retrieved_
```js
{
  Query: {
    account: (parent, params, context) => Promise.resolve({id: 1})
  }
}
```
> They look kinda like GraphQL cause they kinda are like that but in JS and actually connected to the data.

Since the resolver only handles mapping queries to Promises of data, Apollo Server also introduces the concept of a [data source](https://www.npmjs.com/package/apollo-datasource). Which handles a few things, but for now let's look at how our implementation plays out if we simply use [apollo-datasource-rest](https://www.npmjs.com/package/apollo-datasource-rest) to get an account from Mastodon.
```js
class Mastodon extends RESTDataSource {
  get baseUrl() {
    return "https://mastodon.technology"
  }

  accounts(params) {
    this.get(`/api/v1/accounts/${params.id}`)
  }
}

const server = new ApolloServer({
  dataSources: {
    mastodon: new Mastodon()
  }
})
```

So we extended the `RESTDataSource`, wrote a method for retrieving an `account` and instantiated it as `dataSources.mastodon` in Apollo Server. This will create `context.dataSources.mastodon.account` which can be consumed by the resolver like so:
```js
const server = new ApolloServer({
  dataSources: {
    mastodon: new Mastodon()
  },
  resolvers: {
    Query: {
      account: ({parent, params, context}) => 
        context.dataSources.mastodon.account(params)
    }
  }
})
```

With this final stroke we've completed the implementation of our `account` query.

That's all kinda messy and we only did one thing: _map the `account` query to the `/api/v1/:id/accounts` REST endpoint_. It's not that messy to _describe_, in fact it's pretty simple. That's our razor! 🔪

## Occam's Razor

Let's create a new type `Node`, which usurps `DataSource`. The unique thing about Node's is they'll derive their own resolvers and context.

```js
class Node {
  constructor(namespace, declaration) {}
  get resolvers() {}
  get context() {}
  get typeDefs {}
}
```

At minimum a `Node` has a `namespace` which is where it organizes everything on the context,
a `typeDef` which is simply merged with any other nodes,
and a _context declaration_ used internally to build and depend on context properties.

Ultimately a `Node` is one piece of the graph. One or more nodes can be composed with `Graph.fromNodes` and served by Apollo Server.

For our mastodon example this looks look like
```js
Node.REST("mastodon", typeDef, {
  baseUrl: Promise.resolve("mastodon.technology")
})
```

With this we're gonna claim the `mastodon` namespace on `context` and attach `baseUrl` to it.

The last argument to any `Node` depends on the underlying implementation. In the case of REST it's a simple
mapping of GraphQL queries to REST endpoints.
```js
 Node.REST("mastodon", {
   baseUrl: Promise.resolve("https://mastodon.technology")
 },{
   get: {
     account: "/api/v1/accounts/:id"
   }
 }
```
> _map the `account` query to the `/api/v1/:id/accounts` REST endpoint_

`Node.REST` uses this config to **derive the data source methods** and distinguish between a Query (GET) and Mutation (POST, PUT, PATCH, DELETE) so they can also **derive the resolvers from the data source**.

Node implementations handle the dirty work of applying the razor, consumers enjoy the benefits. Namaste.

# API
