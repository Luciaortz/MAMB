const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = "mongodb://lauraortiz_db_user:Laura2026Mongo@ac-oakz6rs-shard-00-00.iajtvzc.mongodb.net:27017,ac-oakz6rs-shard-00-01.iajtvzc.mongodb.net:27017,ac-oakz6rs-shard-00-02.iajtvzc.mongodb.net:27017/?ssl=true&replicaSet=atlas-d54m38-shard-0&authSource=admin&appName=Cluster1";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(" Conexión exitosa a MongoDB Atlas");
  } catch (err) {
    console.error(" Error:", err);
  } finally {
    await client.close();
  }
}

run();