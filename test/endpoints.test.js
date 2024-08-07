/* eslint-disable jest/valid-expect */
/* eslint-disable no-undef */
const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

chai.use(chaiHttp);
const { expect } = chai;

describe('aPI Endpoints', () => {
  before(async () => {
    await dbClient.connect();
    await redisClient.set('test_token', 'test_user_id'); // Setting a token for tests
  });

  after(async () => {
    // Clean up after tests
    await redisClient.del('test_token');
    await dbClient.client.close();
  });

  describe('gET /status', () => {
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

  describe('gET /stats', () => {
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

  describe('pOST /users', () => {
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

  describe('gET /connect', () => {
    it('should return a token', () => new Promise((done) => {
      chai.request(server)
        .get('/connect')
        .auth('test@example.com', 'password123') // Use the same credentials used in the POST /users test
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    }));
  });

  describe('gET /disconnect', () => {
    it('should disconnect the user', () => new Promise((done) => {
      chai.request(server)
        .get('/disconnect')
        .set('X-Token', 'test_token') // Use the set token
        .end((err, res) => {
          expect(res).to.have.status(204);
          done();
        });
    }));
  });

  describe('gET /users/me', () => {
    it('should return user information', () => new Promise((done) => {
      chai.request(server)
        .get('/users/me')
        .set('X-Token', 'test_token')
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', 'test_user_id'); // Change according to your user model
          expect(res.body).to.have.property('email');
          done();
        });
    }));
  });

  describe('pOST /files', () => {
    it('should upload a new file', () => new Promise((done) => {
      chai.request(server)
        .post('/files')
        .attach('file', 'path/to/your/test/file.png') // Change to the path of your test file
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('id');
          done();
        });
    }));
  });

  describe('gET /files/:id', () => {
    it('should retrieve the file by ID', () => new Promise((done) => {
      const fileId = 'your_file_id'; // Change to a valid file ID from your database
      chai.request(server)
        .get(`/files/${fileId}`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('id', fileId);
          done();
        });
    }));
  });

  describe('gET /files', () => {
    it('should return paginated files', () => new Promise((done) => {
      chai.request(server)
        .get('/files')
        .query({ page: 1, limit: 10 }) // Change according to your pagination
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('files');
          expect(res.body.files).to.be.an('array');
          done();
        });
    }));
  });

  describe('pUT /files/:id/publish', () => {
    it('should publish the file', () => new Promise((done) => {
      const fileId = 'your_file_id'; // Change to a valid file ID
      chai.request(server)
        .put(`/files/${fileId}/publish`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'published');
          done();
        });
    }));
  });

  describe('pUT /files/:id/unpublish', () => {
    it('should unpublish the file', () => new Promise((done) => {
      const fileId = 'your_file_id'; // Change to a valid file ID
      chai.request(server)
        .put(`/files/${fileId}/unpublish`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('status', 'unpublished');
          done();
        });
    }));
  });

  describe('gET /files/:id/data', () => {
    it('should retrieve the file data', () => new Promise((done) => {
      const fileId = 'your_file_id'; // Change to a valid file ID
      chai.request(server)
        .get(`/files/${fileId}/data`)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('data');
          done();
        });
    }));
  });
});
