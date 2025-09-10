const express = require('express')
const User = require('../models/User')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const fetchuser = require('../middleware/fetchuser')
const otpGenerator = require('otp-generator')
const crypto = require('crypto')
const passport=require('passport')
const sendMail = require('./mailer')


const otpStore = {}

const JWT_SECRET = process.env.JWT_SECRET


// Route to Generate OTP POST "/api/auth/generateotp"
router.post('/generateotp', [
    body('email', 'Enter a valid Email').isEmail()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    const { email } = req.body
    const otp = otpGenerator.generate(6, { lowerCaseAlphabets: false, upperCaseAlphabets: false, specialChars: false })
    // console.log(otp)
    otpStore[email] = otp
    // console.log(otpStore)
    const subject = 'Your OTP for EventHub Signup'
    const text = `Your OTP for signing up on EventHub is ${otp}. It is valid for 10 minutes.`
    const html = `<p>Your OTP for signing up on EventHub is <strong>${otp}</strong>. It is valid for 10 minutes.</p>`

    try {
        await sendMail(email, subject, text, html)
        res.json({ success: true, message: 'OTP sent to email' })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }
})

// Route 1: Create a User using POST "/api/auth/createuser"
router.post('/createuser', [
    body('username', 'Enter a valid username').isLength({ min: 5 }),
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid Email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 3 }),
    body('otp', 'Enter a valid OTP').isLength({ min: 6, max: 6 }),
    body('phone', 'Enter a valid Phone number').isLength({ min: 10, max: 10 })
], async (req, res) => {
    let success = false
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ success, errors: errors.array() })
    }

    const { username, name, email, password, accountType, otp, phone } = req.body

    // Verify OTP
    if (otpStore[email] !== String(otp)) {
        return res.status(400).json({ success: false, error: 'Invalid OTP' })
    }

    try {
        let user = await User.findOne({ email })
        if (user) {
            return res.status(400).json({ success: false, error: 'A user with this email already exists' })
        }
        user = await User.findOne({ username })
        if (user) {
            return res.status(400).json({ success: false, error: 'A user with this username already exists' })
        }
        user = await User.findOne({ phone })
        if (user) {
            return res.status(400).json({ success: false, error: 'A user with this phone already exists' })
        }
        const salt = await bcrypt.genSalt(10)
        const secPass = await bcrypt.hash(password, salt)

        user = await User.create({
            username, name, email, password: secPass, accountType, phone
        })
        const data = {
            user: {
                id: user.id
            }
        }
        const authToken = jwt.sign(data, JWT_SECRET)
        success = true;
        res.json({ success, authToken })

        const subject = 'Welcome to EventHub'
        const text = `Hello ${user.name},\n\nThank you for signing up for EventHub. We are excited to have you on board!\n\nBest regards,\nThe EventHub Team`
        const html = `<p>Hello ${user.name},</p><p>Thank you for signing up for EventHub. We are excited to have you on board!</p><p>Best regards,<br>The EventHub Team</p>`
        await sendMail(user.email, subject, text, html)
        // Clear OTP from store
        delete otpStore[email]
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }
}
)


// Route 2: Authenticate Using POST "/api/auth/login"
router.post('/login', [
    body('identifier', 'Enter a valid email or username').notEmpty(),
    body('password', 'Password cannot be blank').notEmpty()
], async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const { identifier, password } = req.body;
    // console.log(password)
    try {
        const user = await User.findOne({
            $or: [
                { email: identifier },
                { username: identifier }
            ]
        })
        if (!user) {
            return res.status(400).json({ error: 'User does not exists' })
        }
        const passwordCompare = await bcrypt.compare(password, user.password)
        if (!passwordCompare) {
            return res.status(400).json({ error: "Invalid Credentials" })
        }

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET)
        res.json({ success: true, authToken, email: user.email, name: user.name, username: user.username, AccountType: user.accountType })
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }
}
)

// ROUTE 3: GET LOGGEDIN USER DETAILS POST: "/api/auth/getuser" LOGIN REQUIRE
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id
        const user = await User.findById(userId).select('-password')
        res.send(user)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('Internal Server Error')
    }
})


// Routes for google SignUp
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google callback
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login", session: false }),
    async (req, res) => {
        try {
            // req.user is set by passport (from passport.js file)
            const user = req.user;

            // Send Welcome note yo new Users
            if (user && user.isNewUser) {
                const subject = 'Welcome to EventHub';
                const text = `Hello ${user.name},\n\nThank you for signing up for EventHub. We are excited to have you on board!\n\nBest regards,\nThe EventHub Team`;
                const html = `<p>Hello ${user.name},</p>
                      <p>Thank you for signing up for EventHub. We are excited to have you on board!</p>
                      <p>Best regards,<br>The EventHub Team</p>`;

                await sendMail(user.email, subject, text, html);
            }

            // Generate JWT for logged-in user
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            res.json({ success: true, token, user });
        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: "Internal Server Error" });
        }
    }
);



module.exports = router
