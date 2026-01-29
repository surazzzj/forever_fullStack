import userModel from "../models/userModel.js";
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import validator from 'validator';
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" }); // token valid 7 days
}

// REGISTER
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" });
        }

        if (!password || password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters" });
        }

        const exists = await userModel.findOne({ email });
        if (exists) return res.json({ success: false, message: "User already exists" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({ name, email, password: hashedPassword });
        const user = await newUser.save();

        const token = createToken(user._id);
        res.json({ success: true, message: "Registration successful", token, user: { _id: user._id, name: user.name, email: user.email, image: user.image || "" } });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// LOGIN 
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) return res.json({ success: false, message: "User does not exist" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });

        const token = createToken(user._id);
        res.json({ success: true, token, user: { _id: user._id, name: user.name, email: user.email, image: user.image || "" } });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// GET PROFILE
const getUserProfile = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID missing" });

        const userData = await userModel.findById(userId).select('-password');
        res.json({ success: true, userData });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// UPDATE PROFILE
const updateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const { name, email } = req.body;
        const imageFile = req.file;

        let updateData = { name, email };

        if (imageFile) {
            const cloudResult = await cloudinary.uploader.upload(imageFile.path, {
                folder: 'user-profile',
                resource_type: 'image'
            });

            updateData.image = cloudResult.secure_url;
            fs.unlinkSync(imageFile.path);
        }

        await userModel.findByIdAndUpdate(userId, updateData);
        res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// ADMIN LOGIN
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: "7d" });
            return res.json({ success: true, token });
        }
        res.json({ success: false, message: "Invalid credentials" });
    } catch (error) {
        res.json({ success: false, message: "Invalid credentials" });
    }
}

export { registerUser, loginUser, getUserProfile, updateProfile, adminLogin };
