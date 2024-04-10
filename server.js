const express = require("express");

const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
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
const url = process.env.MONGODB_URI;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));
app.use(cors());
app.use(bodyParser.json());

// Set up email transporter
let transporter = nodemailer.createTransport({
	host: 'email-smtp.us-east-1.amazonaws.com', // Amazon SES SMTP endpoint
	port: 587,
	secure: false,
	auth: {
		user: smtpUsername, // SMTP username
		pass: smtpPassword // SMTP password
	}
});

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const generateFileName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

/////////////// IMAGE ENDPOINTS ///////////////

// Fetch Images Endpoint
app.get('/api/posts/:username/:locationId?', async (req, res) => {
	try {
		const username = req.params.username;
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
// some issue here
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
// some issues here
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
		const validationToken = generateValidationToken(); // You need to implement this function

		// Create new user
		const newUser = {
			FirstName: firstName,
			LastName: lastName,
			Username: username,
			Email: email,
			Password: hashedPassword,
			ValidationToken: validationToken,
			Validated: false,
		};
		const result = await db.collection("Users").insertOne(newUser);

		// Send email validation
		sendValidationEmail(email, validationToken);

		res.status(200).json({ message: "User created successfully. Validation email sent." });
	} catch (e) {
		console.error('Error creating user:', e);
		res.status(500).json({ error: "An error occurred while creating user" });
	}
});

function generateValidationToken() {
	return uuidv4();
}

async function sendValidationEmail(email, validationToken) {
	const mailOptions = {
		from: 'MemoryMap <memorymap.mern@gmail.com>',
		to: email,
		subject: 'MemoryMap Email Verification',
		text: `Please click on the following link to verify your email: https://memorymap.xyz/validate?token=${validationToken}`,
		html: `<p>Please click on the following link to verify your email: https://memorymap.xyz/validate?token=${validationToken}</p>`
	};

	await transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.error(err);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

app.get('/api/validate', async (req, res) => {
	const { token } = req.query;

	try {
		const db = client.db('COP4331-G6-LP');

		// Find user by validation token
		const user = await db.collection('Users').findOne({ ValidationToken: token });

		if (!user) {
			return res.status(404).json({ error: 'User not found or invalid token' });
		}

		// Update user's validation status
		await db.collection('Users').updateOne({ _id: user._id }, { $set: { Validated: true } });

		return res.status(200).json({ message: 'Email validated successfully' });
	} catch (error) {
		console.error('Error validating email:', error);
		return res.status(500).json({ error: 'An error occurred while validating email' });
	}
});

// Resend Verification Email Endpoint
app.post("/api/resend-verification", async (req, res) => {
	const { email } = req.body;

	try {
		const db = client.db('COP4331-G6-LP');

		// Check if the user exists
		const user = await db.collection('Users').findOne({ Email: email });
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Check if the user is already validated
		if (user.Validated) {
			return res.status(400).json({ error: 'User is already validated' });
		}

		// Generate a new validation token
		const validationToken = generateValidationToken();

		// Update the user's validation token in the database
		await db.collection('Users').updateOne({ _id: user._id }, { $set: { ValidationToken: validationToken } });

		// Send the new verification email
		await sendValidationEmail(email, validationToken);

		return res.status(200).json({ message: 'Verification email resent successfully' });
	} catch (error) {
		console.error('Error resending verification email:', error);
		return res.status(500).json({ error: 'An error occurred while resending verification email' });
	}
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
