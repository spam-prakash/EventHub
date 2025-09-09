const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET

const fetchuser = (req, res, next) => {
    const token = req.header('auth-token')
    if (!token) {
        return res.status(401).json({ success: false, error: "Plase authenticate using valid token." })
    }
    try {
        const data = jwt.verify(token, JWT_SECRET)
        req.user = data.user || data
        if (!req.user.id) {
            return res.status(401).json({ error: "Invalid token structure" })
        }
        next()
    } catch (error) {
        console.error('Token verification error:', error)
        return res.status(401).json({ error: 'Please authenticate using a valid token' })
    }
}

module.exports = fetchuser