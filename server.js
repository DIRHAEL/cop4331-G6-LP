const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const GridFsStorage = require("mongoose-gridfs-storage");
const multer = require("multer");
const Grid = require("gridfs-stream");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 5000;
const app = express();
app.set ("port", (process.env.PORT || 5000));
// For Heroku deployment

// Server static assets if in production
if (process.env.NODE_ENV === 'production') 
{
  // Set static folder
  app.use(express.static('frontend/build'));

  app.get('*', (req, res) => 
 {
	res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'));
  });
}


// Your MongoDB connection string
// const uri = "mongodb+srv://thebeast:COP4331-G6@cop4331-g6-lp.rvnbxnv.mongodb.net/?retryWrites=true&w=majority&appName=COP4331-G6-LP";
require ('dotenv').config();
const url = process.env.MONGODB_URI;
// const MongoClient = require("mongodb").MongoClient;
// const client = new MongoClient(url);
// client.connect(console.log("mongodb connected"));

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
	gfs = new mongoose.mongo.GridFSBucket(conn.db, {
		bucketName: "images"
  	});
	console.log("MongoDB connected");
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());


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
  	} 
	catch (e) {
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
		error: error
	};

	res.status(error ? 500 : 200).json(ret);
});

// API endpoint to upload image
app.post("/api/uploadimage", upload.single("image"), (req, res) => {
	if (!req.file) {
		return res.status(400).json({ error: "No file uploaded" });
	}
	const { ImageID, LocationID, UserID, Description, Timestamp } = req.body;
	const image = {
		LocationID,
		UserID,
		ImageURL: req.file.filename, // Store filename in database
		Description,
		Timestamp
	};
	// Save image metadata to MongoDB
	conn.db.collection("Images").insertOne(image, (err, result) => {
	  if (err) {
		return res.status(500).json({ error: err.message });
	  }
	  res.status(200).json({ success: true });
	});
});

app.post("/api/download/:filename", async (req, res) => {
	

});

app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization'
	);
	res.setHeader(
		'Access-Control-Allow-Methods',
		'GET, POST, PATCH, DELETE, OPTIONS'
	);
	next();
});

// app.listen(5000); // start Node + Express server on port 5000
app.listen(PORT, () => 
{
  console.log('Server listening on port ' + PORT);
});

