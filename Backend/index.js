const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 5001
const my-app_URL = 'https://projectk-main-3.onrender.com';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://REDDY:CHANTI@cluster0.immqz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));

// Define the User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

// Registration Route
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    // Check if all fields are provided
    if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({ username, email, password: hashedPassword });

        // Save the user to the database
        await newUser.save();

        // Send a success response
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error); // Log the error

        // Handle duplicate username or email
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Username or email already exists' });
        }

        // Handle other errors
        res.status(500).json({ message: 'User registration failed', error });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: 'Username and password are required' });
    }

    try {
        // Find the user by username
        const user = await User.findOne({ username });

        // If user not found, return an error
        if (!user) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Compare the password with the stored hashed password
        const match = await bcrypt.compare(password, user.password);

        // If passwords do not match, return an error
        if (!match) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }

        // Send a success response with user details (excluding password)
        res.status(200).json({ 
            message: 'Login successful',
            user: {
                username: user.username,
                email: user.email,
            }
        });
    } catch (error) {
        console.error('Login error:', error); // Log the error
        res.status(500).json({ message: 'Login failed', error });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
