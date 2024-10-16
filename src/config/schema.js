export default
  {
    type: "object",
    properties: {
      basePort: { type: "number", format: "int32", default: 3000, minimum: 1800, maximum: 65535, multipleOf: 1, description: "The base port number"},
      dbFileName: { type: "string", format:"uri-reference", description: "The name of the database file"},
      clusters: { type: "boolean", default: true, description: "If true, there will be as many worker processes as CPUs"},
      freshStart: { type: "boolean", default: false, description: "If true, the database will be reinitialized"}
    },
    required: ["basePort", "dbFileName"]
  }
