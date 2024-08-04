// utils/db.js
const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    
    this.uri = `mongodb://${host}:${port}`;
    this.databaseName = database;
    this.client = new MongoClient(this.uri, { useNewUrlParser: true, useUnifiedTopology: true });
    this.db = null;
  }

  async connect() {
    if (!this.db) {
      try {
        await this.client.connect();
        this.db = this.client.db(this.databaseName);
      } catch (err) {
        console.error('Failed to connect to the database:', err);
        throw err;
      }
    }
  }

  async isAlive() {
    try {
      await this.connect();
      // Ping the server to check if the connection is alive
      await this.client.db(this.databaseName).command({ ping: 1 });
      return true;
    } catch (err) {
      console.error('Database connection error:', err);
      return false;
    }
  }

  async nbUsers() {
    try {
      await this.connect();
      const usersCollection = this.db.collection('users');
      const count = await usersCollection.countDocuments();
      return count;
    } catch (err) {
      console.error('Failed to count users:', err);
      throw err;
    }
  }

  async nbFiles() {
    try {
      await this.connect();
      const filesCollection = this.db.collection('files');
      const count = await filesCollection.countDocuments();
      return count;
    } catch (err) {
      console.error('Failed to count files:', err);
      throw err;
    }
  }
}

// Create and export a single instance of DBClient
const dbClient = new DBClient();
module.exports = { dbClient };
