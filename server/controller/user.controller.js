import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import getDataUri from "../utils/dataUri.js";
import User from "../models/user.model.js";
import cloudinary from "../utils/cloudinary.js";


// register controller here
export const register = async (req, res) => {
    const { firstName, lastName, email, password } = req.body
    try {
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All field are required."
            })
        }

        // define regex for email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email"
            });
        }
        // check password length
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters"
            });
        }

        // get user found or not
        const user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User alredy exist.Please login now."
            })
        }

        // hashed password here
        const hashed = await bcrypt.hash(password, 10)

        // create succes 
        await User.create({
            firstName,
            lastName,
            email,
            password: hashed
        })
        return res.status(201).json({
            success: true,
            message: "Account Created Successfully"
        })
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to register" || error.message
        })
    }
}

// login controller here
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All field are reqired."
            })
        }

        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            })
        }

        const isPasswordMatch = bcrypt.compare(password, user.password)
        if (!isPasswordMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect email or password"
            })
        }

        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, { expiresIn: '7d' })
        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpsOnly: true, sameSite: "None", secure: true }).json({
            success: true,
            message: `Welcome back ${user.firstName}`,
            user
        })

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Failed to Login",
        })
    }
}

// logout user here
export const logout = async (_, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}

// update profile here
export const updateProfile = async (req, res) => {
    try {
        const userId = req.id
        const { firstName, lastName, occupation, bio, instagram, facebook, linkedin, github } = req.body;
        const file = req.file;

        // get image user in dateuri here
        const fileUri = getDataUri(file)
        let cloudResponse = await cloudinary.uploader.upload(fileUri)

        const user = await User.findById(userId).select('-password')
        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false
            })
        }
        if (firstName) user.firstName = firstName
        if (lastName) user.lastName = lastName
        if (occupation) user.occupation = occupation
        if (instagram) user.instagram = instagram
        if (facebook) user.facebook = facebook
        if (linkedin) user.linkedin = linkedin
        if (github) user.github = github
        if (bio) user.bio = bio
        if (file) user.photoUrl = cloudResponse.secure_url

        await user.save()
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

// get all user
export const allUser = async (req, res) => {
    try {
        const user = await User.find().select('-password')
        res.status(200).json({
            success: true,
            message: "User list fetched successfully",
            total: user.length,
            user
        });
    } catch (error) {
        console.error("Error fetching user list:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch users"
        });
    }
}