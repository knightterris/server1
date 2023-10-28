const { MongoClient, ObjectId } = require("mongodb");
const mongo = new MongoClient("mongodb://127.0.0.1");
const db = mongo.db("myan_dev");


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

async function seed() {
    await seedTopic();
    console.log("Done Seeding Topic!"); 
    await seedPosts();
    console.log("Done Seeding Posts!"); 
    process.exit(0);

}; 

seed();