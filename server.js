const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const path = require("path");
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
const url = process.env.MONGODB_URI;
const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(url);
client.connect(console.log("mongodb connected"));
app.use(cors());
app.use(bodyParser.json());

// let db;

// client.connect(err => {
// 	console.log("Connecting to MongoDB");
// 	if (err) {
// 		console.error("Failed to connect to MongoDB", err);
// 		process.exit(1);
// 	}
// 	else {
// 		console.log("MongoDB connected");
// 		db = client.db("COP4331-G6-LP");

// 		// Start the server after the DB connection is established
// 		app.listen(5000, () => {
// 			console.log("Server started on port 5000");
// 		});
// 	}
// });

app.post("/api/createuser", async (req, res, next) => {
	const { firstName, lastName, username, email, password } = req.body;
	
	// Hash the password
	const hashedPassword = await bcrypt.hash(password, 10);

	let error = '';

	try {
		const db = client.db("COP4331-G6-LP");
		const newUser = {
			FirstName : firstName, 
			LastName : lastName, 
			Username : username, 
			Email : email, 
			Password : hashedPassword
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
		username: user ? user.Username : "",
		lastName: user ? user.LastName : "",
		error: error
	};

	res.status(error ? 500 : 200).json(ret);
});

// app.listen(5000); // start Node + Express server on port 5000
app.listen(PORT, () => 
{
  console.log('Server listening on port ' + PORT);
});

