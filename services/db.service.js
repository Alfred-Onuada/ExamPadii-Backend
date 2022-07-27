const { MongoClient, Db } = require("mongodb");

const DB_URI = process.env.DB_URI;
const DB_NAME = process.env.DB_NAME;

let dbInstance = null;

module.exports = {
  /**
   * Establishes connection to the database
   */
  connect: function () {
    return new Promise(async (resolve, reject) => {
      try {
        const mongoClient = new MongoClient(DB_URI);

        await mongoClient.connect();

        dbInstance = mongoClient.db(DB_NAME);

        resolve();
      } catch (error) {
        reject(error);
      }
    });
  },

  /**
   * Retrieves and returns an instance of the database
   * 
   * @returns {Db} an instance of the database
   */
  getInstance: function () {
    if (dbInstance == null) {
      throw Error("There is no active database connection");
    }

    return dbInstance;
  },

  /**
   * Disconnects from the database
   */
  disconnect: function () {
    return new Promise(async (resolve, reject) => {
      try {
        
        if (dbInstance == null) {
          throw Error("There is no active database instance to disconnect from.");
        }

        await dbInstance.close();

        resolve()

      } catch (error) {
        reject(error);
      }
    })
  }
};
