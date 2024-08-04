#!/usr/bin/env node

const { MongoClient } = require('mongodb');
// eslint-disable-next-line import/no-extraneous-dependencies
const dotenv = require('dotenv');

dotenv.config();

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const url = `mongodb://${host}:${port}`;

    this.client = new MongoClient(url, { useUnifiedTopology: true });
    this.db = null;
    this.connect();
  }

  async connect() {
    try {
      await this.client.connect();
      this.db = this.client.db(process.env.DB_DATABASE || 'files_manager');
    } catch (err) {
      console.error('MongoDB connection error:', err);
    }
  }

  isAlive() {
    return this.client.isConnected();
  }

  async nbUsers() {
    if (!this.db) return 0;
    return this.db.collection('users').countDocuments();
  }

  async nbFiles() {
    if (!this.db) return 0;
    return this.db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
