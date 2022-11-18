const dotenv = require("dotenv")
dotenv.config({ path: "./config.env" })
const express = require("express")
const mongoose = require("mongoose")
const morgan = require("morgan")
const helmet = require("helmet")
const cors = require("cors")


const app = express()
app.listen(process.env.PORT, () => {
  console.log(`Server started`)
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
const { newsApp } = require("./model/news/news.js")
const { updateUser } = require("./user/user-update.js")


mongoose.connect("mongodb+srv://totxprex:ajmclean@cluster0.qqqiapj.mongodb.net/Touchh-Mobile?retryWrites=true&w=majority", {
  useCreateIndex: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
  useNewUrlParser: true
}).then(() => console.log("Mongoose database connected")).catch((err) => console.log(err))

app.use(cors({
  methods: ["POST", "GET", "PATCH", "PUT"],
  credentials: true,
  origin: "*"
}))
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



//update a user document in db
app.patch(`/touchh/mobile/api/${apiVersion}/:key/:token/user/update/:id`, updateUser())



//de-activate account
app.delete(`/touchh/mobile/api/${apiVersion}/:key/:token/user/delete/:id`, deactivate())


//update profile pic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/user/pic`, profilePicUpdateApp)

app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/aws/url`, getAwsUrlApp)




//contact list logic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/contact`, contactApp)


//chat logic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/chat`, chatApp)



//news logic
app.use(`/touchh/mobile/api/${apiVersion}/:key/:token/news`, newsApp)



























































app.use((_req, res) => {
  res.status(400).send("No available route on this server")
})