import userModel from "../models/userModel.js";
import bcrypt from "bcrypt"
import validator from "validator"
import jwt from "jsonwebtoken"

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET)
}

// Route for user login
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({
            email
        });
        if (!user) {
            return res.json({
                success: false,
                message: "User does not exists"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }
        const token = createToken(user._id)
        res.json({ success: true, token })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}

// Route for user registration
const registerUser = async (req, res) => {
    {
        try {
            let saltSeed = 10;
            const { name, email, password } = req.body;
            // checking user is already exists
            const exists = await userModel.findOne({ email });
            if (exists) {
                return res.json({
                    success: false,
                    message: "User already exists"
                })
            }

            // validateing email format & strong password
            if (!validator.isEmail(email)) {
                return res.json({
                    success: false,
                    message: "Please enter valid Email address"
                })
            }
            if (password.length < 8) {
                return res.json({
                    success: false,
                    message: "Please enter Strong password"
                })
            }

            // hashing user password
            const salt = await bcrypt.genSalt(saltSeed)
            const hashedPasssword = await bcrypt.hash(password, salt);

            const newUser = new userModel({
                name,
                email,
                password: hashedPasssword
            })

            const user = await newUser.save()
            const token = createToken(user._id)
            res.json({ success: true, token })

        } catch (error) {
            console.log(error);
            res.json({ success: false, message: error.message })
        }
    }
}

// Route for admin login
const adminLogin = async (req, res) => {
    try {
        const {email, password} = req.body
        if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET)
            res.json({success: true, token})
        } else{
            res.status(401).json({success: false, message: "Invalid Credential"})
        }
    } catch (error) {
        
    }
}

export { loginUser, registerUser, adminLogin }