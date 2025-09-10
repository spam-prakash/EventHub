const connectToMongo=require('./db')
const express=require('express')
const app=express()
const passport = require("passport");
require("./middleware/passport"); // <-- this is important
const userdb = require('./models/User')

const port=process.env.PORT||8080

connectToMongo()

app.use(express.json())
app.use(passport.initialize());

// Available Routes
app.use('/api/auth', require('./routes/auth'))
// app.use('/api/notes', require('./routes/notes'))
// app.use('/api/user', require('./routes/user')) // Ensure this line exists

// Test Route (Optional)
app.get('/', (req, res) => {
  res.send('Backend for EventHub')
})

// Start Server
app.listen(port, () => {
  console.log(`Website rendered to http://localhost:${port}`)
})