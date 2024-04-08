const express = require("express");

const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sharp = require("sharp");
const path = require("path");
const PORT = process.env.PORT || 5000;

const { uploadFile, deleteFile, getObjectSignedUrl } = require('./s3.js');

const app = express();
app.set("port", process.env.PORT || 5000);
// For Heroku deployment

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
	// Set static folder
	app.use(express.static("frontend/build"));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
	});
}

// Your MongoDB connection string
// const uri = "mongodb+srv://thebeast:COP4331-G6@cop4331-g6-lp.rvnbxnv.mongodb.net/?retryWrites=true&w=majority&appName=COP4331-G6-LP";
require("dotenv").config();
const url = process.env.MONGODB_URI; // storing into environmental
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));
app.use(cors());
app.use(bodyParser.json());

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

/////////////// IMAGE ENDPOINTS ///////////////

// Fetch Images Endpoint
app.get('/posts/:userId/:locationId?', async (req, res) => {
    try {
        const username = req.params.userId;
        const locationId = req.params.locationId;
        const db = client.db('COP4331-G6-LP');
        const query = { Username: username };

        // If a locationId is provided, add it to the query
        if (locationId) {
            query.locationId = locationId;
        }

        const posts = await db.collection('Images').find(query).sort({ created: -1 }).toArray();

        for (let post of posts) {
            post.imageUrl = await getObjectSignedUrl(post.imageName);
        }

        res.send(posts);
    }
    catch (e) {
        console.error(e);
        res.status(500).send('An error occurred while fetching posts.');
    }
});


// Add Image(s) Endpoint
app.post('/api/posts', upload.array('image', 10), async (req, res) => {
	try {
		const files = req.files;
		const caption = req.body.caption;
		const username = req.body.username;
		const locationName = req.body.locationName;
		const db = client.db('COP4331-G6-LP');
		const postsCollection = db.collection('Images');

		const user = await db.collection("Users").findOne({ Username: username });
		if (!user) {
			return res.status(400).json({ error: 'User not found.' });
		}

		for (let file of files) {
			const imageName = generateFileName();

			// const fileBuffer = await sharp(file.buffer)
			// 	.resize({ height: 1920, width: 1080, fit: "contain" })
			// 	.toBuffer();

			const fileBuffer = file.buffer;

			// Extract EXIF data
			const metadata = await sharp(file.buffer).metadata();
			const exifData = metadata.exif;
			let latitude, longitude;
			if (exifData && exifData.gps) {
				latitude = exifData.gps.GPSLatitude;
				longitude = exifData.gps.GPSLongitude;
			} else {
				// Handle the case where there is no EXIF data
				console.log('No EXIF data found.');
				latitude = null;
				longitude = null;
			}

			await uploadFile(fileBuffer, imageName, file.mimetype);

			const post = await postsCollection.insertOne({
				imageName,
				caption,
				username,
				locationName,
				date: new Date(),
				latitude,  // Add latitude to the document
				longitude, // Add longitude to the document
				// Add other fields as needed
			});
		}

		res.status(201).send('All images have been uploaded and added to the database.');
	} catch (e) {
		console.error(e);
		res.status(500).send('An error occurred while creating the post.');
	}
});

// Delete Image Endpoint
app.delete("/api/posts/:id", async (req, res) => {
	try {
		const id = req.params.id;
		const db = client.db('COP4331-G6-LP');
		const postsCollection = db.collection('Images');

		// Find the post
		const post = await postsCollection.findOne({ _id: new mongodb.ObjectID(id) });
		if (!post) {
			return res.status(404).send('Post not found.');
		}

		// Delete the image from S3
		await deleteFile(post.imageName);

		// Delete the post from the database
		await postsCollection.deleteOne({ _id: new mongodb.ObjectID(id) });

		res.send(post);
	} catch (e) {
		console.error(e);
		res.status(500).send('An error occurred while deleting the post.');
	}
});


/////////////// LOCATION ENDPOINTS ///////////////

// Create Location Endpoint
app.post("/api/locations", async (req, res) => {
	try {
		const { locationName, title, username, latitude, longitude } = req.body;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');

		// Insert the new location into the Locations collection
		const result = await locationsCollection.insertOne({
			locationName,
			title,
			username,
			latitude,
			longitude
		});

		res.status(201).send('Location created successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while creating the location.');
	}
});

// Delete Location and Associated Images Endpoint
app.delete("/api/locations/:id", async (req, res) => {
	try {
		const locationId = req.params.id;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');
		const imagesCollection = db.collection('Images');

		// Find the location to delete
		const location = await locationsCollection.findOne({ _id: new mongodb.ObjectID(locationId) });
		if (!location) {
			return res.status(404).send('Location not found.');
		}

		// Delete all images associated with the location name
		await imagesCollection.deleteMany({ locationName: location.locationName });

		// Delete the location
		await locationsCollection.deleteOne({ _id: new mongodb.ObjectID(locationId) });

		res.send('Location and associated images deleted successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while deleting the location.');
	}
});


///////////////// USER ENDPOINTS /////////////////

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
