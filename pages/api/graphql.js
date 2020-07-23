import { ApolloServer, gql } from "apollo-server-micro";
import { makeExecutableSchema } from "graphql-tools";
import { MongoClient } from "mongodb";

require("dotenv").config();

const typeDefs = gql`
  type Lead {
    _id: ID!
    notes: [String]
    category: [String]
    businessName: String
    phoneNumber: String
    city: String
    state: String
    email: String
    disposition: String
  }

  type Query {
    leads: [Lead]!
  }
`;

const resolvers = {
  Query: {
    leads(_parent, _args, _context, _info) {
      return _context.db
        .collection("leads")
        .findOne()
        .then((data) => {
          console.log(data);
          return [data];
        });
    },
  },
};

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

let db;

const apolloServer = new ApolloServer({
  schema,
  context: async () => {
    if (!db) {
      try {
        const dbClient = new MongoClient(process.env.MONGO_DB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        if (!dbClient.isConnected()) await dbClient.connect();
        db = dbClient.db("test"); // database name
      } catch (e) {
        console.log("--->error while connecting via graphql context (db)", e);
      }
    }

    return { db };
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default apolloServer.createHandler({ path: "/api/graphql" });
