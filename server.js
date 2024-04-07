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
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const randomImageName = (bytes = 32) => crypto.randomBytes().toString('hex')

const bucketName = process.env.AWS_BUCKET_NAME;
const bucketRegion = process.env.AWS_REGION;
const accessKey = process.env.AWS_ACCESS_KEY_ID;
const secretKey = process.env.AWS_SECRET_ACCESS_KEY;

const s3 = new S3Client({
	credentials: {
		accessKeyId: accessKey,
		secretAccessKey: secretKey,
	},
	region: bucketRegion
});

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

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

upload.single('image');


app.get ('/api/images', async (req, res) => {
	const images = await db.collection('Images').findMany({orderBy: [{ created: 'desc' }]})
	res.send(images)
})

app.post('/api/images', upload.single('image'), async (req, res) => {
	console.log("req.body", req.body)
	console.log("req.file", req.file)

	// resize image
	const buffer = await sharp(req.file.buffer).resize({height: 1920, width: 1080, fit: "contain"}).toBuffer()

	const imageName = randomImageName()
	const params = {
		Bucket: bucketName,
		Key: imageName,
		Body: buffer,
		ContentType: req.file.mimetype,
	}
	
	const command = new PutObjectCommand(params)
	await s3.send(command)

	const db = client.db("COP4331-G6-LP");

	// save image to database
	const post = await db.collection('Images').insertOne({
		imageName: imageName,
		caption: req.body.caption,
	})

	
	res.send(post)
})

app.delete("/api/images/:id", async (req, res) => {
	const id = req.params.id
	res.send({})
})

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
