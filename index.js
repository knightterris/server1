const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
// const mongo = new MongoClient("mongodb://127.0.0.1");
// const db = mongo.db("myan_dev");
const bcrypt = require("bcrypt");

//Mongo Atlas (Mongo Cluster)
const uri =
  "mongodb+srv://myan_dev:thebesthacker@cluster0.gzjwno9.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
});

async function run() {
  try {
    await client.connect();
    await client.db("myan_dev").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
// (end of Mongo Cluster)

const multer = require("multer");
const path = require("path");
const fs = require("fs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const port = 3000;
const jwt = require("jsonwebtoken");
const { decode } = require("punycode");
const secret = "secrettokenwithjwtformyandev";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "uploads/";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
});

function auth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({
      msg: "Unauthorized! Access is denied due to invalid credentials.",
    });
  } else {
    jwt.verify(token, secret, (err, user) => {
      if (err) {
        return res.status(403).json({ msg: "Forbidden: Permission Denied" });
      } else {
        res.locals.user = user;
        next();
      }
    });
  }
}

app.post("/register", async (req, res) => {
  const { name, email, password, created_at } = req.body;
  const hashPassword = await bcrypt.hash(password, 10);
  try {
    await client.connect();
    const emailDuplicate = await client
      .db("myan_dev")
      .collection("users")
      .findOne({ email });
    if (emailDuplicate) {
      return res.status(500).json({ message: "Email must be unique." });
    } else {
      const user = await client.db("myan_dev").collection("users").insertOne({
        name,
        email,
        password: hashPassword,
        created_at,
      });
      res.status(200).json({ user, message: "User inserted." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.post("/login", async (req, res) => {
  await client.connect();
  const { email, password } = req.body;
  const user = await client
    .db("myan_dev")
    .collection("users")
    .findOne({ email });
  if (user) {
    try {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        const userData = {
          id: user._id,
          email: user.email,
          name: user.name,
        };
        const token = jwt.sign(user, secret);
        await client
          .db("myan_dev")
          .collection("users")
          .updateOne({ email: email }, { $set: { token: token } });
        // console.log(token)
        return res.send({ token });
      } else {
        return res
          .status(400)
          .json({ msg: "Something went wrong! Please try again!" });
      }
    } catch (error) {
      return res.json({ error: error.message });
    }
  } else {
    return res
      .status(400)
      .json({ msg: "Something went wrong! Please try again!" });
  }
});

app.get("/get/credentials", async (req, res) => {
  const token = req.headers.authorization;
  try {
    await client.connect();
    const decodedToken = jwt.verify(token.replace("Bearer ", ""), secret);
    // console.log(decodedToken)
    // console.log(decodedToken._id)
    if (decodedToken) {
      const user = await client
        .db("myan_dev")
        .collection("users")
        .findOne({
          _id: new ObjectId(decodedToken._id),
        });
      if (user) {
        return res.status(200).json({ user });
      } else {
        return res.status(404).json({ message: "User Not Found!" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.json({ message: error.message });
  }
});

app.post("/create/topic", async (req, res) => {
  const { userId, topic: topicName, created_at } = req.body;
  try {
    await client.connect();
    const userIdObject = new ObjectId(userId);
    const topic = await client.db("myan_dev").collection("topics").insertOne({
      userId: userIdObject,
      topicName,
      created_at,
    });
    return res.status(200).json({ message: "Topic Created", topic });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.get("/get/topics", async (req, res) => {
  try {
    await client.connect();
    const topics = await client
      .db("myan_dev")
      .collection("topics")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator",
          },
        },
      ])
      .toArray();
    return res.json(topics);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

app.put("/update/topic", async (req, res) => {
  const { topicId, userId, topic: topicName, updated_at } = req.body;
  const oldTopic = await client
    .db("myan_dev")
    .collection("topics")
    .findOne({
      _id: new ObjectId(topicId),
    });
  if (oldTopic) {
    try {
      await client.connect();
      const userIdObject = new ObjectId(userId);
      const updateTopic = await client
        .db("myan_dev")
        .collection("topics")
        .updateOne(
          { _id: new ObjectId(topicId) },
          {
            $set: {
              userId: userIdObject,
              topicName: topicName,
              updated_at: updated_at,
            },
          }
        );
      return res.json({ updateTopic, message: "Topic updated." });
    } catch (error) {
      return res.json({ error: error.message });
    }
  } else {
    return res.status(404).json({ message: "Topic not found." });
  }
});

app.delete("/delete/topic", async (req, res) => {
  await client.connect();
  const { topicId } = req.body;
  const topic = await client
    .db("myan_dev")
    .collection("topics")
    .findOne({
      _id: new ObjectId(topicId),
    });
  try {
    if (topic) {
      await client.connect();
      await client
        .db("myan_dev")
        .collection("topics")
        .deleteOne({
          _id: new ObjectId(topicId),
        });
      return res.status(200).json({ message: "Topic Deleted." });
    } else {
      return res.json({ message: "Topic not found." });
    }
  } catch (error) {
    return res.json({ message: error.message });
  }
});

app.post("/create/post", upload.any("post_images"), async (req, res) => {
  const { caption, userId, topicId, created_at } = req.body;
  // console.log(req.files ? "images passed" : "try again")
  if (req.files) {
    var postImages = req.files.map((file) => file.filename);
  }
  // console.log('Post Images:', postImages);
  try {
    await client.connect();
    const userIdObject = new ObjectId(userId);
    const topicIdObject = new ObjectId(topicId);
    const post = await client.db("myan_dev").collection("posts").insertOne({
      caption,
      userId: userIdObject,
      topicId: topicIdObject,
      images: postImages,
      created_at,
    });
    return res.status(200).json(post);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

app.get("/get/posts", async (req, res) => {
  try {
    await client.connect();
    const posts = await client
      .db("myan_dev")
      .collection("posts")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $lookup: {
            from: "topics",
            localField: "topicId",
            foreignField: "_id",
            as: "topic",
          },
        },
      ])
      .toArray();
    return res.status(200).json(posts);
  } catch (error) {
    return res.json({ message: error.message });
  }
});
app.get("/get/posts/:userId", async (req, res) => {
  const userId = req.params.userId;
  try {
    await client.connect();
    const posts = await client
      .db("myan_dev")
      .collection("posts")
      .aggregate([
        {
          $match: {
            userId: new ObjectId(userId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $lookup: {
            from: "topics",
            localField: "topicId",
            foreignField: "_id",
            as: "topic",
          },
        },
      ])
      .toArray();
    return res.status(200).json(posts);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

app.put("/update/profile", async (req, res) => {
  const { userId, newName, newPosition, occupationVal } = req.body;
  // console.log(userId, ``)
  for (const i of occupationVal) {
    console.log(i);
  }
  await client.connect();
  const user = await client
    .db("myan_dev")
    .collection("users")
    .findOne({
      _id: new ObjectId(userId),
    });
  if (user) {
    try {
      await client
        .db("myan_dev")
        .collection("users")
        .updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              name: newName,
              position: newPosition,
              occupations: occupationVal,
            },
          }
        );
      console.log(user);
      // return res.status(200).json({user})
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: error.message });
    }
  }
});
// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log("API server running at " + port);
});
