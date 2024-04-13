const express = require("express");

const multer = require("multer");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { v4: uuidv4 } = require('uuid');
const sharp = require("sharp");
const exifParser = require("exif-parser");
const axios = require("axios");
const path = require("path");
const PORT = process.env.PORT || 5000;

const { uploadFile, deleteFile, getObjectSignedUrl } = require('./s3.js');

const app = express();
app.set("port", process.env.PORT || 5000);


require("dotenv").config();
const url = process.env.MONGODB_URI;
const smtpUsername = process.env.SMTP_USERNAME;
const smtpPassword = process.env.SMTP_PASSWORD;
const gMapsKey = process.env.GMAPS_API_KEY;
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
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
// when specifying location id, it's not returning the images with those ids just all of them
app.get('/posts/:username/:locationId?', async (req, res) => {
	try {
		const username = req.params.username;
		const locationId = req.params.locationId;
		// console.log(locationId);
		const db = client.db('COP4331-G6-LP');
		const query = { username: username };
		const locationsCollection = db.collection('Locations');

		// If a locationId is provided, add it to the query
		if (locationId) {
			const location = await locationsCollection.findOne({ _id: new ObjectId(locationId) });
			if (!location) {
				return res.status(404).send('Location not found.');
			}
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
app.post('/posts', upload.array('image', 10), async (req, res) => {
	try {
		const files = req.files;
		const caption = req.body.caption;
		const username = req.body.username;
		const locationId = req.body.locationId; // Get the locationId from the request body
		const db = client.db('COP4331-G6-LP');
		const postsCollection = db.collection('Images');

		const user = await db.collection("Users").findOne({ Username: username });
		if (!user) {
			return res.status(400).json({ error: 'User not found.' });
		}

		for (let file of files) {
			const imageName = generateFileName();

			const fileBuffer = file.buffer;

			// Extract EXIF data
			// const parser = exifParser.create(file.buffer);
			// const result = parser.parse();
			// let latitude, longitude;
			// if (result && result.tags && result.tags.GPSLatitude && result.tags.GPSLongitude) {
			// 	latitude = result.tags.GPSLatitude;
			// 	longitude = result.tags.GPSLongitude;
			// } else {
			// 	console.log('No EXIF data found.');
			// 	latitude = null;
			// 	longitude = null;
			// }

			await uploadFile(fileBuffer, imageName, file.mimetype);

			const post = await postsCollection.insertOne({
				imageName,
				caption,
				username,
				locationId,
				date: new Date(),
			});
		}

		res.status(201).send('All images have been uploaded and added to the database.');
	} catch (e) {
		console.error(e);
		res.status(500).send('An error occurred while creating the post.');
	}
});


/// Modify Lat and Long on images
app.put('/posts/:_id', async (req, res) => {
	try {
		const _id = req.params._id;
		const { latitude, longitude } = req.body;
		const db = client.db('COP4331-G6-LP');
		const postsCollection = db.collection('Images');

		// Find the post by its ID
		const post = await postsCollection.findOne({ _id: new ObjectId(_id) });

		if (!post) {
			return res.status(404).json({ error: 'Post not found.' });
		}

		// Update the latitude and longitude of the post
		await postsCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { latitude, longitude } });

		res.status(200).send('Post updated successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while updating the post.');
	}
});


// Delete Image Endpoint
// some issue here, needs testing
app.delete("/posts/:_id", async (req, res) => {
	try {
		const _id = req.params._id;
		const db = client.db('COP4331-G6-LP');
		const postsCollection = db.collection('Images');

		// Find the post
		const post = await postsCollection.findOne({ _id: new ObjectId(_id) });
		if (!post) {
			return res.status(404).send('Post not found.');
		}

		// Delete the image from S3
		console.log(post.imageName);
		const deleteResult = await deleteFile(post.imageName);
		if (!deleteResult.success) {
			// If the image deletion failed, send an error response
			return res.status(500).send('An error occurred while deleting the image from S3.');
		}

		// Delete the post from the database
		await postsCollection.deleteOne({ _id: new ObjectId(_id) });

		res.send('Post deleted successfully.');
	} catch (e) {
		console.error(e);
		res.status(500).send('An error occurred while deleting the post.');
	}
});



/////////////// LOCATION ENDPOINTS ///////////////

// Create Location Endpoint
app.post("/api/locations", async (req, res) => {
	try {
		const { title, username, latitude, longitude } = req.body;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');

		// Use Google Maps Reverse Geocoding API to get location details from coordinates
		const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${gMapsKey}`);
		const locationDetails = response.data.results[0];

		// Insert the new location into the Locations collection
		const result = await locationsCollection.insertOne({
			locationName: locationDetails.formatted_address, // Use the formatted address from the Google Maps API
			title,
			username,
			latitude,
			longitude,
			// images: [] // Initialize an empty array for images
		});

		// Return the new location's ID in the response
		res.status(201).json({ message: 'Location created successfully.', markerId: result.insertedId });
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while creating the location.');
	}
});

// Modify Location Lat/Long
app.put("/api/locations/:_id", async (req, res) => {
	try {
		const _id = req.params._id;
		const { latitude, longitude } = req.body;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');

		// Find the location by its ID
		const location = await locationsCollection.findOne({ _id: new ObjectId(_id) });
		if (!location) {
			return res.status(404).send('Location not found.');
		}

		// Use Google Maps Reverse Geocoding API to get location details from coordinates
		const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${gMapsKey}`);
		const locationDetails = response.data.results[0];

		// Update the latitude, longitude, and location name of the location
		await locationsCollection.updateOne({ _id: new ObjectId(_id) }, { $set: { latitude, longitude, locationName: locationDetails.formatted_address } });

		res.status(200).send('Location updated successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while updating the location.');
	}
});

// Fetch Locations
app.get("/api/locations/:username", async (req, res) => {
	try {
		const username = req.params.username;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');

		// Find the locations associated with the username
		const locations = await locationsCollection.find({ username: username }).toArray();

		res.status(200).json(locations);
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while fetching the locations.');
	}
});

// Delete Location and Associated Images Endpoint
// some issues here, needs testing
app.delete("/api/locations/:_id", async (req, res) => {
	try {
		const _id = req.params._id;
		const db = client.db('COP4331-G6-LP');
		const locationsCollection = db.collection('Locations');
		const imagesCollection = db.collection('Images');

		// Find the location to delete
		const location = await locationsCollection.findOne({ _id: new ObjectId(_id) });
		if (!location) {
			return res.status(404).send('Location not found.');
		}
		
		// Make sure to also delete it from the s3 bucket

		// Delete all images associated with the location name
		await imagesCollection.deleteMany({ locationId: _id });

		// Delete the location
		await locationsCollection.deleteOne({ _id: new ObjectId(_id) });

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

app.get('/validate', async (req, res) => {
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

// Change User Data (name, email) make sure to reverify email
app.put("/api/users/:_id", async (req, res) => {
	try {
		const _id = req.params._id;
		const { firstName, lastName, email } = req.body;
		const db = client.db("COP4331-G6-LP");

		// Update the user's data
		await db.collection("Users").updateOne({ _id: new ObjectId(_id) }, { $set: { FirstName: firstName, LastName: lastName, Email: email } });

		res.send('User data updated successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while updating user data.');
	}
});


// Forgot Password Endpoint
app.post("/api/forgot-password", async (req, res) => {
	try {
		const { email } = req.body;
		const db = client.db("COP4331-G6-LP");
		const user = await db.collection("Users").findOne({ Email: email });

		if (!user) {
			return res.status(404).send('User not found.');
		}

		// Generate a password reset token and save it to the user's record
		const passwordResetToken = generatePasswordResetToken();
		await db.collection("Users").updateOne({ _id: user._id }, { $set: { PasswordResetToken: passwordResetToken } });

		// Send password reset email
		sendPasswordResetEmail(email, passwordResetToken);

		res.send('Password reset email sent.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while processing your request.');
	}
});

app.post('/reset-password', async (req, res) => {
	try {
		const { token } = req.query;
		const { newPassword } = req.body;
		const db = client.db('COP4331-G6-LP');

		// Find user by password reset token
		const user = await db.collection('Users').findOne({ PasswordResetToken: token });

		if (!user) {
			return res.status(404).json({ error: 'User not found or invalid token' });
		}

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password and remove the password reset token
		await db.collection('Users').updateOne({ _id: user._id }, { $set: { Password: hashedPassword, PasswordResetToken: null } });

		return res.status(200).json({ message: 'Password reset successfully' });
	} catch (error) {
		console.error('Error resetting password:', error);
		return res.status(500).json({ error: 'An error occurred while resetting password' });
	}
});


function generatePasswordResetToken() {
	return uuidv4();
}

async function sendPasswordResetEmail(email, passwordResetToken) {
	const mailOptions = {
		from: 'MemoryMap <memorymap.mern@gmail.com>',
		to: email,
		subject: 'MemoryMap Password Reset',
		text: `Please click on the following link to reset your password: https://memorymap.xyz/reset-password?token=${passwordResetToken}`,
		html: `<p>Please click on the following link to reset your password: https://memorymap.xyz/reset-password?token=${passwordResetToken}</p>`
	};

	await transporter.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.error(err);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}


// Change Password Endpoint
app.put("/api/users/:_id/password", async (req, res) => {
	try {
		const _id = req.params._id;
		const { newPassword } = req.body;
		const db = client.db("COP4331-G6-LP");

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the user's password
		await db.collection("Users").updateOne({ _id: new ObjectId(_id) }, { $set: { Password: hashedPassword } });

		res.send('Password updated successfully.');
	} catch (error) {
		console.error(error);
		res.status(500).send('An error occurred while updating the password.');
	}
});


// Add it so that it calls location fetching and returns all location information based on username
app.post("/api/login", async (req, res, next) => {
	const { login, password } = req.body;

	let error = "";
	let user;
	let locations = []; // Declare locations here

	try {
		const db = client.db("COP4331-G6-LP");

		// Find the user by either email or username
		user = await db.collection("Users").findOne({ $or: [{ Email: login }, { Username: login }] });
		if (user) {
			const passwordMatch = await bcrypt.compare(password, user.Password);
			if (!passwordMatch) {
				error = "Invalid credentials";
				user = null; // Invalidate user if password does not match
			}
		} else {
			error = "User not found";
		}

		// If there is no error, fetch the locations associated with the user
		if (!error) {
			locations = await db.collection('Locations').find({ username: user.Username }).toArray();
		}
	} catch (e) {
		error = e.toString();
	}

	const ret = {
		id: user ? user._id : -1,
		firstName: user ? user.FirstName : "",
		lastName: user ? user.LastName : "",
		username: user ? user.Username : "",
		validated: user ? user.Validated : false,
		locations: locations, // Add the locations to the response
		error: error,
	};

	res.status(error ? 500 : 200).json(ret);
});

// For Heroku deployment
// Server static assets if in production
if (process.env.NODE_ENV === "production") {
	// Set static folder
	app.use(express.static("frontend/build"));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "frontend", "build", "index.html"));
	});
}

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