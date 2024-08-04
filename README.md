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
