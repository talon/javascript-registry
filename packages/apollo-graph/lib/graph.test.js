import * as Graph from "./graph";

// Generate a few mock dataSources
const [neat, cool, fun] = [
  new Graph.RESTEdge(
    {
      name: "neat.stuff",
      resource: "/api/v1",
      authorization: "neat.authorization",
      instance: "neat.instance"
    },
    {
      get: {
        stuff: "/:id/stuff"
      }
    }
  ),
  new Graph.RESTEdge(
    {
      name: "cool.stuff",
      resource: "/api/v1",
      authorization: "cool.authorization",
      instance: "cool.instance"
    },
    {
      post: {
        things: "/:id/things"
      }
    }
  ),
  new Graph.RESTEdge(
    {
      name: "fun.stuff",
      resource: "/api/v1",
      authorization: "fun.authorization",
      instance: "fun.instance"
    },
    {
      get: {
        dogs: "/dogs/:id"
      }
    }
  )
];

// builds the context function given an array of nodes
test("Graph.context", async () => {
  const fn = Graph.context([
    { context: async req => ({ name: req.name }) },
    { context: async req => ({ location: req.location }) }
  ]);

  expect(await fn({ name: "Talon", location: "NY" })).toEqual({
    name: "Talon",
    location: "NY"
  });
});

// builds a dataSources object given an array of nodes
test("Graph.dataSources", () => {
  const fn = Graph.dataSources([
    { dataSources: [neat, cool] },
    { dataSources: [fun] }
  ]);

  expect(fn()).toEqual({
    [neat.name]: neat,
    [fun.name]: fun,
    [cool.name]: cool
  });
});

// builds/automatically binds resolvers to their dataSources
test("Graph.resolvers", () => {
  const { Query, Mutation } = Graph.resolvers([
    { dataSources: [cool] },
    { dataSources: [fun, neat] }
  ]);

  expect(Object.keys(Query)).toEqual(["dogs", "stuff"]);
  expect(Object.keys(Mutation)).toEqual(["things"]);
});
