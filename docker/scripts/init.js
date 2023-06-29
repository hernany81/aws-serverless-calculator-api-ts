rs.status();

// Create user
dbAdmin = db.getSiblingDB("mongo");
dbAdmin.createUser({
  user: "hernan",
  pwd: "password",
  roles: [{ role: "readWrite", db: "mongo" }],
  mechanisms: ["SCRAM-SHA-1"],
});

// Authenticate user
dbAdmin.auth({
  user: "hernan",
  pwd: "password",
  mechanisms: ["SCRAM-SHA-1"],
  digestPassword: true,
});

// Create DB and collection
db = new Mongo().getDB("mongo");
db.createCollection("operations");
db.createCollection("users");
db.createCollection("operationrecords");
db.createCollection("authenticationtokens");
