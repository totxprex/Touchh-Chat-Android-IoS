const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })
const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const helmet = require("helmet")


const app = express()
app.listen(5500, process.env.TestSeverURL, () => {
  console.log(`Server started at ${process.env.TestSeverURL}`)
})


const apiVersion = process.env.apiVersion
const { verifyKey } = require("./security/key.js")
const { hashPassword } = require("./security/hash.js")
const { verifyToken } = require("./security/token.js")
const { signUp } = require("./auth/signup.js")
const { login } = require("./auth/login.js")
const { getUser } = require("./user/get-user.js")
const { deactivate } = require("./user/de-activate-account.js")
const { profilePicUpdateApp } = require("./aws/update-profile-pic.js")
const { getAwsUrlApp } = require("./aws/get-aws-url.js")
const { contactApp } = require("./model/contacts/contact.js")
const { chatApp } = require("./model/rooms/chat.js")


mongoose.connect(process.env.mongoDB, {
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log("Mongoose database connected")).catch((err) => console.log(err))

app.use(express.static("./public"))
app.use(express.json())
app.use(morgan("dev"))
app.use(helmet())
app.use(express.json())



//verify key
app.param("key", verifyKey())

//verify token
app.param("token", verifyToken())

//hash password
app.use(hashPassword())



//signup 
app.post(`/touchh/mobile/api/${apiVersion}/:key/signup`, signUp())


//login
app.post(`/touchh/mobile/api/${apiVersion}/:key/login/:username`, login())



//Get a user
app.get(`/touchh/mobile/api/${apiVersion}/:key/:token/user/get/:username?`, getUser())

//de-activate account
app.delete(`/touchh/mobile/api/${apiVersion}/:key/:token/user/delete/:id`, deactivate())


//update profile pic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/user/pic`, profilePicUpdateApp)

app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/aws/url`, getAwsUrlApp)




//contact list logic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/contact`, contactApp)


//chat logic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/chat`, chatApp)



























































app.use((_req, res) => {
  res.status(400).send("No available route on this server")
})