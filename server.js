const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const ExifParser = require("exif-parser");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const { MongoClient } = require("mongodb");
const PORT = process.env.PORT || 5000;
const app = express();
app.set("port", process.env.PORT || 5000);
const initRoutes = require("./routes");

// Server static assets if in production
if (process.env.NODE_ENV === "production") {
	// Set static folder
	app.use(express.static("frontend/build"));
	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
	});
}

var corsOptions = {
	origin: "https://cop4331-g6-lp-c6d624829cab.herokuapp.com/"
  };

// Your MongoDB connection string
// const uri = "mongodb+srv://thebeast:COP4331-G6@cop4331-g6-lp.rvnbxnv.mongodb.net/?retryWrites=true&w=majority&appName=COP4331-G6-LP";
require("dotenv").config();
const url = process.env.MONGODB_URI;
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));


app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
initRoutes(app);


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
	}
	catch (e) {
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

// // Upload image route
// app.post("/api/uploadimage", upload.single("image"), async (req, res) => {
// 	try {
// 		if (!req.file) {
// 			return res.status(400).json({ error: "No image file uploaded" });
// 		}

// 		// Extract additional information from request body
// 		const { locationId, userId, description } = req.body;
// 		const filename = req.file.filename;

// 		// Parse image metadata to extract timestamp, latitude, and longitude
// 		const exifData = await parseExifData(req.file.buffer);
// 		const { timestamp, latitude, longitude } = extractMetadata(exifData);

// 		// Save the uploaded image to GridFS
// 		const fileId = await saveImageToGridFS(req.file.buffer, filename);

// 		// Create a new image document with the extracted information
// 		const newImage = {
// 			LocationID: locationId,
// 			UserID: userId,
// 			ImageURL: fileId, // Using fileId as ImageURL
// 			Description: description,
// 			Timestamp: timestamp || new Date(), // Use current time if timestamp not found in metadata
// 			Latitude: latitude,
// 			Longitude: longitude,
// 		};

// 		// Save the new image document to the Images collection
// 		const db = client.db("COP4331-G6-LP");
// 		const result = await db.collection("Images").insertOne(newImage);

// 		res.status(200).json({ success: true, image: newImage });
// 	} catch (error) {
// 		console.error("Error uploading image:", error);
// 		res.status(500).json({ error: "Failed to upload image" });
// 	}
// });

// // Function to save the uploaded image to GridFS
// async function saveImageToGridFS(imageBuffer, filename) {
// 	return new Promise((resolve, reject) => {
// 		const writestream = gfs.createWriteStream({
// 			filename: filename,
// 		});
// 		writestream.on("close", file => {
// 			resolve(file._id);
// 		});
// 		writestream.on("error", error => {
// 			reject(error);
// 		});
// 		writestream.end(imageBuffer);
// 	});
// }

// // Function to parse image metadata using exif-parser
// function parseExifData(buffer) {
// 	return new Promise((resolve, reject) => {
// 		try {
// 			const parser = ExifParser.create(buffer);
// 			const exifData = parser.parse();
// 			resolve(exifData);
// 		} catch (error) {
// 			reject(error);
// 		}
// 	});
// }

// // Function to extract relevant metadata (timestamp, latitude, longitude) from parsed exif data
// function extractMetadata(exifData) {
// 	let timestamp, latitude, longitude;

// 	if (exifData && exifData.tags) {
// 		timestamp = exifData.tags.DateTimeOriginal || null;
// 		latitude = exifData.tags.GPSLatitude || null;
// 		longitude = exifData.tags.GPSLongitude || null;
// 	}

// 	return { timestamp, latitude, longitude };
// }


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
