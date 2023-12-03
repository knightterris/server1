const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");
// use if local
// const mongo = new MongoClient("mongodb://127.0.0.1");
// const db = mongo.db("myan_dev");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

app.use(express.json());
app.use(express.text());
app.use(express.raw());
app.use(express.urlencoded({ extended: true }));
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 3001;
const jwt = require("jsonwebtoken");
const { decode } = require("punycode");
const secret = "secrettokenwithjwtformyandev";

// use if created a cluster account
//Mongo Atlas (Mongo Cluster)
const uri = "mongodb+srv://myan_dev:thebesthacker@cluster0.gzjwno9.mongodb.net/?retryWrites=true&w=majority";
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
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
    await client.close();
  }
}
run().catch(console.dir);
// (end of Mongo Cluster)

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

// authentication with token (need to add later in all apis)
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

function makeSecurityKey(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789*@#$_';
  const charactersLength = characters.length;
  let counter = 0;
  while (counter < length) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
    counter += 1;
  }
  return result;
}
//register
app.post("/register", upload.none(), async (req, res) => {
  const { name, email, password } = req.body;
  if (
    name === null || name === '' || name === undefined &&
    email === null || email === '' || email === undefined &&
    password === null || password === '' || password === undefined
  ) {
    return res.status(400).json({message: "Please check your inputs."});
  } else {
    const hashPassword = await bcrypt.hash(password, 10);
    try {
      await client.connect();
      const emailDuplicate = await client.db("myan_dev").collection("users").findOne({ email });
      if (emailDuplicate) {
        return res.status(500).json({ message: "Email must be unique." });
      } else {
        const user = await client.db("myan_dev").collection("users").insertOne({
          name,
          email,
          password: hashPassword,
          created_at: new Date(),
          profileImage: "null.png",
        });
        res.status(200).json({ user, message: "User inserted." });
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

//login
app.post("/login",upload.none(), async (req, res) => {
  await client.connect();
  const { email, password } = req.body;
  if (
    email === null ||
    email === "" ||
    (email === undefined && password === null) ||
    password === "" ||
    password === undefined
  ) {
    return res.status(400).json({ message: "Please check your inputs." });
  } else {
    const user = await client
      .db("myan_dev")
      .collection("users")
      .findOne({ email });
    if (user) {
      try {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
          const token = jwt.sign(user, secret);
          const securityKey = makeSecurityKey(300);
          await client
            .db("myan_dev")
            .collection("users")
            .updateOne(
              { email: email },
              { $set: { 
                token: token, 
                security_key: securityKey,
                updated_at: new Date(),
                forgot_password: false,
              } 
            });
          return res.status(200).json({token: token , security_key: securityKey});
          // return res.status(200).send(token);
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
  }
});
//get credentials
app.get("/get/credentials", async (req, res) => {
  const token = req.headers.authorization;
  try {
    await client.connect();
    const decodedToken = jwt.verify(token.replace("Bearer ", ""), secret);
    // console.log(decodedToken)
    // console.log(decodedToken._id)
    if (decodedToken) {
      const user = await client.db("myan_dev").collection("users").findOne({
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

//create topic
app.post("/create/topic", auth, upload.none(), async (req, res) => {
  const { userId, topic: topicName } = req.body;
  if (
    userId === null ||
    userId === "" ||
    (userId === undefined && topicName === null) ||
    topicName === "" ||
    topicName === undefined
  ) {
    return res.status(400).json({ message: "Please check your inputs." });
  } else {
    try {
      await client.connect();
      const userTopicCount = await client.db("myan_dev").collection("topics").countDocuments({
        userId: new ObjectId(userId),
      });

      console.log("This is the current topic count that user _id " + userId + " created -> " + userTopicCount + " topics.");
      if (userTopicCount === 0 || (userTopicCount > 0 && userTopicCount < 5)) {
        const topic = await client.db("myan_dev").collection("topics").insertOne({
          userId: new ObjectId(userId),
          topicName,
          created_at: new Date(),
        });

        const userCreatedTopicCount = await client.db("myan_dev").collection("topics").countDocuments({
          userId: new ObjectId(userId),
        });
        const leftTopicCount = 5 - parseInt(userCreatedTopicCount);
        console.log(leftTopicCount);
        return res.status(200).json({message: "Topic Created! Topic counts : " + leftTopicCount + " left!", topic});
      } else if (userTopicCount === 0 || userTopicCount > 0 && userTopicCount === 5) {
        return res.status(403).json({message: "You can't create more than 5 topics.May be you have created more than 5 topics!"});
      } else if (userTopicCount === 0 || userTopicCount > 0 && userTopicCount > 5) {
        return res.status(403).json({ message: "You can't create more than 5 topics" });
      } else {
        return res.status(406).json({message:"Something went wrong! May be you have created more than 5 topics!"});
      }
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
});

//get all topics
app.get("/get/topics", auth, async (req, res) => {
  try {
    await client.connect();
    const topics = await client.db("myan_dev").collection("topics").aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "creator",
          },
        },
      ]).toArray();
    return res.json(topics);
  } catch (error) {
    return res.json({ error: error.message });
  }
});

//update topic
app.put("/update/topic", auth, upload.none(),async (req, res) => {
  const { topicId, userId, topic: topicName } = req.body;
  if (
    userId === null || userId === '' || userId === undefined &&
    topicId === null || topicId === '' || topicId === undefined &&
    topicName === null || topicName === '' || topicName === undefined
  ) {
    return res.status(400).json({message: "Please check your inputs."});
  } else {
    await client.connect();
    const oldTopic = await client.db("myan_dev").collection("topics").findOne({
        _id: new ObjectId(topicId),
    });
    if (oldTopic) {
      try {
        const userIdObject = new ObjectId(userId);
        const updateTopic = await client.db("myan_dev").collection("topics")
          .updateOne(
            { _id: new ObjectId(topicId) },
            {
              $set: {
                userId: userIdObject,
                topicName: topicName,
                updated_at: new Date(),
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
  }
});

// delete topic
app.delete("/delete/topic", auth,upload.none(),async (req, res) => {
  await client.connect();
  const { topicId } = req.body;
  const topic = await client.db("myan_dev").collection("topics").findOne({
      _id: new ObjectId(topicId),
    });
  try {
    if (topic) {
      await client.connect();
      await client.db("myan_dev").collection("topics").deleteOne({
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

app.post("/create/post", upload.any("post_images"), auth,async (req, res) => {
  const { caption, userId, topicId } = req.body;
  // console.log(req.files ? "images passed" : "try again")
  // if (req.files) {
  //   var postImages = req.files.map((file) => file.filename);
  // }
  // console.log('Post Images:', postImages);
  if (
    userId && topicId && caption && 
    userId !== "" && topicId !== "" && caption !== "" 
  ) {
    if (req.files) {
      var postImages = req.files.map((file) => file.filename);
    } else {
      postImages = [];
    }
    try {
      await client.connect();
      // const userIdObject = new ObjectId(userId);
      // const topicIdObject = new ObjectId(topicId);
      const post = await client.db("myan_dev").collection("posts").insertOne({
        caption,
        userId: new ObjectId(userId),
        topicId: new ObjectId(topicId),
        images: postImages,
        created_at: new Date(),
      });
      return res.status(200).json(post);
    } catch (error) {
      return res.json({ error: error.message });
    }
  } else {
    return res.status(400).json({ message: "Please fill all fields." });
  }
});

app.put("/update/post",  auth, upload.any("post_updateImages"), async (req, res) => {
  const { updatedCaption, userId, topicId, postId } = req.body;
  console.log(req.body);
  console.log("imgaes " + req.files.map((file) => file.filename));
  console.log(updatedCaption);
  await client.connect();
  const oldPost = await client.db("myan_dev").collection("posts").findOne({
    _id: new ObjectId(postId)
  });
  if(oldPost){
    // console.log(oldPost.images);
    if (!updatedCaption || !userId || !topicId || !postId) {
      return res.status(400).json({message: "Please check your inputs."});
    }else{
      try {
        if (req.files.length > 0) {
          let filePathsToDelete = [];
          filePathsToDelete = oldPost.images;
          for (const filename of filePathsToDelete) {
            const oldImagesPath = __dirname  + `/uploads/${filename}`;
            if (oldImagesPath) {
              console.log("images exist. the path is " + oldImagesPath )
              fs.unlinkSync(oldImagesPath); 
              var postUpdateImages = req.files.map((file) => file.filename);
              console.log(postUpdateImages)
            }else{
              postUpdateImages = oldPost.images;
              // console.log("no", "Here are old images " + oldImages)
            }
          }
          const updatePost = await client.db("myan_dev").collection("posts").updateOne(
            { _id: new ObjectId(postId) },
          {
            $set: {
              userId: new ObjectId(userId),
              topicId: new ObjectId(topicId),
              caption: updatedCaption,
              images: postUpdateImages,
              updated_at: new Date(),
            },
          });
  
          // note here is the constant `updatedPost`
          const updatedPost = await client.db("myan_dev").collection("posts").findOne({
            _id: new ObjectId(postId)
          });
  
          return res.status(200).json({message: "Post updated", updatedPost})
        } else {
          const updatePost = await client.db("myan_dev").collection("posts").updateOne(
            { _id: new ObjectId(postId) },
            {
              $set: {
                userId: new ObjectId(userId),
                topicId: new ObjectId(topicId),
                caption: updatedCaption,
                updated_at: new Date(),
              },
            }
          );
          const updatedPost = await client.db("myan_dev").collection("posts").findOne({
            _id: new ObjectId(postId)
          });

          return res.status(200).json({ message: "Post updated", updatedPost });
        }
      } catch (error) {
        return res.json({ error: error.message });
      }
    }
  }

});

app.get("/get/posts", auth,async (req, res) => {
  try {
    await client.connect();
    const posts = await client.db("myan_dev").collection("posts").aggregate([
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

app.delete("/delete/post/:postId", upload.none(), auth, async (req,res) => {
  const postId = req.params.postId;
  try {
    await client.connect();
    const postToBeDeleted = await client.db("myan_dev").collection("posts").findOne({
      _id: new ObjectId(postId)
    });
    if (postToBeDeleted) {
      await client.db("myan_dev").collection("posts").deleteOne({
        _id: new ObjectId(postId)
      });
      return res.status(200).json({message:"Post deleted"});
    }else{
      return res.status(404).json({message: "Post not Found"});
    }
  } catch (error) {
    return res.json({ error: error.message });
  }
})

app.get("/get/posts/:userId", auth,async (req, res) => {
  const userId = req.params.userId;
  try {
    await client.connect();
    const posts = await client.db("myan_dev").collection("posts").aggregate([
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

app.put("/update/profile/:userId", auth, upload.single("new_profile_img"), async (req, res) => {
    const { newName } = req.body;
    const { userId } = req.params;
    var imageStatus = req.file ? true : false;
    // console.log("New Profile image name from mongodb is " + newProfileImg);
    await client.connect();
    const user = await client
    .db("myan_dev")
    .collection("users")
    .findOne({
      _id: new ObjectId(userId),
    });
    const oldImg = user.profileImage;
    const newProfileImg = req.file ? req.file.filename : oldImg;
    const oldName = user.name;
    if(imageStatus){
      const oldImagePath = __dirname + `/uploads/${oldImg}`;
      if(oldImagePath != __dirname + `/uploads/null.png`){
        fs.unlinkSync(oldImagePath);
      }
    }
    const nameToBeUpdated = newName ? newName : oldName;
    const imgToBeUpdated = newProfileImg ? newProfileImg : oldImg;
    
    if (user) {
      await client.db("myan_dev").collection("users").updateOne(
        {_id: new ObjectId(userId)},
        {
          $set:{
            name: nameToBeUpdated,
            profileImage: imgToBeUpdated,
            updated_at: new Date(),
          }
        }
      );
    const updatedProfile = await client
    .db("myan_dev")
    .collection("users")
    .findOne({
      _id: new ObjectId(userId),
    });
      return res.status(200).json({msg:"Your Profile has been updated.", updatedProfile});
    } else {
      return res.status(404).json({ msg: "User Not Found!" });
    }
});

//update profile/ bio
app.put("/update/bio/:userId", upload.none(), auth, async (req, res) => {
  const { userId } = req.params;
  if (req.body.position && req.body.position != undefined && req.body.position != "" &&
  req.body.company && req.body.company != undefined && req.body.company != "" 
  ) {
    var  position  = req.body.position;
    var  company  = req.body.company;
  } else {
    return res.status(406).json({msg: "Please check your inputs."});
  }
  await client.connect();
  const user = await client.db("myan_dev").collection("users").findOne({
    _id: new ObjectId(userId)
  });
  var bio = position + " at " + company;
  if (user) {
    try {
      await client.db("myan_dev").collection("users").updateOne(
        { _id: new ObjectId(userId) },
        {
          $set:{
            position: position,
            company: company,
            bio: bio,
            updated_at: new Date(), 
          }
        }
      );
      const updatedProfile = await client.db("myan_dev").collection("users").findOne({
        _id: new ObjectId(userId),
      });
      return res.status(200).json({updatedProfile});
    } catch (error) {
      return res.status(500).json({error: error.message});
    }
  } else {
    return res.status(404).json({msg:"User Not Found."});
  }
});

app.put("/update/jobs/:userId", upload.none(), auth, async (req, res) =>{
  const {userId} = req.params;
  var {position,company} = req.body;
  // var {company} = req.body.company;
  console.log(userId, position, company);
  await client.connect();
  const user = await client.db("myan_dev").collection("users").findOne({
    _id: new ObjectId(userId)
  });
  user.jobs = user.jobs || [];
  if (user) {
    if (userId && userId != undefined && userId != "" &&
    position && position != undefined && position != "" &&
    company && company != undefined && company != "" ) {
      await client.db("myan_dev").collection("users").updateOne(
        {_id: new ObjectId(userId)},
        {
          $push:{
            jobs:{
              "position": position,
              "company": company,
            }
          }
        }
      );
      const updatedProfile = await client.db("myan_dev").collection("users").findOne({
        _id: new ObjectId(userId),
      })
      return res.status(200).json({updatedProfile});
    } else {
      return res.status(406).json({msg:"Please check your inputs."})
    }
  } else {
    return res.status(404).json({msg:"User not found!"});
  }
});

app.delete("/remove/job/:userId",upload.none(), auth, async (req, res) => {
  const {userId} = req.params;
  const {position, company} = req.body;
  await client.connect();
  const user = await client.db("myan_dev").collection("users").findOne({
    _id: new ObjectId(userId)
  });
  if(user){
    var oldJobs = user.jobs || [];
    if (oldJobs != []) {
      const filteredJobs = oldJobs.filter(
        (job) => job.position !== position || job.company !== company
      );
      await client.db("myan_dev").collection("users").updateOne(
        {_id: new ObjectId(userId)},
        {
          $set:{
            jobs: filteredJobs
          }
        }
      );
      const updatedProfile = await client.db("myan_dev").collection("users").findOne({
        _id: new ObjectId(userId),
      });
      return res.status(200).json({updatedProfile});
    } else {
      return res.status(500).json({msg:"Something went wrong."});
    }
  }else{
    return res.status(404).json({msg: "User Not Found!"});
  }
});


app.put("/forget/password/:userId", upload.none(), auth, async (req, res) => {
  const {userId} = req.params;
  const {securityKey} = req.body;
  let securityStatus ;
  await client.connect();
  const user = await client.db("myan_dev").collection("users").findOne({
    _id: new ObjectId(userId)
  });
  if(user){
    const oldSecurityKey =  user.security_key;
    if(securityKey && securityKey != "" && securityKey != undefined){
      if(securityKey === oldSecurityKey){
        securityStatus = true;
        await client.db("myan_dev").collection("users").updateOne(
          { _id: new ObjectId(userId)},
          {
            $set:{
              forgot_password: securityStatus
            }
          }
        );
        return res.status(200).json(true);
      }
      return res.status(400).json(false);
    }else{
      return res.status(400).json({msg: "Something's wrong with security key."});
    }
  }else{
    return res.status(404).json({msg: "User Not Found"});
  }
});

app.put("/change/password/:userId", upload.none(), auth, async (req, res) => {
  const {userId} = req.params;
  const { newPassword, confirmPassword } = req.body;
  await client.connect();
  const user = await client
    .db("myan_dev")
    .collection("users")
    .findOne({
      _id: new ObjectId(userId),
    });

  if (user) {
    if(confirmPassword === newPassword){
      const valid = user.forgot_password;
      if (valid == true) {
        try {
          const hashPassword = await bcrypt.hash(newPassword, 10);
          await client
            .db("myan_dev")
            .collection("users")
            .updateOne(
              { _id: new ObjectId(userId) },
              {
                $set: {
                  password: hashPassword,
                  updated_at: new Date(),
                },
              }
            );
          return res.status(200).json({ message: "Password has been changed." });
        } catch (error) {
          console.log(error);
          return res.status(500).json({ error: error.message });
        }
      }else{
        return res.status(400).json({msg:"Something went wrong!"});
      }
    }else{
      return res.status(400).json({msg: "Passwords do not match!"});
    }
  }else{
    return res.status(404).json({msg: "User not Found!"});
  }

});
// update password
app.put("/update/password", auth,async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;
  await client.connect();
  const user = await client.db("myan_dev").collection("users").findOne({
      _id: new ObjectId(userId),
    });

  if (user) {
    const valid = await bcrypt.compare(oldPassword, user.password);
    if (valid) {
      try {
        const hashPassword = await bcrypt.hash(newPassword, 10);
        await client
          .db("myan_dev")
          .collection("users")
          .updateOne(
            { _id: new ObjectId(userId) },
            {
              $set: {
                password: hashPassword,
                updated_at: new Date(),
              },
            }
          );
        return res.status(200).json({ message: "Password has been changed." });
      } catch (error) {
        console.log(error);
      return res.status(500).json({ error: error.message });
      }
    }
  }
});

// delete profile or delete account
app.delete("/delete/profile/:userId",auth, async (req, res) => {
  try {
    const { userId } = req.params;
    await client.connect();
    const user = await client.db("myan_dev").collection("users").findOne({
      _id: new ObjectId(userId),
    });
    if (user) {
      await client.db("myan_dev").collection("users").deleteOne({
        _id: new ObjectId(userId),
      });
      return res.status(200).json({message: "Account has been deleted!"});
    }else{
      return res.status(404).json({message: "Account not found!"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
  
});

// create save post
app.post("/save/post", auth, upload.none(), async(req, res) => {
  const { postId, userId, topicId } = req.body;
  try {
    await client.connect();
    const savedPost = await client.db("myan_dev").collection("saved_posts").insertOne({
      post_id: new ObjectId(postId),
      user_id: new ObjectId(userId),
      topic_id: new ObjectId(topicId),
      created_at: new Date()
    }).toArray();
    return res.status(200).json(savedPost);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.get("/get/savedPosts", auth, async(req, res) => {
  const { userId } = req.body;
  try {
    await client.connect();
    const posts = await client.db("myan_dev").collection("saved_posts").aggregate([
      {
        $match: {
          user_id: new ObjectId(userId),
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "creator",
        },
      },
      {
        $lookup: {
          from: "posts",
          localField: "post_id",
          foreignField: "_id",
          as: "my_posts",
        },
      },
      {
        $lookup: {
          from: "topics",
          localField: "topic_id",
          foreignField: "_id",
          as: "topic",
        },
      },
    ]).toArray();
    if(posts){
      return res.status(200).json(posts);
    }else{
      return res.status(404).json({message: "No post found!"});
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.delete("/unsave/post", auth, upload.none(), async(req, res) => {
  const { savedPostId } = req.body;
  try {
    await client.connect();
    await client.db("myan_dev").collection("saved_posts").deleteOne({
      _id: new ObjectId(savedPostId),
    });
    return res.status(200).json({message: "Unsaved post."});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.post("/post/comment",auth, upload.any("comment_images"), async (req, res) => {
  const { userId, postId, comment } = req.body; 
  // if (req.files) {
  //   var postImages = req.files.map((file) => file.filename);
  // }
  try {
    await client.connect();
    const comment = await client.db("myan_dev").collection("comments").insertOne({
      user_id: new ObjectId(userId),
      post_id: new ObjectId(postId),
      commentText: comment,
      created_at: new Date()
      // images: postImages
    });
    return res.status(201).json({message: "Commented", comment});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.get("/get/post/comment", auth,async(req, res) => {
  const { userId, postId } = req.body;
  try {
    await client.connect();
    const comments = await client.db("myan_dev").collection("comments").aggregate([
      { 
        $match : { 
          userId : new ObjectId(userId), 
          postId : new ObjectId(postId)
        }
      },
      {
        $lookup:{
          from:"users",
          localField:"userId",
          foreignField:"_id",
          as:"commenter"
        }
      }
    ]).toArray();
    if(!comments){
      return res.status(404).json({message: "No comments for this post"})
    }
    else{
      return res.status(200).json(comments);
    }
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ error: error.message }); 
  }
});

app.put("/update/comment", auth,upload.any("comment_updateImg"), async(req, res) => {
  const { userId, postId, commentId, newComment } = req.body;
  // if (req.files) {
  //   var postImages = req.files.map((file) => file.filename);
  // }
  try { 
    await client.connect();
    const comment = await client.db("myan_dev").collection("comments").findOne({
      userId: new ObjectId(userId),
      _id: new ObjectId(commentId),
      postId: new ObjectId(postId)
    });
    if (comment){
      await client.db("myan_dev").collection("comments").findOneAndUpdate(
        { userId: new ObjectId(userId) },
        { _id: new ObjectId(commentId) },
        { postId: new ObjectId(postId) },
        {
          $set: {
            commentText: newComment,
            updated_at: new Date(),
          },
        });
        const updatedComment = await client.db("myan_dev").collection("comments").findOne({
          userId: new ObjectId(userId),
          _id: new ObjectId(commentId),
          postId: new ObjectId(postId)
        }).toArray();
        return res.status(200).json({message: "Comment Updated", updatedComment});
    }
    else{
      return res.status(404).json({message: "Comment not found"})
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.delete("delete/comment",auth, upload.none(), async(req,res) => {
  const { commentId } = req.body;
  try {
    await client.connect();
    // await client.db("myan_dev").collection("comments").findOneAndDelete({
    //   _id: new ObjectId(commentId)
    // })
    const comment = await client.db("myan_dev").collection("comments").findOne({
      _id: new ObjectId(commentId),
    });
    if(comment){
      await client.db("myan_dev").collection("comments").deleteOne({
        _id: new ObjectId(commentId)
      });
      return res.status(200).json({message: "Comment Deleted"})
    }else{
      return res.status(404).json({message: "Comment Not Found"})
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

//toggle like to post and comments(toggle like function need to be refactored)
app.put("/toggle/like",auth, upload.none(), async(req, res) => {
  const { postId, commentId, userId, event } = req.body;
  try {
    await client.connect();
    if(event == "likePost" && postId != null && postId != '' && userId != null && userId != '' ){
      const post = await client.db("myan_dev").collection("posts").findOne({
        _id: new ObjectId(postId)
      });
      post.reactions = post.reactions || [];
      if (post.reactions.find(item => item.toString() === userId)) {
        post.reactions = post.reactions.filter(uid => uid.toString() !== userId);
      } else {
        post.reactions.push(new ObjectId(userId));
      }
      await client.db("myan_dev").collection("posts").updateOne(
        { _id: new ObjectId(postId) },
        {
          $set: post,
        },
      );
      const likedPost = await client.db("myan_dev").collection("posts").findOne({
        _id: new ObjectId(postId)
      }).toArray();
      return res.status(200).json({ message: 'Liked post', likedPost });

    }
    //comment toggle like
    else if(event == "likeComment" && commentId != null && commentId != '' && userId != null && userId != '' ){
      const comment = await client.db("myan_dev").collection("comments").findOne({
        _id: new ObjectId(commentId)
      });
      comment.reactions = comment.reactions || [];
      if (comment.reactions.find(item => item.toString() === userId)) {
        comment.reactions = comment.reactions.filter(uid => uid.toString() !== userId);
      } else {
        comment.reactions.push(new ObjectId(userId));
      }
      await client.db("myan_dev").collection("comments").updateOne(
        { _id: new ObjectId(postId) },
        {
          $set: comment,
        },
      );
      const likedComment = await client.db("myan_dev").collection("comments").findOne({
        _id: new ObjectId(commentId)
      }).toArray();
      return res.status(200).json({ message: 'Liked comment', likedComment });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message }); 
  }
});

app.post("/share/post/:postId/:userId", upload.none(), async (req, res) => {
  const { userId, postId } = req.params;
  const { shareCaption } = req.body;

  try {
    if (userId && postId) {
      if (shareCaption) {
        console.log("You are passing with full requirements");
      } else {
        console.log("You are passing without caption");
      }
  
      console.log("userId - ", userId);
      console.log("postId - ", postId);
      console.log("shareCaption - ", shareCaption || "No caption provided");
    } else {
      return res.json({ message: "Something went wrong." });
    }
  } catch (error) {
    console.log(error)
    return res.json(error)
  }
});

app.get("/test", async (req, res) => {
  return res.json({ message: "App is working." });
});
// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.listen(port, () => {
  console.log("API server running at " + port);
});

module.exports = app;
