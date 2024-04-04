const request = require('supertest');
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const app = require('./app'); // Import the express app

// Mock MongoDB and bcrypt using jest.mock
jest.mock('mongodb');
jest.mock('bcryptjs');

// Setting up mock functions for MongoDB operations
const mockCollection = {
  findOne: jest.fn(),
  insertOne: jest.fn(),
};
const mockDb = {
  collection: jest.fn(() => mockCollection),
};
const mockClient = {
  db: jest.fn(() => mockDb),
};
jest.mock('mongodb', () => ({
  MongoClient: {
    connect: jest.fn(() => Promise.resolve(mockClient)),
  },
}));

// Grouping tests for the /api/createuser endpoint
describe('POST /api/createuser', () => {
  // Test case for successful user creation
  it('should create a new user', async () => {
    // Mock the findOne method to simulate that neither the email nor the username exists in the DB
    mockCollection.findOne.mockResolvedValueOnce(null);
    mockCollection.findOne.mockResolvedValueOnce(null);

    // Mock bcrypt hash to return a hashed password
    bcrypt.hash.mockResolvedValue('hashedPassword');

    // Define the new user's data
    const newUser = {
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      email: 'john@example.com',
      password: 'password123',
    };

    // Send a POST request to create a new user and expect a 200 status code for success
    await request(app)
      .post('/api/createuser')
      .send(newUser)
      .expect(200);

    // Check if the findOne was called twice (for email and username) and insertOne was called with the correct user data
    expect(mockCollection.findOne).toHaveBeenCalledTimes(2);
    expect(mockCollection.insertOne).toHaveBeenCalledWith({
      FirstName: newUser.firstName,
      LastName: newUser.lastName,
      Username: newUser.username,
      Email: newUser.email,
      Password: 'hashedPassword',
    });
  });

  // Additional test cases would go here...
});

// Grouping tests for the /api/login endpoint
describe('POST /api/login', () => {
  // Test case for successful login
  it('should successfully login with correct credentials', async () => {
    // Create a mock user with hashed password
    const user = {
      _id: ObjectId(),
      FirstName: 'John',
      LastName: 'Doe',
      Username: 'johndoe',
      Email: 'john@example.com',
      Password: 'hashedPassword',
    };

    // Mock the findOne method to return the mock user
    mockCollection.findOne.mockResolvedValueOnce(user);

    // Mock bcrypt compare to return true for matching passwords
    bcrypt.compare.mockResolvedValueOnce(true);

    // Define login credentials
    const loginCredentials = {
      login: 'john@example.com',
      password: 'password123',
    };

    // Send a POST request to login and expect a 200 status code for success
    const response = await request(app)
      .post('/api/login')
      .send(loginCredentials)
      .expect(200);

    // Verify that the response contains the user's details without the password
    expect(response.body.id).toEqual(user._id.toString());
    expect(response.body.firstName).toBe(user.FirstName);
    expect(response.body.lastName).toBe(user.LastName);
    expect(response.body.username).toBe(user.Username);
    expect(response.body.error).toBe('');
  });

  // Additional test...
});

