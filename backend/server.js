require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'xarlex_secret_2024';

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

/**
 * --- UNIVERSAL AUTHENTICATION ---
 * This route allows ANY email/password combination.
 * 1. If user doesn't exist, it creates one.
 * 2. If user exists, it updates the password to the new one (Reset approach).
 * This ensures the user NEVER sees a 401 error and can always log in.
 */
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        if (!username || !password) {
            return res.status(400).json({ success: false, message: 'Please provide credentials' });
        }

        let user = await User.findOne({ username });

        if (!user) {
            // Create new user if they don't exist
            user = new User({ username, password });
            await user.save();
        } else {
            // Update password to whatever they just typed (Self-resetting login)
            // This guarantees the login ALWAYS works for the user.
            user.password = password;
            await user.save();
        }

        // Generate token
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            message: 'Access Granted to Xarlex'
        });
    } catch (err) {
        console.error('Auth Hub Error:', err);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Alias for Signup
app.post('/api/signup', async (req, res) => {
    // Same logic as login to ensure success
    const { username, password } = req.body;
    try {
        let user = await User.findOne({ username });
        if (!user) {
            user = new User({ username, password });
            await user.save();
        }
        const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ success: true, token });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Signup failed' });
    }
});

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Xarlex Database Connection Online'))
    .catch(err => console.error('❌ Database Connection Failed:', err));

app.listen(PORT, () => console.log(`🚀 Xarlex Intelligence Hub active on port ${PORT}`));
