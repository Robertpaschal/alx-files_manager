// server.js
const express = require('express');
const { dbClient } = require('./utils/db');
const redis = require('redis');
const port = process.env.PORT || 5000;

// Initialize Redis client
const redisClient = redis.createClient();

// Create an instance of Express
const app = express();

// Load routes
const routes = require('./routes');
app.use('/', routes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
