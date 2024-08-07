/* eslint-disable jest/lowercase-name */
/* eslint-disable jest/valid-expect */
/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

chai.use(chaiHttp);
const { expect } = chai;

describe('API Endpoints', () => {
  before(async () => {
    await dbClient.connect();
    // Set up a token for testing purposes
    await redisClient.set('8a4772c5-8563-4622-964e-08c1edeb247b', '66af6a0fa693a25a0a1d0090');
  });

  after(async () => {
    // Clean up after tests
    await redisClient.del('8a4772c5-8563-4622-964e-08c1edeb247b');
    await dbClient.client.close();
  });

  describe('GET /status', () => {
    it('should return status 200 and OK message', () => new Promise((done) => {
      chai.request(server)
        .get('/status')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.deep.equal({ status: 'OK' });
          done();
        });
    }));
  });

  describe('GET /stats', () => {
    it('should return status 200 and stats object', () => new Promise((done) => {
      chai.request(server)
        .get('/stats')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('users');
          expect(res.body).to.have.property('files');
          done();
        });
    }));
  });

  describe('POST /users', () => {
    it('should create a new user', () => new Promise((done) => {
      chai.request(server)
        .post('/users')
        .send({ email: 'test@example.com', password: 'password123' })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('email', 'test@example.com');
          done();
        });
    }));
  });

  describe('GET /connect', () => {
    it('should return a token', () => new Promise((done) => {
      chai.request(server)
        .get('/connect')
        .auth('test@example.com', 'password123') // Use the credentials from the POST /users test
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    }));
  });

  describe('GET /disconnect', () => {
    it('should disconnect the user', () => new Promise((done) => {
      chai.request(server)
        .get('/disconnect')
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    }));
  });

  describe('GET /users/me', () => {
    it('should return user information', () => new Promise((done) => {
      chai.request(server)
        .get('/users/me')
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', '66af6a0fa693a25a0a1d0090'); // Use the user ID set up in before
          expect(res.body).to.have.property('email');
          done();
        });
    }));
  });

  describe('POST /files', () => {
    it('should upload a new file', () => new Promise((done) => {
      chai.request(server)
        .post('/files')
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .send({
          name: 'myText.txt',
          type: 'file',
          data: 'SGVsbG8gV2Vic3RhY2shCg==',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name', 'myText.txt');
          expect(res.body).to.have.property('type', 'file');
          expect(res.body).to.have.property('localPath');
          done();
        });
    }));
  });

  describe('GET /files/:id', () => {
    it('should retrieve the file by ID', () => new Promise((done) => {
      const fileId = '66b3e58ba0b67987f0869c74'; // Use a valid file ID from your database
      chai.request(server)
        .get(`/files/${fileId}`)
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', fileId);
          done();
        });
    }));
  });

  describe('GET /files', () => {
    it('should return paginated files', () => new Promise((done) => {
      chai.request(server)
        .get('/files')
        .query({ page: 1, limit: 20 }) // Change according to your pagination
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('files');
          expect(res.body.files).to.be.an('array');
          done();
        });
    }));
  });

  describe('PUT /files/:id/publish', () => {
    it('should publish the file', () => new Promise((done) => {
      const fileId = '66b3e58ba0b67987f0869c74'; // Use a valid file ID
      chai.request(server)
        .put(`/files/${fileId}/publish`)
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'published');
          done();
        });
    }));
  });

  describe('PUT /files/:id/unpublish', () => {
    it('should unpublish the file', () => new Promise((done) => {
      const fileId = '66b3e58ba0b67987f0869c74'; // Use a valid file ID
      chai.request(server)
        .put(`/files/${fileId}/unpublish`)
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'unpublished');
          done();
        });
    }));
  });

  describe('GET /files/:id/data', () => {
    it('should retrieve the file data', () => new Promise((done) => {
      const fileId = '66b3e58ba0b67987f0869c74'; // Use a valid file ID
      chai.request(server)
        .get(`/files/${fileId}/data`)
        .set('X-Token', '8a4772c5-8563-4622-964e-08c1edeb247b') // Use the token set up in before
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          done();
        });
    }));
  });
});
