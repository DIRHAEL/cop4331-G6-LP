const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const AWS = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const ExifImage = require("exif").ExifImage;
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sharp = require("sharp");
const path = require("path");
const PORT = process.env.PORT || 5000;
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


AWS.config.update({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

const upload = multer({
	storage: multerS3({
		s3: s3,
		bucket: 'mindmapimages',
		acl: 'public-read',
		metadata: async function (req, file, cb) {
			const metadata = await sharp(file.stream).metadata();
			cb(null, { fieldName: file.fieldname, ...metadata });
		},
		key: function (req, file, cb) {
			cb(null, Date.now().toString())
		}
	})
});

app.post('/upload', upload.array('file', 10), async (req, res) => {
	if (!req.files) {
		return res.status(400).json({ error: 'No files were uploaded.' });
	}

	const { username } = req.body;

	try {
		const db = client.db("COP4331-G6-LP");

		// Find the user
		const user = await db.collection("Users").findOne({ Username: username });
		if (!user) {
			return res.status(400).json({ error: 'User not found.' });
		}

		// Link the files to the user and location
		for (let file of req.files) {
			// Read the image metadata
			const metadata = await sharp(file.buffer).metadata();
			const { latitude, longitude } = metadata.exif.gps;

			const locationName = `${latitude}, ${longitude}`;

			// Find or create the location
			let location = await db.collection("Locations").findOne({ Name: locationName });
			if (!location) {
				location = await db.collection("Locations").insertOne({ Name: locationName });
			}

			const image = {
				url: file.location, // URL of the image stored in S3
				userId: user._id,
				locationId: location._id
			};
			await db.collection("Images").insertOne(image);
		}

		res.json({ files: req.files });
	} catch (e) {
		res.status(500).json({ error: e.toString() });
	}
});

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
