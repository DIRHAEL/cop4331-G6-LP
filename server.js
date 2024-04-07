const express = require('express')

const multer = require('multer')
const bodyParser = require('body-parser')
const cors = require('cors')
const sharp = require('sharp')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const sharp = require('sharp')
const path = require('path')
require('dotenv').config()
const PORT = process.env.PORT || 5000

import { uploadFile, deleteFile, getObjectSignedUrl } from './s3.js'

const app = express()
app.set('port', process.env.PORT || 5000)
if (process.env.NODE_ENV === 'production') {
	// Set static folder
	app.use(express.static('frontend/build'))

	app.get('*', (req, res) => {
		res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
	});
}

const url = process.env.MONGODB_URI;
const MongoClient = require('mongodb').MongoClient
const client = new MongoClient(url)
client.connect(console.log('mongodb connected'))
app.use(cors())
app.use(bodyParser.json())

// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })

// const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

// app.get('/posts', async (req, res) => {
// 	try 
// 	{
// 		const db = client.db('COP4331-G6-LP');
// 		const posts = await db.collection('Images').find().sort({ created: -1 }).toArray();

// 		for (let post of posts) {
// 			post.imageUrl = await getObjectSignedUrl(post.imageName);
// 		}

// 		res.send(posts);
// 	} 
// 	catch (e) 
// 	{
// 		console.error(e);
// 		res.status(500).send('An error occurred while fetching posts.');
// 	}
// });


// app.post('/api/posts', upload.single('image'), async (req, res) => {
//     try {
//         const file = req.file;
//         const caption = req.body.caption;
//         const imageName = generateFileName();

//         const fileBuffer = await sharp(file.buffer)
//             .resize({ height: 1920, width: 1080, fit: "contain" })
//             .toBuffer();

//         await uploadFile(fileBuffer, imageName, file.mimetype);

//         const db = client.db('COP4331-G6-LP');
//         const post = await db.collection('Images').insertOne({
//             imageName,
//             caption,
//         });

//         res.status(201).send(post);
//     } catch (e) {
//         console.error(e);
//         res.status(500).send('An error occurred while creating the post.');
//     }
// });


// app.delete("/api/posts/:id", async (req, res) => {
//     try {
//         const id = req.params.id;
//         const db = client.db('COP4331-G6-LP');
//         const postsCollection = db.collection('Images');

//         // Find the post
//         const post = await postsCollection.findOne({ _id: new mongodb.ObjectID(id) });
//         if (!post) {
//             return res.status(404).send('Post not found.');
//         }

//         // Delete the image from S3
//         await deleteFile(post.imageName);

//         // Delete the post from the database
//         await postsCollection.deleteOne({ _id: new mongodb.ObjectID(id) });

//         res.send(post);
//     } catch (e) {
//         console.error(e);
//         res.status(500).send('An error occurred while deleting the post.');
//     }
// });


app.post("/api/createuser", async (req, res, next) => {
	const { firstName, lastName, username, email, password } = req.body;

	// Validate email format
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	if (!emailRegex.test(email)) {
		return res.status(400).json({ error: "Invalid email format" });
	}

	let error = "";

	try {
		const db = client.db("COP4331-G6-LP");
		// Check if email already exists
		const emailExists = await db.collection("Users").findOne({ Email: email });
		if (emailExists) {
			return res.status(400).json({ error: "Email already exists" });
		}

		// Check if username already exists
		const usernameExists = await db.collection("Users").findOne({ Username: username });
		if (usernameExists) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Hash the password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = {
			FirstName: firstName,
			LastName: lastName,
			Username: username,
			Email: email,
			Password: hashedPassword,
		};
		const result = await db.collection("Users").insertOne(newUser);
	} catch (e) {
		error = e.toString();
	}

	res.status(error ? 500 : 200).json({ error: error });
});

// Updated /api/login endpoint to include bcrypt password comparison
app.post("/api/login", async (req, res, next) => {
	const { login, password } = req.body;

	let error = "";
	let user;

	try {
		const db = client.db("COP4331-G6-LP");
		user = await db.collection("Users").findOne({ Email: login });
		if (user) {
			const passwordMatch = await bcrypt.compare(password, user.Password);
			if (!passwordMatch) {
				error = "Invalid credentials";
				user = null; // Invalidate user if password does not match
			}
		} else {
			error = "User not found";
		}
	} catch (e) {
		error = e.toString();
	}

	const ret = {
		id: user ? user._id : -1,
		firstName: user ? user.FirstName : "",
		lastName: user ? user.LastName : "",
		username: user ? user.Username : "",
		error: error,
	};

	res.status(error ? 500 : 200).json(ret);
});

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader(
		"Access-Control-Allow-Headers",
		"Origin, X-Requested-With, Content-Type, Accept, Authorization"
	);
	res.setHeader(
		"Access-Control-Allow-Methods",
		"GET, POST, PATCH, DELETE, OPTIONS"
	);
	next();
});

// app.listen(5000); // start Node + Express server on port 5000
app.listen(PORT, () => {
	console.log("Server listening on port " + PORT);
});
