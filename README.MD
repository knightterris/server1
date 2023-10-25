## Backend server

### Requirements

- [x] Node

- [x] MongoDB

## Installation and Run

```
- npm install

- npm start

```

### Make sure MongoDB service is started

### In linux, use this command

```
- sudo systemctl start mongod
```

## The following codes can be used if MongoDB is installed as well as Mongo Compass for local usage

```javascript
- const mongo = new MongoClient("mongodb://127.0.0.1");
- const db = mongo.db("myan_dev");
```

## If you already have Mongo Cluster, you can use the following codes which are between the comments (//Mongo Atlas (Mongo Cluster) && // (end of Mongo Cluster))

### But you have to replace the 'username' && 'password' of your own in the following code.

```javascript
- const uri = "mongodb+srv://<username>:<password>@cluster0.gzjwno9.mongodb.net/?retryWrites=true&w=majority";
```

### If you don't have cluster account just comment those codes which are between the comments (//Mongo Atlas (Mongo Cluster) && // (end of Mongo Cluster)) and take a look the indexCopy.js.



## For registration process, we need the followings from frontend

```
- name, email, password, created_at

- if registration is successful, it will return the user data.
- I also have made validation to prevent email duplications.
```

## For login process, email and password is required.

```
- if login is successful, it will return a token.
- (in my view), I only store the token in the localstorage. (if thoughts vary, feel free to contact me)
```

## For Topic CRUD , we need following things from frontend
