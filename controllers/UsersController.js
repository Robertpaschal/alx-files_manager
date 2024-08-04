const crypto = require('crypto');
const dbClient = require('../utils/db');

const hashPassword = (password) => crypto.createHash('sha1').update(password).digest('hex');

const UsersController = {
  async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      const userExists = await dbClient.db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exist' });
      }

      const hashedPassword = hashPassword(password);
      const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

      return res.status(201).json({
        id: result.insertedId,
        email,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
};

module.exports = UsersController;
