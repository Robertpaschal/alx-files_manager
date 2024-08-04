const crypto = require('crypto');
const { MongoClient } = require('mongodb');
const url = 'mongodb://localhost:27017'; // Adjust the MongoDB connection URL if needed
const dbName = 'files_manager';
const client = new MongoClient(url);

async function postNew(req, res) {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await usersCollection.insertOne(newUser);

    return res.status(201).json({ id: result.insertedId, email });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
  } finally {
    await client.close();
  }
}

module.exports = { postNew };
