const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.json());

const mongoDB = 'mongodb+srv://nppatel9997:Neel123mongo@tutorial5.wgoqkq3.mongodb.net/?retryWrites=true&w=majority&appName=Tutorial5';
mongoose.connect(mongoDB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.error(err));

const userSchema = new mongoose.Schema({
  email: String,
  firstName: String
}, {
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id.toString(); 
      delete ret._id;  // Delete _id
      delete ret.__v;  // Delete __v
    },
    virtuals: true  
  }
});

const User = mongoose.model('User', userSchema);

// Get all users from db
app.get('/users', async (req, res) => {
    try {
        const users = await User.find(); 
        const transformedUsers = users.map(user => user.toJSON());
        res.json({ message: "Users retrieved", success: true, users: transformedUsers });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving users", success: false });
    }
});

// Add a new user into db
app.post('/add', async (req, res) => {
    const { email, firstName } = req.body;
    if (!email || !firstName) {
        return res.status(400).json({ message: "Missing email or firstName", success: false });
    }
    try {
        const newUser = new User({ email, firstName });
        await newUser.save();
        res.status(201).json({ message: "User added", success: true, user: newUser.toJSON() });
    } catch (err) {
        res.status(500).json({ message: "Error adding user", success: false });
    }
});

// Update an existing user
app.put('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { email, firstName } = req.body;
    try {
        const user = await User.findByIdAndUpdate(id, { email, firstName }, { new: true });
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        res.json({ message: "User updated", success: true, user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ message: "Error updating user", success: false });
    }
});

// Get a single user by ID
app.get('/user/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        res.json({ success: true, user: user.toJSON() });
    } catch (err) {
        res.status(500).json({ message: "Error retrieving user", success: false });
    }
});

// Delete a user by ID
app.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await User.findByIdAndDelete(id);
        if (result) {
            res.json({ success: true, message: "User deleted" });
        } else {
            return res.status(404).json({ success: false, message: "User not found" });
        }
    } catch (err) {
        res.status(500).json({ success: false, message: "Error deleting user" });
    }
});


app.listen(port, () => console.log(`Server listening on port ${port}!`));
