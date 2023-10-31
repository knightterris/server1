const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient("mongodb://127.0.0.1");
const db = mongo.db("myan_dev");
const bcrypt = require("bcrypt");

async function seedTopic(){
    console.log("Start seeding Topics");
    await db.collection("topics").deleteMany({});
    const topics = [
        {
            _id       : new ObjectId(),
            topic     : "HTML",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "CSS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Bootstrap",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Tailwind CSS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "JavaScript",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Vue JS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "React JS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Vanilla JS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Angular JS",
            userId    : new ObjectId(),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            topic     : "Node Js",
            userId    : new ObjectId(),
            create_at : new Date(),
        }
    ];

    try {
        await db.collection("topics").insertMany(topics)
        console.log("Topic collection succeded!")
    } catch (error) {
        console.error("Topic seeding failed!", error)
    }
}

async function seedPosts() {
    console.log("Start seeding Posts.");
    await db.collection("posts").deleteMany({});
    const posts = [
        {
            _id       : new ObjectId(),
            caption   : "HTML",
            userId    : new ObjectId(),
            topicId   : new ObjectId('653d37dd1008dcfec118961f'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption   : "CSS",
            userId    : new ObjectId(),
            topicId   : new ObjectId('653d37dd1008dcfec1189621'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Bootstrap",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec1189623'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Tailwind CSS",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec1189625'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "JavaScript",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec1189627'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Vue JS",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec1189629'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "React JS",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec118962b'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Vanilla JS",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec118962d'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Angular JS",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec118962f'),
            create_at : new Date(),
        },
        {
            _id       : new ObjectId(),
            caption     : "Node Js",
            userId    : new ObjectId(),
            topicId    : new ObjectId('653d37dd1008dcfec1189631'),
            create_at : new Date(),
        }
    ];

    try {
        await db.collection("posts").insertMany(posts)
        console.log("Posts collection succeded!")
    } catch (error) {
        console.error("Posts seeding failed!", error)
    }
}

async function seedUsers() {
    console.log("Start seeding Users.");
    await db.collection("users").deleteMany({});

    const users = [
        {
            _id      : new ObjectId(),
            name     : "John Doe",
            email    : "test@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Jenny",
            email    : "test2@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Dave",
            email    : "test3@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Mike",
            email    : "test4@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Jhoson",
            email    : "test5@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Clara",
            email    : "test6@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Mario",
            email    : "test7@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Lui-ji",
            email    : "test8@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Lyan",
            email    : "test9@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            name     : "Ninja",
            email    : "test10@testgmail.com",
            password : await bcrypt.hash("password", 15),
            create_at: new Date()
        },
    ];

    try {
        await db.collection("users").insertMany(users);
        console.log("Users seeded successfully."); 
    } catch (error) {
        console.error("Users seeding failed.", error);
    }
}

async function seedSavePosts() {
    console.log("Started seeding SavePosts.")
    await db.collection("Saved_posts").deleteMany({});

    const Saved_posts = [
        {
            _id      :new ObjectId(),
            userId   :new ObjectId("653de7eabc618e8c0c511211"),
            PostId   :new ObjectId("653de7eabc618e8c0c5111fd"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7edbc618e8c0c511212"),
            PostId  :new ObjectId("653de7eabc618e8c0c5111ff"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7efbc618e8c0c511213"),
            PostId  :new ObjectId("653de7eabc618e8c0c511201"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7f1bc618e8c0c511214"),
            PostId  :new ObjectId("653de7eabc618e8c0c511203"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7f4bc618e8c0c511215"),
            PostId  :new ObjectId("653de7eabc618e8c0c511205"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7f6bc618e8c0c511216"),
            PostId  :new ObjectId("653de7eabc618e8c0c511207"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7f8bc618e8c0c511217"),
            PostId  :new ObjectId("653de7eabc618e8c0c511209"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7fbbc618e8c0c511218"),
            PostId  :new ObjectId("653de7eabc618e8c0c51120b"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de7febc618e8c0c511219"),
            PostId  :new ObjectId("653de7eabc618e8c0c51120d"),
            create_at: new Date()
        },
        {
            _id     :new ObjectId(),
            userId  :new ObjectId("653de800bc618e8c0c51121a"),
            PostId  :new ObjectId("653de7eabc618e8c0c51120f"),
            create_at: new Date()
        },
    ];

    try {
        await db.collection("Saved_posts").insertMany(Saved_posts);
        console.log("SavePosts seeded successfully."); 
    } catch (error) {
       console.error("SavePosts Seeding fail!", error);
    }
}

//comment Seeding
async function seedComments() {
    console.log("Started seeding Comments")
    await db.collection("comments").deleteMany({});

    const comments = [
        {
            _id      : new ObjectId(),
            comment  : "What a great job!!",
            userId   : new ObjectId("653df432c238ad80e19b6e3f"),
            PostId   : new ObjectId("653df432c238ad80e19b6e2b"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Cool things!!",
            userId   : new ObjectId("653df434c238ad80e19b6e40"),
            PostId   : new ObjectId("653df432c238ad80e19b6e2d"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Nice one!!",
            userId   : new ObjectId("653df437c238ad80e19b6e41"),
            PostId   : new ObjectId("653df432c238ad80e19b6e2f"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Good learning!!",
            userId   : new ObjectId("653df439c238ad80e19b6e42"),
            PostId   : new ObjectId("653df432c238ad80e19b6e31"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Thanks for uploading!!",
            userId   : new ObjectId("653df43cc238ad80e19b6e43"),
            PostId   : new ObjectId("653df432c238ad80e19b6e33"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Happy learning coding!!",
            userId   : new ObjectId("653df43ec238ad80e19b6e44"),
            PostId   : new ObjectId("653df432c238ad80e19b6e35"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Thank You very much!!",
            userId   : new ObjectId("653df441c238ad80e19b6e45"),
            PostId   : new ObjectId("653df432c238ad80e19b6e37"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Great goods!!",
            userId   : new ObjectId("653df443c238ad80e19b6e46"),
            PostId   : new ObjectId("653df432c238ad80e19b6e39"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "GG!!",
            userId   : new ObjectId("653df445c238ad80e19b6e47"),
            PostId   : new ObjectId("653df432c238ad80e19b6e3b"),
            create_at: new Date()
        },
        {
            _id      : new ObjectId(),
            comment  : "Nice Coding, happy learning!!",
            userId   : new ObjectId("653df448c238ad80e19b6e48"),
            PostId   : new ObjectId("653df432c238ad80e19b6e3d"),
            create_at: new Date()
        },
    ];

    try {
        await db.collection("comments").insertMany(comments);
        console.log("Comments seeded successfully."); 
    } catch (error) {
        console.error("Comments Seeding failed!", error)
    }
}


async function seed() {
    await seedTopic();
    console.log("Done Seeding Topic!"); 
    await seedPosts();
    console.log("Done Seeding Posts!"); 
    await seedUsers();
    console.log("Done Seeding Users!");
    await seedSavePosts();
    console.log("Done Seeding SavePosts!");
    await seedComments();
    console.log("Done Seeding Comments!");
    process.exit(0);
}; 

seed();