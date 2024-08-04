# Files manager
This project is a summary of the back-end trimester: authentication, NodeJS, MongoDB, Redis, pagination and background processing.<br/>

The objective is to build a simple platform to upload and view files:<br/>

+ User authentication via a token
+ List all files
+ Upload a new file
+ Change permission of a file
+ View a file
+ Generate thumbnails for images<br/>

I was guided step by step for building it, but I had some freedoms of implementation, split in more files etc… (`utils` folder)<br/>

Of course, this kind of service already exists in the real life - it’s a learning purpose to assemble each piece and build a full product.

## Learning Objectives
At the end of this project, I was able to explain to anyone, without the help of Google:<br/>

+ how to create an API with Express
+ how to authenticate a user
+ how to store data in MongoDB
+ how to store temporary data in Redis
+ how to setup and use a background worker

## Requirements
+ Allowed editors: `vi`, `vim`, `emacs`, `Visual Studio Code`
+ All files was interpreted/compiled on Ubuntu 18.04 LTS using `node` (version 12.x.x)
+ All files ended with a new line
+ A `README.md` file, at the root of the folder of the project, is mandatory
+ Code used the `js` extension
+ Code was verified against lint using ESLint

## Tasks

+ [x] **0. Redis utils**<br/>
`mandatory`<br/>
Inside the folder `utils`, create a file [redis.js](utils/redis.js) that contains the class `RedisClient`.<br/>

`RedisClient` should have:<br/>

+ the constructor that creates a client to Redis:<br/>
+ any error of the redis client must be displayed in the console (you should use `on('error')` of the redis client)<br/>
+ a function `isAlive` that returns `true` when the connection to Redis is a success otherwise, `false`<br/>
+ an asynchronous function `get` that takes a string key as argument and returns the Redis value stored for this key<br/>
+ an asynchronous function `set` that takes a string key, a value and a duration in second as arguments to store it in Redis (with an expiration set by the duration argument)<br/>
+ an asynchronous function `del` that takes a string key as argument and remove the value in Redis for this key<br/>

After the class definition, create and export an instance of `RedisClient` called `redisClient`.<br/>
```sh
bob@dylan:~$ cat main.js
import redisClient from './utils/redis';

(async () => {
    console.log(redisClient.isAlive());
    console.log(await redisClient.get('myKey'));
    await redisClient.set('myKey', 12, 5);
    console.log(await redisClient.get('myKey'));

    setTimeout(async () => {
        console.log(await redisClient.get('myKey'));
    }, 1000*10)
})();

bob@dylan:~$ npm run dev main.js
true
null
12
null
bob@dylan:~$
```

+ [x] **1. MongoDB utils**<br/>
`mandatory`<br/>
Inside the folder `utils`, create a file `db.js` that contains the class `DBClient`.<br/>

`DBClient` should have:<br/>

+ the constructor that creates a client to MongoDB:
+ host: from the environment variable `DB_HOST` or default: `localhost`
+ port: from the environment variable `DB_PORT` or default: `27017`
+ database: from the environment variable DB_DATABASE or default: `files_manager`
+ a function `isAlive` that returns `true` when the connection to MongoDB is a success otherwise, `false`
+ an asynchronous function `nbUsers` that returns the number of documents in the collection `users`
+ an asynchronous function `nbFiles` that returns the number of documents in the collection `files`<br/>
After the class definition, create and export an instance of `DBClient` called `dbClient`.
```sh
bob@dylan:~$ cat main.js
import dbClient from './utils/db';

const waitConnection = () => {
    return new Promise((resolve, reject) => {
        let i = 0;
        const repeatFct = async () => {
            await setTimeout(() => {
                i += 1;
                if (i >= 10) {
                    reject()
                }
                else if(!dbClient.isAlive()) {
                    repeatFct()
                }
                else {
                    resolve()
                }
            }, 1000);
        };
        repeatFct();
    })
};

(async () => {
    console.log(dbClient.isAlive());
    await waitConnection();
    console.log(dbClient.isAlive());
    console.log(await dbClient.nbUsers());
    console.log(await dbClient.nbFiles());
})();

bob@dylan:~$ npm run dev main.js
false
true
4
30
bob@dylan:~$
```

+ [x] **2. First API**<br/>
`mandatory`<br/>
Inside [server.js](server.js), create the Express server:<br/>

+ it should listen on the port set by the environment variable `PORT` or by default 5000
+ it should load all routes from the file [routes/index.js](routes/index.js)
Inside the folder `routes`, create a file `index.js` that contains all endpoints of our API:

+ `GET /status` => `AppController.getStatus`
+ `GET /stats` => `AppController.getStats`<br/>

Inside the folder `controllers`, create a file `AppController.js` that contains the definition of the 2 endpoints:

