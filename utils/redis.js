#!/usr/bin/env node

const redis = require('redis');

class RedisClient {
  constructor() {
    this.client = redis.createClient({
      host: '127.0.0.1',
      port: 6379,
    });
    this.connected = false;

    this.client.on('error', (err) => console.error('Redis client error:', err));
    this.client.on('connect', () => {
      this.connected = true;
    });
  }

  isAlive() {
    return this.client.connected;
  }

  async get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, (err, value) => {
        if (err) {
          reject(err);
        } else {
          resolve(value);
        }
      });
    });
  }

  async set(key, value, duration) {
    return new Promise((resolve, reject) => {
      this.client.setex(key, duration, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }

  async del(key) {
    return new Promise((resolve, reject) => {
      this.client.del(key, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      });
    });
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;