+ `GET /status` should return if Redis is alive and if the DB is alive too by using the 2 utils created previously: `{ "redis": true, "db": true }` with a status code 200
+ `GET /stats` should return the number of users and files in DB: `{ "users": 12, "files": 1231 }` with a status code 200
+ `users` collection must be used for counting all users
+ `files` collection must be used for counting all files
**Terminal 1:**
```sh
bob@dylan:~$ npm run start-server
Server running on port 5000
...
```
**Terminal 2:**
```sh

bob@dylan:~$ curl 0.0.0.0:5000/status ; echo ""
{"redis":true,"db":true}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/stats ; echo ""
{"users":4,"files":30}
bob@dylan:~$ 
```

+ [x] **3. Create a new user**<br/>
`mandatory`<br/>
Now that we have a simple API, it’s time to add users to our database.<br/>

In the file [routes/index.js](routes/index.js), add a new endpoint:

+ `POST /users` => `UsersController.postNew`<br/>

Inside `controllers`, add a file [UsersController.js](controllers/UsersController.js) that contains the new endpoint:<br/>

`POST /users` should create a new user in DB:

+ To create a user, you must specify an `email` and a `password`
+ If the `email` is missing, return an error `Missing email` with a status code 400
+ If the `password` is missing, return an error `Missing password` with a status code 400
+ If the `email` already exists in DB, return an error `Already exist` with a status code 400
+ The `password` must be stored after being hashed in `SHA1`
+ The endpoint is returning the new user with only the `email` and the `id` (auto generated by MongoDB) with a status code 201
+ The new user must be saved in the collection `users`:
+ `email`: same as the value received
+ `password`: `SHA1` value of the value received
```sh
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"id":"5f1e7d35c7ba06511e683b21","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ echo 'db.users.find()' | mongo files_manager
{ "_id" : ObjectId("5f1e7d35c7ba06511e683b21"), "email" : "bob@dylan.com", "password" : "89cad29e3ebc1035b29b1478a8e70854f25fa2b2" }
bob@dylan:~$ 
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com", "password": "toto1234!" }' ; echo ""
{"error":"Already exist"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users -XPOST -H "Content-Type: application/json" -d '{ "email": "bob@dylan.com" }' ; echo ""
{"error":"Missing password"}
bob@dylan:~$ 
```

+ [x] **4. Authenticate a user**<br/>
`mandatory`<br/>
In the file `routes/index.js`, add 3 new endpoints:

+ `GET /connect` => `AuthController.getConnect`
+ `GET /disconnect` => `AuthController.getDisconnect`
+ `GET /users/me` => `UserController.getMe`<br/>

Inside `controllers`, add a file [AuthController.js](controllers/AuthController.js) that contains new endpoints:<br/>

`GET /connect` should sign-in the user by generating a new authentication token:

+ By using the header `Authorization` and the technique of the Basic auth (Base64 of the `<email>:<password>`), find the user associate to this email and with this password (reminder: we are storing the SHA1 of the password)
+ If no user has been found, return an error `Unauthorized` with a status code 401
+ Otherwise:
+ Generate a random string (using `uuidv4`) as token
+ Create a key: `auth_<token>`
+ Use this key for storing in Redis (by using the `redisClient` create previously) the user ID for 24 hours
+ Return this token: `{ "token": "155342df-2399-41da-9e8c-458b6ac52a0c" }` with a status code 200<br/>

Now, we have a way to identify a user, create a token (= avoid to store the password on any front-end) and use this token for 24h to access to the API!<br/>

Every authenticated endpoints of our API will look at this token inside the header `X-Token`.<br/>

`GET /disconnect` should sign-out the user based on the token:

+ Retrieve the user based on the token:
+ If not found, return an error `Unauthorized` with a status code 401
+ Otherwise, delete the token in Redis and return nothing with a status code 204<br/>
Inside the file `controllers/UsersController.js` add a new endpoint:<br/>

`GET /users/me` should retrieve the user base on the token used:

+ Retrieve the user based on the token:
+ If not found, return an error `Unauthorized` with a status code 401
+ Otherwise, return the user object (`email` and `id` only)
```sh
bob@dylan:~$ curl 0.0.0.0:5000/connect -H "Authorization: Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE=" ; echo ""
{"token":"031bffac-3edc-4e51-aaae-1c121317da8a"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"id":"5f1e7cda04a394508232559d","email":"bob@dylan.com"}
bob@dylan:~$ 
bob@dylan:~$ curl 0.0.0.0:5000/disconnect -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""

bob@dylan:~$ curl 0.0.0.0:5000/users/me -H "X-Token: 031bffac-3edc-4e51-aaae-1c121317da8a" ; echo ""
{"error":"Unauthorized"}
bob@dylan:~$ 
```
